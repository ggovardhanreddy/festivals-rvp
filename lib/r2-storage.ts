/**
 * Shared Cloudflare R2 media taxonomy + upload helpers.
 * Used by Pages Functions, Admin UI, and migration scripts.
 */

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

export const IMAGE_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "image/avif",
  "image/tiff",
  "image/bmp",
]);

export const VIDEO_MIME = new Set([
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
  "video/webm",
  "video/x-m4v",
  "video/mpeg",
  "video/3gpp",
]);

export const AUDIO_MIME = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/aac",
  "audio/mp4",
  "audio/m4a",
  "audio/flac",
  "audio/ogg",
]);

export const DOCUMENT_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "application/x-zip-compressed",
]);

export const ALLOWED_EXTENSIONS = new Set([
  // images
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
  // videos
  "mp4",
  "mov",
  "avi",
  "mkv",
  "webm",
  "m4v",
  "mpeg",
  "mpg",
  "3gp",
  // audio
  "mp3",
  "wav",
  "aac",
  "m4a",
  "flac",
  "ogg",
  // documents
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "zip",
]);

/** HTML accept= attribute for admin file pickers */
export const MEDIA_ACCEPT =
  ".jpg,.jpeg,.png,.webp,.gif,.heic,.heif,.avif,.tif,.tiff,.bmp,.mp4,.mov,.avi,.mkv,.webm,.m4v,.mpeg,.mpg,.3gp,.mp3,.wav,.aac,.m4a,.flac,.ogg,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,image/*,video/*,audio/*";

export function isR2Category(value: string): value is R2Category {
  return (R2_CATEGORIES as readonly string[]).includes(value);
}

export function extensionOf(name: string): string {
  const base = name.split("?")[0] || name;
  const parts = base.split(".");
  return (parts[parts.length - 1] || "").toLowerCase();
}

export function isAllowedUpload(fileName: string, mime?: string): boolean {
  const ext = extensionOf(fileName);
  if (ALLOWED_EXTENSIONS.has(ext)) return true;
  if (!mime) return false;
  return (
    IMAGE_MIME.has(mime) ||
    VIDEO_MIME.has(mime) ||
    AUDIO_MIME.has(mime) ||
    DOCUMENT_MIME.has(mime)
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
    avi: "video/x-msvideo",
    mkv: "video/x-matroska",
    webm: "video/webm",
    m4v: "video/x-m4v",
    mpeg: "video/mpeg",
    mpg: "video/mpeg",
    "3gp": "video/3gpp",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    aac: "audio/aac",
    m4a: "audio/mp4",
    flac: "audio/flac",
    ogg: "audio/ogg",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    zip: "application/zip",
    svg: "image/svg+xml",
    ico: "image/x-icon",
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

/** Default public base from env (no trailing slash). */
export function r2PublicBaseFromEnv(
  env: Record<string, string | undefined> = process.env as Record<
    string,
    string | undefined
  >,
): string {
  return (
    env.NEXT_PUBLIC_R2_PUBLIC_URL ||
    env.R2_PUBLIC_BASE ||
    ""
  ).replace(/\/$/, "");
}

export function publicObjectUrl(key: string, publicBase: string): string {
  if (!publicBase || isPrivateR2Key(key)) {
    return `/api/media/object?key=${encodeURIComponent(key)}`;
  }
  return `${publicBase.replace(/\/$/, "")}/${key}`;
}
