/**
 * Browser-side image optimization (Canvas).
 * Used by Admin uploads before POST /api/media/upload.
 *
 * Limits: HEIC usually fails decode outside Safari — callers should surface
 * the error and point users at `npm run media:optimize`. Video/audio are
 * not transcoded here (Workers + browser cannot run FFmpeg reliably).
 */

import {
  BROWSER_IMAGE_EXT,
  IMAGE_MAX_EDGE,
  IMAGE_MEDIUM_EDGE,
  IMAGE_TARGET_BYTES,
  IMAGE_THUMB_EDGE,
  formatBytes,
  extOfName,
} from "./constants";
import { validateUpload } from "./validate";

export type ClientOptimizeProgress = {
  stage:
    | "compressing"
    | "converting"
    | "generating_preview"
    | "ready"
    | "skipped"
    | "failed";
  message: string;
  pct?: number;
};

export type ClientOptimizedImage = {
  kind: "image";
  originalName: string;
  originalBytes: number;
  full: File;
  medium: File;
  thumb: File;
  width: number;
  height: number;
  mime: string;
  previewUrl: string;
  compressedBytes: number;
  savingsPct: number;
  note?: string;
};

export type ClientPassthrough = {
  kind: "video" | "audio" | "document" | "svg" | "other";
  file: File;
  originalBytes: number;
  note?: string;
  /** When true, Worker should reject (needs Node/FFmpeg). */
  blocked?: boolean;
  blockReason?: string;
};

export type ClientPrepareResult = ClientOptimizedImage | ClientPassthrough;

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Canvas encode failed"));
        else resolve(blob);
      },
      type,
      quality,
    );
  });
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      /* fall through */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () =>
        reject(
          new Error(
            "Browser cannot decode this image (common for HEIC). Export JPEG/PNG/WebP or run `npm run media:optimize`.",
          ),
        );
      el.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function drawScaled(
  source: ImageBitmap | HTMLImageElement,
  maxEdge: number,
): HTMLCanvasElement {
  const sw =
    "naturalWidth" in source
      ? source.naturalWidth || source.width
      : source.width;
  const sh =
    "naturalHeight" in source
      ? source.naturalHeight || source.height
      : source.height;
  if (!sw || !sh) throw new Error("Invalid image dimensions");
  const scale = Math.min(1, maxEdge / Math.max(sw, sh));
  const w = Math.max(1, Math.round(sw * scale));
  const h = Math.max(1, Math.round(sh * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) throw new Error("Canvas 2D unavailable");
  ctx.drawImage(source as CanvasImageSource, 0, 0, w, h);
  return canvas;
}

function hasTransparency(canvas: HTMLCanvasElement): boolean {
  try {
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    const { width, height } = canvas;
    const sample = Math.min(width, height, 64);
    const data = ctx.getImageData(0, 0, sample, sample).data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i]! < 250) return true;
    }
  } catch {
    /* tainted / security */
  }
  return false;
}

async function encodeTarget(
  canvas: HTMLCanvasElement,
  preferPng: boolean,
  targetBytes: number,
): Promise<{ blob: Blob; mime: string }> {
  if (preferPng) {
    const png = await canvasToBlob(canvas, "image/png", 1);
    if (png.size <= targetBytes * 1.5) {
      return { blob: png, mime: "image/png" };
    }
  }

  let lo = 0.45;
  let hi = 0.92;
  let best: Blob | null = null;
  for (let i = 0; i < 8; i += 1) {
    const q = (lo + hi) / 2;
    let blob: Blob;
    try {
      blob = await canvasToBlob(canvas, "image/webp", q);
    } catch {
      blob = await canvasToBlob(canvas, "image/jpeg", q);
      return qualityLoopJpeg(canvas, targetBytes);
    }
    best = blob;
    if (blob.size > targetBytes) hi = q;
    else lo = q;
  }
  if (!best) throw new Error("WebP encode failed");
  if (best.size > targetBytes * 1.25) {
    // Last resort: shrink canvas further
    const smaller = document.createElement("canvas");
    const scale = Math.sqrt(targetBytes / best.size);
    smaller.width = Math.max(320, Math.round(canvas.width * Math.min(1, scale)));
    smaller.height = Math.max(
      320,
      Math.round(canvas.height * Math.min(1, scale)),
    );
    const ctx = smaller.getContext("2d");
    if (ctx) {
      ctx.drawImage(canvas, 0, 0, smaller.width, smaller.height);
      best = await canvasToBlob(smaller, "image/webp", 0.72);
    }
  }
  const mime = best.type || "image/webp";
  return { blob: best, mime };
}

async function qualityLoopJpeg(
  canvas: HTMLCanvasElement,
  targetBytes: number,
): Promise<{ blob: Blob; mime: string }> {
  let q = 0.88;
  let blob = await canvasToBlob(canvas, "image/jpeg", q);
  while (blob.size > targetBytes && q > 0.4) {
    q -= 0.08;
    blob = await canvasToBlob(canvas, "image/jpeg", q);
  }
  return { blob, mime: "image/jpeg" };
}

function baseName(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, "") || "upload";
}

/**
 * Prepare a File for Admin → R2 upload.
 * Images: WebP (or PNG if alpha) ≤500 KB + medium + thumb.
 * Video/audio: passthrough with validation (may be blocked).
 */
export async function prepareFileForUpload(
  file: File,
  onProgress?: (p: ClientOptimizeProgress) => void,
  opts?: { category?: string },
): Promise<ClientPrepareResult> {
  const ext = extOfName(file.name);
  const category = opts?.category || "gallery";

  // SVG / documents — store as-is
  if (ext === "svg") {
    return {
      kind: "svg",
      file,
      originalBytes: file.size,
      note: "SVG stored as-is (not rasterized).",
    };
  }

  const isImage =
    file.type.startsWith("image/") || BROWSER_IMAGE_EXT.has(ext) || ext === "heic" || ext === "heif";
  const isVideo = file.type.startsWith("video/") || ["mp4", "mov", "webm", "mkv", "avi", "m4v"].includes(ext);
  const isAudio = file.type.startsWith("audio/") || ["mp3", "wav", "aac", "m4a", "flac", "ogg"].includes(ext);

  if (isVideo) {
    const check = validateUpload(file.name, file.size, file.type, { category });
    if (!check.ok) {
      return {
        kind: "video",
        file,
        originalBytes: file.size,
        blocked: true,
        blockReason: check.error,
      };
    }
    return {
      kind: "video",
      file,
      originalBytes: file.size,
      note:
        ext === "mp4" || ext === "webm"
          ? "Video uploaded as-is. For H.264 ≤1080p / ≤200 MB use `npm run media:optimize`."
          : undefined,
    };
  }

  if (isAudio) {
    return {
      kind: "audio",
      file,
      originalBytes: file.size,
      note: "Audio uploaded as-is. Prefer MP3 128kbps via `npm run media:optimize`.",
    };
  }

  if (!isImage) {
    return { kind: "other", file, originalBytes: file.size };
  }

  onProgress?.({
    stage: "compressing",
    message: `Compressing ${file.name}…`,
    pct: 10,
  });

  let bitmap: ImageBitmap | HTMLImageElement;
  try {
    bitmap = await loadBitmap(file);
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : "Could not decode image in browser.";
    onProgress?.({ stage: "failed", message: msg });
    throw new Error(msg);
  }

  onProgress?.({
    stage: "converting",
    message: "Converting to WebP…",
    pct: 40,
  });

  const fullCanvas = drawScaled(bitmap, IMAGE_MAX_EDGE);
  const preferPng = hasTransparency(fullCanvas) && ext === "png";
  const fullEnc = await encodeTarget(fullCanvas, preferPng, IMAGE_TARGET_BYTES);

  onProgress?.({
    stage: "generating_preview",
    message: "Generating preview & thumbnails…",
    pct: 70,
  });

  const mediumCanvas = drawScaled(bitmap, IMAGE_MEDIUM_EDGE);
  const thumbCanvas = drawScaled(bitmap, IMAGE_THUMB_EDGE);
  const mediumEnc = await encodeTarget(
    mediumCanvas,
    preferPng,
    Math.round(IMAGE_TARGET_BYTES * 0.7),
  );
  const thumbEnc = await encodeTarget(
    thumbCanvas,
    false,
    Math.round(IMAGE_TARGET_BYTES * 0.25),
  );

  if ("close" in bitmap && typeof bitmap.close === "function") {
    bitmap.close();
  }

  const stem = baseName(file.name);
  const fullExt = fullEnc.mime === "image/png" ? "png" : fullEnc.mime === "image/jpeg" ? "jpg" : "webp";
  const full = new File([fullEnc.blob], `${stem}.${fullExt}`, {
    type: fullEnc.mime,
  });
  const medium = new File([mediumEnc.blob], `${stem}-md.webp`, {
    type: mediumEnc.mime,
  });
  const thumb = new File([thumbEnc.blob], `${stem}-thumb.webp`, {
    type: thumbEnc.mime,
  });

  const previewUrl = URL.createObjectURL(full);
  const savingsPct =
    file.size > 0
      ? Math.max(0, Math.round((1 - full.size / file.size) * 100))
      : 0;

  onProgress?.({
    stage: "ready",
    message: `Ready — ${formatBytes(file.size)} → ${formatBytes(full.size)} (${savingsPct}% smaller)`,
    pct: 100,
  });

  return {
    kind: "image",
    originalName: file.name,
    originalBytes: file.size,
    full,
    medium,
    thumb,
    width: fullCanvas.width,
    height: fullCanvas.height,
    mime: fullEnc.mime,
    previewUrl,
    compressedBytes: full.size,
    savingsPct,
    note:
      full.size > IMAGE_TARGET_BYTES
        ? `Compressed to ${formatBytes(full.size)} (target ${formatBytes(IMAGE_TARGET_BYTES)}).`
        : undefined,
  };
}
