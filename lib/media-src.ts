import type { Media } from "./types";
import { withBase } from "./base";
import { BUILD_ID } from "./build-id";

/** Prefer CMS thumb for slideshows / tiles — much smaller than full webp. */
export function mediaDisplaySrc(media: Pick<Media, "thumb" | "file">) {
  const path = withBase(media.thumb || media.file);
  if (!path) return path;
  const sep = path.includes("?") ? "&" : "?";
  // Bust browser/SW caches after every deploy so frames update
  return `${path}${sep}v=${encodeURIComponent(BUILD_ID)}`;
}

export function prefetchImage(src: string) {
  if (typeof window === "undefined" || !src) return;
  const img = new Image();
  img.decoding = "async";
  img.src = src;
}
