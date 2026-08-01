import type { Media } from "./types";
import { withBase } from "./base";

/** Prefer CMS thumb for slideshows / tiles — much smaller than full webp. */
export function mediaDisplaySrc(media: Pick<Media, "thumb" | "file">) {
  return withBase(media.thumb || media.file);
}

export function prefetchImage(src: string) {
  if (typeof window === "undefined" || !src) return;
  const img = new Image();
  img.decoding = "async";
  img.src = src;
}
