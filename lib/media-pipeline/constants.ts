/**
 * Shared media pipeline constants (browser + Worker + Node).
 * No Node/sharp imports — safe for Cloudflare Pages Functions.
 */

/** Max long-edge for optimized stills (px). */
export const IMAGE_MAX_EDGE = 1920;

/** Medium derivative long-edge (px). */
export const IMAGE_MEDIUM_EDGE = 1280;

/** Thumbnail long-edge (px) — matches sync-cms thumbs. */
export const IMAGE_THUMB_EDGE = 600;

/** Target max size for optimized stills (bytes). */
export const IMAGE_TARGET_BYTES = 500 * 1024;

/**
 * Hard reject above this for Worker image uploads (client should hit target;
 * allow headroom for PNG transparency / edge cases).
 */
export const IMAGE_MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

/** Optimized video max size (bytes). */
export const VIDEO_MAX_BYTES = 200 * 1024 * 1024;

/** Optimized audio max size (bytes). */
export const AUDIO_MAX_BYTES = 40 * 1024 * 1024;

/** Documents / misc. */
export const DOCUMENT_MAX_BYTES = 50 * 1024 * 1024;

/** Video encode caps (Node/CI FFmpeg). */
export const VIDEO_MAX_HEIGHT = 1080;
export const AUDIO_BITRATE = "128k";

export const IMAGE_INPUT_EXT = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "heic",
  "heif",
  "avif",
  "bmp",
  "tif",
  "tiff",
  "gif",
  "svg",
]);

export const VIDEO_INPUT_EXT = new Set([
  "mp4",
  "mov",
  "avi",
  "mkv",
  "webm",
  "m4v",
  "mpeg",
  "mpg",
  "3gp",
]);

export const AUDIO_INPUT_EXT = new Set([
  "mp3",
  "wav",
  "aac",
  "m4a",
  "flac",
  "ogg",
]);

/** Browser-decodable stills (HEIC usually fails outside Safari). */
export const BROWSER_IMAGE_EXT = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "bmp",
  "avif",
]);

/** Formats the Worker accepts for gallery display without Node conversion. */
export const WORKER_READY_IMAGE_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);
export const WORKER_READY_VIDEO_EXT = new Set(["mp4", "webm"]);
export const WORKER_READY_AUDIO_EXT = new Set(["mp3", "aac", "m4a", "ogg", "wav"]);

/** Exts that need local/CI FFmpeg or import tooling — reject on Worker gallery path. */
export const NEEDS_NODE_CONVERT_EXT = new Set([
  "heic",
  "heif",
  "mov",
  "avi",
  "mkv",
  "m4v",
  "mpeg",
  "mpg",
  "3gp",
  "tif",
  "tiff",
  "dng",
]);

export type MediaPipelineStage =
  | "queued"
  | "compressing"
  | "converting"
  | "generating_preview"
  | "uploading"
  | "uploading_r2"
  | "updating_gallery"
  | "completed"
  | "failed";

export const MEDIA_PIPELINE_STAGE_LABELS: Record<MediaPipelineStage, string> = {
  queued: "Queued",
  compressing: "Compressing",
  converting: "Converting",
  generating_preview: "Generating Preview",
  uploading: "Uploading",
  uploading_r2: "Uploading to R2",
  updating_gallery: "Updating Gallery",
  completed: "Completed",
  failed: "Failed",
};

export const MEDIA_PIPELINE_STAGE_ORDER: MediaPipelineStage[] = [
  "queued",
  "compressing",
  "converting",
  "generating_preview",
  "uploading_r2",
  "updating_gallery",
  "completed",
];

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function extOfName(name: string): string {
  const base = name.split("?")[0] || name;
  const parts = base.split(".");
  return (parts[parts.length - 1] || "").toLowerCase();
}
