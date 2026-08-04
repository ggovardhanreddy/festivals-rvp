/**
 * Media API (Cloudflare Pages Function)
 *
 * POST /api/media/upload — admin upload to R2 (or free Google Drive at ≥90% R2)
 * POST /api/media/reindex — rebuild catalog/albums.json from R2 listing
 * GET  /api/media/sign?key= — short-lived signed URL for private objects
 * GET  /api/media/object?key= — stream object via R2 binding (or redirect Drive)
 * GET  /api/media/usage — R2 usage + overflow status (admin)
 */

import {
  buildAlbumsFromR2Keys,
  isProtectedHeroKey,
  mediaCountOf,
  R2_ALBUMS_CATALOG_KEY,
  type R2ObjectRef,
} from "../../../lib/r2-catalog";
import { isCmsAlbum, isYearDir } from "../../../lib/cms";
import {
  IMAGE_MAX_UPLOAD_BYTES,
  VIDEO_MAX_BYTES,
} from "../../../lib/media-pipeline/constants";
import {
  deriveThumbKey,
  validateUpload,
} from "../../../lib/media-pipeline/validate";
import {
  isGoogleDriveConfigured,
  uploadToGoogleDrive,
} from "../../_lib/gdrive";
import {
  addTrackedR2Usage,
  recountR2Usage,
  shouldUseGoogleDriveOverflow,
} from "../../_lib/r2-usage";

interface Env {
  MEDIA?: R2Bucket;
  RATE_LIMIT?: KVNamespace;
  ADMIN_PASSWORD_HASH?: string;
  ADMIN_SESSION_SECRET?: string;
  MEMBER_SESSION_SECRET?: string;
  MEDIA_SIGNING_SECRET?: string;
  R2_PUBLIC_BASE?: string;
  R2_SOFT_LIMIT_BYTES?: string;
  GOOGLE_DRIVE_CLIENT_ID?: string;
  GOOGLE_DRIVE_CLIENT_SECRET?: string;
  GOOGLE_DRIVE_REFRESH_TOKEN?: string;
  GOOGLE_DRIVE_FOLDER_ID?: string;
  /** Optional: GitHub PAT with `repo` scope to trigger repository_dispatch */
  GITHUB_DISPATCH_TOKEN?: string;
  GITHUB_REPO?: string;
}

const GDRIVE_POINTER_MIME = "application/vnd.rvp.gdrive+json";

type MediaR2Range =
  | { offset: number; length?: number }
  | { suffix: number };

interface FunctionContext {
  request: Request;
  env: Env;
  params: { route?: string | string[] };
}

const R2_CATEGORIES = [
  "logos",
  "hero",
  "gallery",
  "events",
  "birthdays",
  "members",
  "developments",
  "funfest",
  "videos",
  "audio",
  "documents",
] as const;

const ALLOWED_EXT = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "heic",
  "heif",
  "avif",
  "tif",
  "tiff",
  "bmp",
  "mp4",
  "mov",
  "avi",
  "mkv",
  "webm",
  "m4v",
  "mpeg",
  "mpg",
  "3gp",
  "mp3",
  "wav",
  "aac",
  "m4a",
  "flac",
  "ogg",
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "zip",
  "svg",
  "ico",
]);

const encoder = new TextEncoder();

const base64url = (bytes: Uint8Array) => {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
};

async function hmacSign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return base64url(
    new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value))),
  );
}

function decodePayload(value: string) {
  try {
    const pad = value + "=".repeat((4 - (value.length % 4)) % 4);
    const b64 = pad.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(b64)) as { exp?: number; memberId?: string };
  } catch {
    return null;
  }
}

function json(
  data: unknown,
  status = 200,
  headers: Record<string, string> = {},
) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

function cors(origin: string) {
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-credentials": "true",
    "access-control-allow-headers": "content-type, authorization",
    "access-control-allow-methods": "GET,POST,OPTIONS",
  };
}

async function listAllKeys(
  bucket: R2Bucket,
  prefixes: string[],
): Promise<R2ObjectRef[]> {
  const out: R2ObjectRef[] = [];
  for (const prefix of prefixes) {
    let cursor: string | undefined;
    do {
      const page = await bucket.list({ prefix, cursor, limit: 1000 });
      for (const obj of page.objects) {
        out.push({
          key: obj.key,
          uploaded: obj.uploaded,
          size: obj.size,
        });
      }
      cursor = page.truncated ? page.cursor : undefined;
    } while (cursor);
  }
  return out;
}

async function maybeDispatchGithub(env: Env, reason: string) {
  const token = env.GITHUB_DISPATCH_TOKEN;
  const repo = env.GITHUB_REPO || "ggovardhanreddy/festivals-rvp";
  if (!token) return { dispatched: false as const, reason: "no token" };
  const res = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "content-type": "application/json",
      "user-agent": "festivals-rvp-reindex",
    },
    body: JSON.stringify({
      event_type: "content-sync",
      client_payload: { reason, source: "admin-reindex" },
    }),
  });
  return {
    dispatched: res.ok || res.status === 204,
    status: res.status,
    reason,
  };
}

function isPrivateKey(key: string) {
  return (
    key.startsWith("funfest/") ||
    key.includes("/funfest/") ||
    key.includes("fun-trips/") ||
    key.startsWith("documents/") ||
    key.includes("/private/")
  );
}

function extOf(name: string) {
  const parts = name.split(".");
  return (parts[parts.length - 1] || "").toLowerCase();
}

function sanitize(name: string) {
  return name.replace(/[^\w.\-()+ ]+/g, "_").slice(0, 180);
}

function guessMime(name: string, mime?: string) {
  if (mime && mime !== "application/octet-stream") return mime;
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    heic: "image/heic",
    avif: "image/avif",
    mp4: "video/mp4",
    mov: "video/quicktime",
    webm: "video/webm",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    pdf: "application/pdf",
    zip: "application/zip",
  };
  return map[extOf(name)] || "application/octet-stream";
}

async function requireAdmin(request: Request, env: Env) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)rvp_admin=([^;]+)/);
  if (!match?.[1] || !env.ADMIN_SESSION_SECRET) return false;
  const [value, sig] = match[1].split(".");
  if (!value || !sig) return false;
  const expected = await hmacSign(value, env.ADMIN_SESSION_SECRET);
  return sig === expected;
}

async function requireMember(request: Request, env: Env) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)rvp_member=([^;]+)/);
  if (!match?.[1]) return false;
  const [value, sig] = match[1].split(".");
  if (!value || !sig) return false;
  const secret =
    env.MEMBER_SESSION_SECRET ||
    env.ADMIN_SESSION_SECRET ||
    "rvp-funfest-dev-secret";
  const expected = await hmacSign(value, secret);
  if (sig !== expected) return false;
  const payload = decodePayload(value);
  return Boolean(payload?.memberId && payload.exp && Date.now() <= payload.exp);
}

export const onRequest = async ({ request, env, params }: FunctionContext) => {
  const url = new URL(request.url);
  const headers = cors(url.origin);
  if (request.method === "OPTIONS") return new Response(null, { headers });

  try {
    return await handleMedia({ request, env, params, url, headers });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Media API failed";
    return json({ error: message }, 500, headers);
  }
};

async function handleMedia({
  request,
  env,
  params,
  url,
  headers,
}: FunctionContext & { url: URL; headers: Record<string, string> }) {
  if (!env.MEDIA) {
    return json(
      {
        error:
          "R2 binding MEDIA is not configured. Bind the reddivaripalli bucket as MEDIA.",
      },
      503,
      headers,
    );
  }

  // Pages catch-all params may arrive as string[] — never call string methods raw
  const routeRaw = params.route;
  const fromParams = Array.isArray(routeRaw)
    ? routeRaw.join("/")
    : routeRaw || "";
  const fromPath = url.pathname.replace(/^\/api\/media\/?/, "");
  const route = (fromParams || fromPath).replace(/\/$/, "");

  if (route === "sign" && request.method === "GET") {
    const key = url.searchParams.get("key") || "";
    if (!key || key.includes("..") || key.startsWith("/")) {
      return json({ error: "Invalid key" }, 400, headers);
    }
    if (isPrivateKey(key)) {
      const adminOk = await requireAdmin(request, env);
      const memberOk = await requireMember(request, env);
      if (!adminOk && !memberOk) {
        return json({ error: "Unauthorized" }, 401, headers);
      }
    }
    const secret =
      env.MEDIA_SIGNING_SECRET || env.ADMIN_SESSION_SECRET || "dev";
    const exp = Date.now() + 15 * 60 * 1000;
    const sig = await hmacSign(`${key}:${exp}`, secret);
    const signed = `${url.origin}/api/media/object?key=${encodeURIComponent(key)}&exp=${exp}&sig=${sig}`;
    return json({ url: signed, exp }, 200, headers);
  }

  if (
    route === "object" &&
    (request.method === "GET" || request.method === "HEAD")
  ) {
    const key = url.searchParams.get("key") || "";
    const exp = Number(url.searchParams.get("exp") || "0");
    const sig = url.searchParams.get("sig") || "";
    if (!key || key.includes("..") || key.startsWith("/")) {
      return new Response("Bad request", { status: 400, headers });
    }
    if (isPrivateKey(key)) {
      const secret =
        env.MEDIA_SIGNING_SECRET || env.ADMIN_SESSION_SECRET || "dev";
      const expected = await hmacSign(`${key}:${exp}`, secret);
      if (!sig || sig !== expected || !exp || Date.now() > exp) {
        return new Response("Unauthorized", { status: 401, headers });
      }
    }

    const rangeHeader = request.headers.get("range");
    let range: MediaR2Range | undefined;
    if (rangeHeader) {
      const m = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader.trim());
      if (m) {
        const start = m[1] ? Number(m[1]) : undefined;
        const end = m[2] ? Number(m[2]) : undefined;
        if (start !== undefined && !Number.isNaN(start)) {
          range =
            end !== undefined && !Number.isNaN(end)
              ? { offset: start, length: end - start + 1 }
              : { offset: start };
        } else if (end !== undefined && !Number.isNaN(end)) {
          range = { suffix: end };
        }
      }
    }

    const obj = await env.MEDIA.get(key, range ? { range } : undefined);
    if (obj) {
      const backend = obj.customMetadata?.backend;
      const driveUrl = obj.customMetadata?.publicUrl;
      if (backend === "gdrive" && driveUrl) {
        return Response.redirect(driveUrl, 302);
      }
      if (obj.httpMetadata?.contentType === GDRIVE_POINTER_MIME) {
        try {
          const pointer = (await obj.json()) as { publicUrl?: string };
          if (pointer.publicUrl) {
            return Response.redirect(pointer.publicUrl, 302);
          }
        } catch {
          /* fall through */
        }
      }
    }
    if (!obj) return new Response("Not found", { status: 404, headers });
    const responseHeaders = new Headers(headers);
    obj.writeHttpMetadata(responseHeaders);
    responseHeaders.set("etag", obj.httpEtag);
    responseHeaders.set("accept-ranges", "bytes");
    responseHeaders.set(
      "cache-control",
      isPrivateKey(key)
        ? "private, max-age=300"
        : "public, max-age=31536000, immutable",
    );
    if (request.method === "HEAD") {
      return new Response(null, {
        status: range ? 206 : 200,
        headers: responseHeaders,
      });
    }
    return new Response(obj.body, {
      status: range ? 206 : 200,
      headers: responseHeaders,
    });
  }

  if (route === "upload" && request.method === "POST") {
    if (!(await requireAdmin(request, env))) {
      return json({ error: "Unauthorized" }, 401, headers);
    }
    const form = await request.formData();
    const file = form.get("file");
    const thumbFile = form.get("thumb");
    const category = String(form.get("category") || "gallery")
      .replace(/^\//, "")
      .replace(/\/$/, "");
    const originalName = sanitize(
      String(form.get("originalName") || "upload.bin"),
    );
    const width = String(form.get("width") || "");
    const height = String(form.get("height") || "");
    const duration = String(form.get("duration") || "");
    const year = String(form.get("year") || "").trim();
    const album = String(form.get("album") || form.get("bucket") || "")
      .trim()
      .toLowerCase();
    const person = String(form.get("person") || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-");
    const preserveOriginal = String(form.get("preserveOriginal") || "1") !== "0";
    const clientOptimized =
      String(form.get("clientOptimized") || form.get("optimized") || "") ===
      "1";
    const originalBytes = String(form.get("originalBytes") || "");

    if (!(file instanceof File)) {
      return json({ error: "file required" }, 400, headers);
    }
    if (!(R2_CATEGORIES as readonly string[]).includes(category)) {
      return json(
        {
          error: `Invalid category. Allowed: ${R2_CATEGORIES.join(", ")}`,
        },
        400,
        headers,
      );
    }
    const mime = guessMime(originalName, file.type);
    if (
      !ALLOWED_EXT.has(extOf(originalName)) &&
      !mime.startsWith("image/") &&
      !mime.startsWith("video/") &&
      !mime.startsWith("audio/") &&
      mime !== "application/pdf"
    ) {
      return json({ error: "Unsupported file type" }, 400, headers);
    }

    // Light magic sniff + size/format policy (no Sharp/FFmpeg in Workers).
    const head = new Uint8Array(await file.slice(0, 64).arrayBuffer());
    const allowRaw =
      category === "documents" ||
      category === "logos" ||
      category === "hero";
    const check = validateUpload(
      originalName,
      file.size,
      mime,
      { category, clientOptimized, allowRaw },
      head,
    );
    if (!check.ok) {
      return json(
        {
          error: check.error,
          code: check.code,
          hint:
            check.code === "needs_ffmpeg" || check.code === "needs_node_convert"
              ? "Use Admin client image compress for JPEG/PNG/WebP, or `npm run media:optimize` / GitHub Action “Media Optimize” for HEIC/video."
              : undefined,
        },
        400,
        headers,
      );
    }
    if (file.size > VIDEO_MAX_BYTES) {
      return json(
        {
          error: `File exceeds ${VIDEO_MAX_BYTES / (1024 * 1024)} MB hard limit.`,
          code: "too_large",
        },
        413,
        headers,
      );
    }
    if (check.kind === "image" && file.size > IMAGE_MAX_UPLOAD_BYTES) {
      return json(
        {
          error: `Image exceeds ${IMAGE_MAX_UPLOAD_BYTES / 1024} KB. Compress in Admin first.`,
          code: "image_too_large",
        },
        413,
        headers,
      );
    }

    // Structured gallery path when year + album provided → discoverable by reindex.
    let keyPrefix = category;
    if (
      (category === "gallery" || category === "videos" || category === "funfest") &&
      year &&
      album
    ) {
      if (!isYearDir(year)) {
        return json({ error: "year must be YYYY" }, 400, headers);
      }
      if (!isCmsAlbum(album)) {
        return json(
          { error: `album must be a CMS bucket (e.g. vinayaka-chavithi)` },
          400,
          headers,
        );
      }
      const personSeg =
        album === "rvp-birthdays" && person ? `${person}/` : "";
      if (category === "gallery") {
        keyPrefix = `gallery/${year}/${album}/${personSeg}`.replace(/\/+$/, "");
      } else if (category === "videos") {
        keyPrefix = `videos/${year}/${album}/${personSeg}`.replace(/\/+$/, "");
      } else {
        keyPrefix = `funfest/${year}/${album}/${personSeg}`.replace(/\/+$/, "");
      }
    }

    const key = `${keyPrefix}/${Date.now()}-${originalName}`;

    // Never overwrite official festival/brand heroes.
    if (isProtectedHeroKey(key) || /\/hero\.(webp|jpg|jpeg|png)$/i.test(key)) {
      return json(
        {
          error:
            "Refusing to overwrite protected hero.webp assets. Update festival heroes via Git content/public/festivals only.",
        },
        400,
        headers,
      );
    }

    const uploadedAt = new Date().toISOString();
    const privateObject = isPrivateKey(key);
    const bytes = new Uint8Array(await file.arrayBuffer());

    // Public uploads only: when R2 ≥ ~90% of free soft-limit, spill to free Google Drive.
    // Private Fun Fest / documents stay on R2 (no public Drive links).
    const usage = await shouldUseGoogleDriveOverflow(env, 0.9);
    const useDrive =
      !privateObject &&
      usage.overflow &&
      isGoogleDriveConfigured(env);

    let thumbKey: string | null = null;
    let originalKey: string | null = null;
    let storage: "r2" | "gdrive" = "r2";
    let gdriveId: string | null = null;
    let publicUrl = "";

    if (useDrive) {
      storage = "gdrive";
      const driveFile = await uploadToGoogleDrive(env, {
        bytes,
        name: originalName,
        mime,
      });
      gdriveId = driveFile.fileId;
      publicUrl = driveFile.publicUrl;

      // Tiny R2 pointer so catalog keys still resolve (redirects to Drive).
      const pointer = {
        backend: "gdrive",
        fileId: driveFile.fileId,
        publicUrl: driveFile.publicUrl,
        webViewLink: driveFile.webViewLink,
        mime,
        originalName,
        size: file.size,
        uploadedAt,
      };
      await env.MEDIA.put(key, JSON.stringify(pointer), {
        httpMetadata: { contentType: GDRIVE_POINTER_MIME },
        customMetadata: {
          backend: "gdrive",
          gdriveId: driveFile.fileId,
          publicUrl: driveFile.publicUrl,
          fileName: originalName,
          originalName,
          category,
          uploadedAt,
          mime,
          size: String(file.size),
          clientOptimized: clientOptimized ? "1" : "0",
          ...(year ? { year } : {}),
          ...(album ? { album } : {}),
        },
      });
      // Pointer bytes only (~0.5KB) — still track lightly
      await addTrackedR2Usage(env, 512);
    } else {
      await env.MEDIA.put(key, bytes, {
        httpMetadata: { contentType: mime },
        customMetadata: {
          backend: "r2",
          fileName: originalName,
          originalName,
          category,
          uploadedAt,
          mime,
          size: String(file.size),
          clientOptimized: clientOptimized ? "1" : "0",
          ...(originalBytes ? { originalBytes } : {}),
          ...(year ? { year } : {}),
          ...(album ? { album } : {}),
          ...(width ? { width } : {}),
          ...(height ? { height } : {}),
          ...(duration ? { duration } : {}),
        },
      });
      await addTrackedR2Usage(env, file.size);

      if (thumbFile instanceof File && thumbFile.size > 0) {
        const derived = deriveThumbKey(key);
        if (derived && !isProtectedHeroKey(derived)) {
          thumbKey = derived;
          const thumbBytes = new Uint8Array(await thumbFile.arrayBuffer());
          const thumbMime = guessMime(
            thumbFile.name || "thumb.webp",
            thumbFile.type || "image/webp",
          );
          await env.MEDIA.put(thumbKey, thumbBytes, {
            httpMetadata: { contentType: thumbMime },
            customMetadata: {
              pairedKey: key,
              category: "thumbs",
              uploadedAt,
              clientOptimized: "1",
              backend: "r2",
            },
          });
          await addTrackedR2Usage(env, thumbFile.size);
        }
      }

      const ext = extOf(originalName);
      if (
        preserveOriginal &&
        (ext === "heic" || ext === "heif" || ext === "mov" || ext === "dng")
      ) {
        originalKey = `originals/${key}`;
        await env.MEDIA.put(originalKey, bytes, {
          httpMetadata: { contentType: mime },
          customMetadata: {
            fileName: originalName,
            originalName,
            category: "originals",
            pairedKey: key,
            uploadedAt,
            backend: "r2",
          },
        });
        await addTrackedR2Usage(env, file.size);
      }

      const publicBase = (env.R2_PUBLIC_BASE || "").replace(/\/$/, "");
      publicUrl =
        privateObject || !publicBase
          ? `/api/media/object?key=${encodeURIComponent(key)}`
          : `${publicBase}/${key}`;
    }

    if (
      usage.overflow &&
      !useDrive &&
      !privateObject &&
      !isGoogleDriveConfigured(env)
    ) {
      check.warnings.push(
        "R2 is at/above ~90% of the free soft limit, but Google Drive secrets are not configured — uploaded to R2 anyway. Set GOOGLE_DRIVE_* secrets to enable free Drive overflow.",
      );
    }

    return json(
      {
        ok: true,
        key,
        thumbKey,
        publicUrl,
        private: privateObject,
        storage,
        gdriveId,
        size: file.size,
        mime,
        originalName,
        fileName: originalName,
        category,
        uploadedAt,
        width: width || null,
        height: height || null,
        duration: duration || null,
        year: year || null,
        album: album || null,
        originalKey,
        clientOptimized,
        originalBytes: originalBytes ? Number(originalBytes) : null,
        r2Usage: {
          bytes: usage.bytes + (storage === "r2" ? file.size : 0),
          limit: usage.limit,
          ratio: usage.ratio,
          overflow: usage.overflow,
        },
        warnings: check.warnings,
        note:
          storage === "gdrive"
            ? "Stored on free Google Drive (R2 ≥ 90% soft limit). R2 keeps a tiny redirect pointer."
            : check.warnings[0] ||
              (clientOptimized
                ? "Accepted client-optimized upload (Workers do not re-encode)."
                : null),
        next: year && album
          ? "Call POST /api/media/reindex (or click Reindex gallery) so albums.json picks up this path."
          : "Flat category upload — not auto-indexed into Festival→Year albums unless year+album were set.",
      },
      200,
      headers,
    );
  }

  if (route === "usage" && request.method === "GET") {
    if (!(await requireAdmin(request, env))) {
      return json({ error: "Unauthorized" }, 401, headers);
    }
    const recount = url.searchParams.get("recount") === "1";
    const bytes = recount
      ? await recountR2Usage(env)
      : (await shouldUseGoogleDriveOverflow(env)).bytes;
    const status = await shouldUseGoogleDriveOverflow(env);
    return json(
      {
        ok: true,
        bytes: recount ? bytes : status.bytes,
        limit: status.limit,
        ratio: status.ratio,
        overflowAt: 0.9,
        overflowActive: status.overflow,
        googleDriveConfigured: isGoogleDriveConfigured(env),
        recounted: recount,
      },
      200,
      headers,
    );
  }

  if (route === "reindex" && request.method === "POST") {
    if (!(await requireAdmin(request, env))) {
      return json({ error: "Unauthorized" }, 401, headers);
    }

    const publicBase = (env.R2_PUBLIC_BASE || "").replace(/\/$/, "");
    const objects = await listAllKeys(env.MEDIA, [
      "gallery/",
      "videos/",
      "audio/",
      "funfest/",
    ]);
    const albums = await buildAlbumsFromR2Keys(objects, { publicBase });
    const payload = {
      version: 1,
      generatedAt: new Date().toISOString(),
      source: "api/media/reindex",
      objectCount: objects.length,
      mediaCount: mediaCountOf(albums),
      albums,
    };

    await env.MEDIA.put(R2_ALBUMS_CATALOG_KEY, JSON.stringify(payload), {
      httpMetadata: { contentType: "application/json" },
      customMetadata: {
        generatedAt: payload.generatedAt,
        mediaCount: String(payload.mediaCount),
      },
    });

    // Also store bare array for sync-cms fetchPublicAlbumsCatalog convenience
    await env.MEDIA.put(
      "catalog/albums.array.json",
      JSON.stringify(albums),
      {
        httpMetadata: { contentType: "application/json" },
      },
    );

    const body = await request.json().catch(() => ({} as { dispatch?: boolean }));
    const dispatch =
      body && typeof body === "object" && "dispatch" in body
        ? Boolean((body as { dispatch?: boolean }).dispatch)
        : true;
    const gh = dispatch
      ? await maybeDispatchGithub(env, "gallery-reindex")
      : { dispatched: false as const, reason: "skipped" };

    return json(
      {
        ok: true,
        catalogKey: R2_ALBUMS_CATALOG_KEY,
        albums: albums.length,
        media: payload.mediaCount,
        objects: objects.length,
        publicUrl: publicBase
          ? `${publicBase}/${R2_ALBUMS_CATALOG_KEY}`
          : null,
        github: gh,
        note: "Hero assets under festivals/*/hero.webp are never modified. Commit generated/albums.json on the next deploy (or wait for content-sync dispatch).",
      },
      200,
      headers,
    );
  }

  return json(
    {
      error: "Not found",
      routes: ["upload", "reindex", "sign", "object"],
      route,
    },
    404,
    headers,
  );
}
