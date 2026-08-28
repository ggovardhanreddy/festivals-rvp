/**
 * Client-side member photo helpers: preview, rotate, canvas convert to webp/jpeg.
 * HEIC/HEIF often cannot be decoded in-browser — callers should show a graceful message.
 */

import { withBase } from "./base";
import { resolveMediaUrl } from "./media-url";

/** Display URL for a member portrait (R2 CDN when available). */
export function memberPhotoSrc(photo: string | null | undefined): string {
  if (!photo) return "";
  const resolved = resolveMediaUrl(photo);
  return /^https?:\/\//i.test(resolved) ? resolved : withBase(resolved);
}

export type PreparedMemberImage = {
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  converted: boolean;
  note?: string;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(
        new Error(
          "Could not read this image in the browser. HEIC/HEIF from iPhone often needs conversion to JPEG/PNG first.",
        ),
      );
    img.src = src;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Image encode failed"));
        else resolve(blob);
      },
      type,
      quality,
    );
  });
}

/** Detect likely HEIC by extension/MIME (browser decode may still fail). */
export function looksLikeHeic(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    name.endsWith(".heic") ||
    name.endsWith(".heif") ||
    file.type === "image/heic" ||
    file.type === "image/heif"
  );
}

/**
 * Load file → optional rotate (90° steps) → downscale → webp/jpeg File + object URL.
 */
export async function prepareMemberImage(
  file: File,
  opts?: { maxEdge?: number; rotate?: 0 | 90 | 180 | 270; quality?: number },
): Promise<PreparedMemberImage> {
  const maxEdge = opts?.maxEdge ?? 1200;
  const rotate = opts?.rotate ?? 0;
  const quality = opts?.quality ?? 0.85;

  if (looksLikeHeic(file)) {
    // Some Safari builds can decode HEIC into canvas; try first.
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const sw = img.naturalWidth || img.width;
    const sh = img.naturalHeight || img.height;
    if (!sw || !sh) throw new Error("Invalid image dimensions");

    const scale = Math.min(1, maxEdge / Math.max(sw, sh));
    const rw = Math.max(1, Math.round(sw * scale));
    const rh = Math.max(1, Math.round(sh * scale));
    const swap = rotate === 90 || rotate === 270;
    const canvas = document.createElement("canvas");
    canvas.width = swap ? rh : rw;
    canvas.height = swap ? rw : rh;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.drawImage(img, -rw / 2, -rh / 2, rw, rh);

    let outType = "image/webp";
    let blob: Blob;
    try {
      blob = await canvasToBlob(canvas, "image/webp", quality);
      if (!blob.size) throw new Error("empty webp");
    } catch {
      outType = "image/jpeg";
      blob = await canvasToBlob(canvas, "image/jpeg", quality);
    }

    const ext = outType === "image/webp" ? "webp" : "jpg";
    const base = file.name.replace(/\.[^.]+$/, "") || "member-photo";
    const outFile = new File([blob], `${base}.${ext}`, { type: outType });
    const previewUrl = URL.createObjectURL(outFile);
    URL.revokeObjectURL(objectUrl);

    return {
      file: outFile,
      previewUrl,
      width: canvas.width,
      height: canvas.height,
      converted: outType !== file.type || scale < 1 || rotate !== 0,
      note:
        looksLikeHeic(file) && outType !== "image/heic"
          ? "Converted for upload. Prefer JPEG/PNG/WebP for best compatibility."
          : undefined,
    };
  } catch (err) {
    URL.revokeObjectURL(objectUrl);
    if (looksLikeHeic(file)) {
      throw new Error(
        "HEIC photos often cannot be processed in this browser. Export as JPEG in Photos, then upload.",
      );
    }
    throw err instanceof Error ? err : new Error("Image preparation failed");
  }
}

export async function uploadMemberPhotoFile(file: File): Promise<string> {
  const { prepareFileForUpload } = await import(
    "@/lib/media-pipeline/client-optimize"
  );
  const prepared = await prepareFileForUpload(file, undefined, {
    category: "members",
  });
  if (prepared.kind !== "image") {
    throw new Error("Member photo must be an image (JPEG/PNG/WebP).");
  }
  const form = new FormData();
  form.append("file", prepared.full);
  form.append("thumb", prepared.thumb);
  form.append("category", "members");
  form.append("originalName", prepared.full.name);
  form.append("clientOptimized", "1");
  form.append("originalBytes", String(prepared.originalBytes));
  form.append("width", String(prepared.width));
  form.append("height", String(prepared.height));
  const { withBase } = await import("@/lib/base");
  const res = await fetch(withBase("/api/media/upload"), {
    method: "POST",
    credentials: "include",
    body: form,
  });
  const data = (await res.json()) as {
    error?: string;
    key?: string;
    publicUrl?: string;
    url?: string;
  };
  URL.revokeObjectURL(prepared.previewUrl);
  if (!res.ok) throw new Error(data.error || "Photo upload failed");
  return (
    data.publicUrl ||
    data.url ||
    (data.key ? `/api/media/object?key=${encodeURIComponent(data.key)}` : "")
  );
}
