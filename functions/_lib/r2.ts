/** Shared R2 helpers for Pages Functions (no Node APIs). */

export const R2_CATEGORIES = [
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

export type R2Category = (typeof R2_CATEGORIES)[number];

const ALLOWED_EXTENSIONS = new Set([
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

export function isR2Category(value: string): value is R2Category {
  return (R2_CATEGORIES as readonly string[]).includes(value);
}

function extensionOf(name: string): string {
  const base = name.split("?")[0] || name;
  const parts = base.split(".");
  return (parts[parts.length - 1] || "").toLowerCase();
}

export function isAllowedUpload(fileName: string, mime?: string): boolean {
  const ext = extensionOf(fileName);
  if (ALLOWED_EXTENSIONS.has(ext)) return true;
  if (!mime) return false;
  return (
    mime.startsWith("image/") ||
    mime.startsWith("video/") ||
    mime.startsWith("audio/") ||
    mime === "application/pdf" ||
    mime.includes("zip") ||
    mime.includes("officedocument") ||
    mime.includes("msword") ||
    mime.includes("ms-excel") ||
    mime.includes("ms-powerpoint")
  );
}

export function guessContentType(fileName: string, mime?: string): string {
  if (mime && mime !== "application/octet-stream") return mime;
  const ext = extensionOf(fileName);
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    heic: "image/heic",
    heif: "image/heif",
    avif: "image/avif",
    tif: "image/tiff",
    tiff: "image/tiff",
    bmp: "image/bmp",
    mp4: "video/mp4",
    mov: "video/quicktime",
    webm: "video/webm",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    aac: "audio/aac",
    m4a: "audio/mp4",
    flac: "audio/flac",
    ogg: "audio/ogg",
    pdf: "application/pdf",
    zip: "application/zip",
    svg: "image/svg+xml",
  };
  return map[ext] || "application/octet-stream";
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[^\w.\-()+ ]+/g, "_").slice(0, 180);
}

export function buildUploadKey(
  category: R2Category,
  originalName: string,
  now = Date.now(),
): string {
  return `${category}/${now}-${sanitizeFileName(originalName)}`;
}

export function isPrivateR2Key(key: string): boolean {
  return (
    key.startsWith("funfest/") ||
    key.includes("/funfest/") ||
    key.includes("fun-trips/") ||
    key.startsWith("documents/") ||
    key.includes("/private/")
  );
}

export function publicObjectUrl(key: string, publicBase: string): string {
  if (!publicBase || isPrivateR2Key(key)) {
    return `/api/media/object?key=${encodeURIComponent(key)}`;
  }
  return `${publicBase.replace(/\/$/, "")}/${key}`;
}
