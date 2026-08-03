/**
 * Media API (Cloudflare Pages Function)
 *
 * POST /api/media/upload — admin upload to R2
 * GET  /api/media/sign?key= — short-lived signed URL for private objects
 * GET  /api/media/object?key= — stream object via R2 binding
 */

interface Env {
  MEDIA?: R2Bucket;
  ADMIN_PASSWORD_HASH?: string;
  ADMIN_SESSION_SECRET?: string;
  MEMBER_SESSION_SECRET?: string;
  MEDIA_SIGNING_SECRET?: string;
  R2_PUBLIC_BASE?: string;
}

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

  if (route === "object" && request.method === "GET") {
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
    const obj = await env.MEDIA.get(key);
    if (!obj) return new Response("Not found", { status: 404, headers });
    const responseHeaders = new Headers(headers);
    obj.writeHttpMetadata(responseHeaders);
    responseHeaders.set("etag", obj.httpEtag);
    responseHeaders.set(
      "cache-control",
      isPrivateKey(key)
        ? "private, max-age=300"
        : "public, max-age=31536000, immutable",
    );
    return new Response(obj.body, { headers: responseHeaders });
  }

  if (route === "upload" && request.method === "POST") {
    if (!(await requireAdmin(request, env))) {
      return json({ error: "Unauthorized" }, 401, headers);
    }
    const form = await request.formData();
    const file = form.get("file");
    const category = String(form.get("category") || "gallery")
      .replace(/^\//, "")
      .replace(/\/$/, "");
    const originalName = sanitize(
      String(form.get("originalName") || "upload.bin"),
    );
    const width = String(form.get("width") || "");
    const height = String(form.get("height") || "");
    const duration = String(form.get("duration") || "");

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

    const key = `${category}/${Date.now()}-${originalName}`;
    const uploadedAt = new Date().toISOString();
    const privateObject = isPrivateKey(key);

    await env.MEDIA.put(key, file.stream(), {
      httpMetadata: { contentType: mime },
      customMetadata: {
        fileName: originalName,
        originalName,
        category,
        uploadedAt,
        mime,
        size: String(file.size),
        ...(width ? { width } : {}),
        ...(height ? { height } : {}),
        ...(duration ? { duration } : {}),
      },
    });

    const publicBase = (env.R2_PUBLIC_BASE || "").replace(/\/$/, "");
    const publicUrl =
      privateObject || !publicBase
        ? `/api/media/object?key=${encodeURIComponent(key)}`
        : `${publicBase}/${key}`;

    return json(
      {
        ok: true,
        key,
        publicUrl,
        private: privateObject,
        size: file.size,
        mime,
        originalName,
        fileName: originalName,
        category,
        uploadedAt,
        width: width || null,
        height: height || null,
        duration: duration || null,
      },
      200,
      headers,
    );
  }

  return json(
    { error: "Not found", routes: ["upload", "sign", "object"], route },
    404,
    headers,
  );
}
