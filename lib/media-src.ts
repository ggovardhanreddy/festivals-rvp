import type { Media } from "./types";
import { withBase } from "./base";
import { BUILD_ID } from "./build-id";
import {
  isPrivateMediaPath,
  pathToR2Key,
  resolveMediaUrl,
  r2Enabled,
} from "./media-url";

/** Prefer CMS thumb for slideshows / tiles — much smaller than full webp. */
export function mediaDisplaySrc(media: Pick<Media, "thumb" | "file">) {
  const raw = media.thumb || media.file;
  const resolved = resolveMediaUrl(raw);
  const path = /^https?:\/\//i.test(resolved) ? resolved : withBase(resolved);
  if (!path) return path;
  // Absolute R2 URLs already version via object keys; still allow soft bust
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}v=${encodeURIComponent(BUILD_ID)}`;
}

/** Full-resolution / download source (file, not thumb). */
export function mediaFileSrc(media: Pick<Media, "file" | "original">) {
  const raw = media.original || media.file;
  const resolved = resolveMediaUrl(raw);
  return /^https?:\/\//i.test(resolved) ? resolved : withBase(resolved);
}

/** Private media should use the signed media API when R2 is enabled. */
export function mediaPrivateApiPath(path: string): string | null {
  if (!r2Enabled() || !isPrivateMediaPath(path)) return null;
  const key = pathToR2Key(path);
  return `/api/media/sign?key=${encodeURIComponent(key)}`;
}

export function prefetchImage(src: string) {
  if (typeof window === "undefined" || !src) return;
  const img = new Image();
  img.decoding = "async";
  img.src = src;
}
