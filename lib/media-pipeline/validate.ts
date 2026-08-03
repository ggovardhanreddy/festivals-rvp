/**
 * Upload validation shared by Admin client + Pages Function.
 * Keep free of Node/sharp so Workers can import this file.
 */

import {
  AUDIO_MAX_BYTES,
  DOCUMENT_MAX_BYTES,
  IMAGE_MAX_UPLOAD_BYTES,
  IMAGE_TARGET_BYTES,
  NEEDS_NODE_CONVERT_EXT,
  VIDEO_MAX_BYTES,
  WORKER_READY_AUDIO_EXT,
  WORKER_READY_IMAGE_EXT,
  WORKER_READY_VIDEO_EXT,
  extOfName,
} from "./constants";

export type MediaKind = "image" | "video" | "audio" | "document" | "svg" | "unknown";

export type ValidateUploadOptions = {
  /** When true (Admin client already optimized), skip HEIC/MOV rejection. */
  clientOptimized?: boolean;
  /** Category from R2 taxonomy. */
  category?: string;
  /** Allow storing raw originals (documents / logos). */
  allowRaw?: boolean;
};

export type ValidateUploadResult =
  | { ok: true; kind: MediaKind; ext: string; warnings: string[] }
  | { ok: false; error: string; code: string; kind: MediaKind; ext: string };

const RAW_IMAGE_EXT = new Set([
  "heic",
  "heif",
  "bmp",
  "tif",
  "tiff",
  "dng",
  "gif",
]);
const RAW_VIDEO_EXT = new Set([
  "mov",
  "avi",
  "mkv",
  "m4v",
  "mpeg",
  "mpg",
  "3gp",
  "webm",
  "mp4",
]);

function kindFromExt(ext: string, mime = ""): MediaKind {
  if (ext === "svg") return "svg";
  if (
    WORKER_READY_IMAGE_EXT.has(ext) ||
    RAW_IMAGE_EXT.has(ext) ||
    mime.startsWith("image/")
  ) {
    return "image";
  }
  if (WORKER_READY_AUDIO_EXT.has(ext) || mime.startsWith("audio/")) {
    return "audio";
  }
  if (
    WORKER_READY_VIDEO_EXT.has(ext) ||
    RAW_VIDEO_EXT.has(ext) ||
    mime.startsWith("video/")
  ) {
    return "video";
  }
  if (ext === "pdf" || mime === "application/pdf" || mime.includes("document")) {
    return "document";
  }
  return "unknown";
}

/** Light magic-byte sniff (first 64 bytes). */
export function sniffKind(bytes: Uint8Array): "heic" | "video" | "image" | "unknown" {
  if (bytes.length < 12) return "unknown";
  // JPEG
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "image";
  // PNG
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image";
  }
  // GIF
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return "image";
  // WebP: RIFF....WEBP
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image";
  }
  const ascii = String.fromCharCode(...bytes.slice(0, 64));
  if (
    ascii.includes("ftypheic") ||
    ascii.includes("ftypheif") ||
    ascii.includes("ftypmif1")
  ) {
    return "heic";
  }
  if (
    ascii.includes("ftypqt") ||
    ascii.includes("ftypisom") ||
    ascii.includes("ftypmp42") ||
    ascii.includes("ftypM4V") ||
    ascii.includes("ftypiso5")
  ) {
    return "video";
  }
  return "unknown";
}

/**
 * Validate a prospective upload for the Worker / Admin path.
 * Gallery-shaped categories reject raw HEIC/MOV unless already client-optimized
 * into a ready format (which HEIC never is after failed browser convert).
 */
export function validateUpload(
  fileName: string,
  size: number,
  mime = "",
  opts: ValidateUploadOptions = {},
  head?: Uint8Array,
): ValidateUploadResult {
  const ext = extOfName(fileName);
  const kind = kindFromExt(ext, mime);
  const warnings: string[] = [];
  const category = (opts.category || "gallery").toLowerCase();
  const galleryLike =
    category === "gallery" ||
    category === "videos" ||
    category === "funfest" ||
    category === "events" ||
    category === "birthdays" ||
    category === "members" ||
    category === "developments";

  if (!ext && !mime) {
    return {
      ok: false,
      error: "Missing file extension / MIME type.",
      code: "missing_type",
      kind,
      ext,
    };
  }

  if (head && head.length >= 12) {
    const sniffed = sniffKind(head);
    if (sniffed === "heic" && !["heic", "heif"].includes(ext)) {
      warnings.push("File content looks like HEIC despite extension.");
    }
  }

  if (kind === "image" || kind === "svg") {
    if (size > IMAGE_MAX_UPLOAD_BYTES) {
      return {
        ok: false,
        error: `Image too large (${Math.round(size / 1024)} KB). Optimize to ≤500 KB (max upload ${IMAGE_MAX_UPLOAD_BYTES / 1024} KB) via Admin client compress or \`npm run media:optimize\`.`,
        code: "image_too_large",
        kind,
        ext,
      };
    }
    if (size > IMAGE_TARGET_BYTES) {
      warnings.push(
        `Image is ${Math.round(size / 1024)} KB (target ≤500 KB). Prefer client/Node optimize.`,
      );
    }
    if (
      galleryLike &&
      !opts.allowRaw &&
      (NEEDS_NODE_CONVERT_EXT.has(ext) ||
        (head && sniffKind(head) === "heic"))
    ) {
      return {
        ok: false,
        error:
          "HEIC/TIFF cannot be converted in Cloudflare Workers. Use Admin browser upload (Canvas→WebP) for JPEG/PNG/WebP sources, or run `npm run media:optimize` / local Import folder for HEIC, then upload the WebP.",
        code: "needs_node_convert",
        kind,
        ext,
      };
    }
    if (galleryLike && !WORKER_READY_IMAGE_EXT.has(ext) && ext !== "svg" && !opts.clientOptimized) {
      return {
        ok: false,
        error: `Unsupported gallery image type .${ext}. Convert to WebP/JPEG/PNG first.`,
        code: "unsupported_image",
        kind,
        ext,
      };
    }
    return { ok: true, kind, ext, warnings };
  }

  if (kind === "video") {
    if (size > VIDEO_MAX_BYTES) {
      return {
        ok: false,
        error: `Video exceeds ${VIDEO_MAX_BYTES / (1024 * 1024)} MB. Transcode locally with \`npm run media:optimize\` (H.264/AAC ≤1080p).`,
        code: "video_too_large",
        kind,
        ext,
      };
    }
    if (
      galleryLike &&
      !opts.allowRaw &&
      !WORKER_READY_VIDEO_EXT.has(ext)
    ) {
      return {
        ok: false,
        error:
          "Raw MOV/AVI/MKV cannot be transcoded in Workers. Run `npm run media:optimize -- --input <path>` (system FFmpeg) or the media-optimize GitHub Action, then upload the MP4. Browsers cannot reliably transcode large videos in-admin.",
        code: "needs_ffmpeg",
        kind,
        ext,
      };
    }
    if (!opts.clientOptimized && size > 80 * 1024 * 1024) {
      warnings.push(
        "Large video uploaded as-is. Prefer Node/CI FFmpeg optimize (≤200 MB, 1080p H.264).",
      );
    }
    return { ok: true, kind, ext, warnings };
  }

  if (kind === "audio") {
    if (size > AUDIO_MAX_BYTES) {
      return {
        ok: false,
        error: `Audio exceeds ${AUDIO_MAX_BYTES / (1024 * 1024)} MB. Convert to MP3 128kbps via \`npm run media:optimize\`.`,
        code: "audio_too_large",
        kind,
        ext,
      };
    }
    return { ok: true, kind, ext, warnings };
  }

  if (kind === "document") {
    if (size > DOCUMENT_MAX_BYTES) {
      return {
        ok: false,
        error: `Document exceeds ${DOCUMENT_MAX_BYTES / (1024 * 1024)} MB.`,
        code: "document_too_large",
        kind,
        ext,
      };
    }
    return { ok: true, kind, ext, warnings };
  }

  return {
    ok: false,
    error: `Unsupported file type .${ext || "unknown"}.`,
    code: "unsupported",
    kind,
    ext,
  };
}

/** Derive gallery/thumbs key from a primary gallery/videos/funfest object key. */
export function deriveThumbKey(primaryKey: string): string | null {
  if (primaryKey.startsWith("gallery/thumbs/")) return null;
  if (primaryKey.startsWith("gallery/")) {
    const rest = primaryKey.slice("gallery/".length).replace(/\.[^.]+$/, "");
    return `gallery/thumbs/${rest}.webp`;
  }
  if (primaryKey.startsWith("videos/")) {
    const rest = primaryKey.slice("videos/".length).replace(/\.[^.]+$/, "");
    return `gallery/thumbs/${rest}.webp`;
  }
  if (primaryKey.startsWith("funfest/")) {
    const rest = primaryKey.slice("funfest/".length).replace(/\.[^.]+$/, "");
    // Fun fest images use funfest/images|thumbs in some layouts; catalog also
    // accepts gallery/thumbs for video posters. Prefer funfest/thumbs for images.
    if (/\.(webp|jpg|jpeg|png|gif|avif)$/i.test(primaryKey)) {
      return `funfest/thumbs/${rest}.webp`;
    }
    return `gallery/thumbs/${rest}.webp`;
  }
  return null;
}
