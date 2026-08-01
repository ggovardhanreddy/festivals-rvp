import type { MediaType } from "./types";

/** Raster/vector images accepted as CMS sources (AVIF is build output only). */
export const IMAGE_SOURCE_EXTS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".heic",
  ".heif",
  ".tif",
  ".tiff",
  ".bmp",
  ".svg",
  ".ico",
  ".jxl",
]);

export const IMAGE_EXTS = new Set([...IMAGE_SOURCE_EXTS, ".avif"]);

/** Browser-friendly video containers. */
export const VIDEO_EXTS = new Set([".mp4", ".mov", ".webm", ".m4v", ".ogv"]);

/** Convert via ffmpeg when available. */
export const VIDEO_CONVERT_EXTS = new Set([".mkv", ".avi", ".wmv", ".flv"]);

export const AUDIO_EXTS = new Set([
  ".mp3",
  ".wav",
  ".aac",
  ".m4a",
  ".flac",
  ".ogg",
  ".opus",
]);

export const DOCUMENT_EXTS = new Set([".pdf", ".txt", ".md", ".markdown"]);

export function detectMediaKind(ext: string): MediaType | "skip" | "convert-video" {
  const e = ext.toLowerCase();
  if (e === ".avif") return "skip"; // derivative only
  if (IMAGE_SOURCE_EXTS.has(e)) return "image";
  if (VIDEO_EXTS.has(e)) return "video";
  if (VIDEO_CONVERT_EXTS.has(e)) return "convert-video";
  if (AUDIO_EXTS.has(e)) return "audio";
  if (DOCUMENT_EXTS.has(e)) return "document";
  return "skip";
}

export function mimeForExt(ext: string): string {
  const map: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".svg": "image/svg+xml",
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
    ".webm": "video/webm",
    ".m4v": "video/x-m4v",
    ".ogv": "video/ogg",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".aac": "audio/aac",
    ".m4a": "audio/mp4",
    ".flac": "audio/flac",
    ".ogg": "audio/ogg",
    ".opus": "audio/opus",
    ".pdf": "application/pdf",
    ".txt": "text/plain",
    ".md": "text/markdown",
    ".markdown": "text/markdown",
  };
  return map[ext.toLowerCase()] || "application/octet-stream";
}
