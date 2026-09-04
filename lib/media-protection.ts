import type { Album, Media, MediaProtection, SiteSettings } from "./types";
import { DEFAULT_SITE_SETTINGS } from "./community";

export function mediaProtectionKey(media: Pick<Media, "id" | "file">): string[] {
  const keys = [media.id];
  if (media.file) keys.push(media.file);
  return keys.filter(Boolean);
}

export function ruleForMedia(
  media: Pick<Media, "id" | "file">,
  rules: MediaProtection[],
): MediaProtection | undefined {
  const keys = new Set(mediaProtectionKey(media));
  return rules.find((rule) => keys.has(rule.id));
}

export function isPublicMedia(
  media: Pick<Media, "id" | "file" | "visibility">,
  rules: MediaProtection[] = [],
): boolean {
  if (media.visibility === "private") return false;
  const rule = ruleForMedia(media, rules);
  if (!rule) return true;
  return rule.visibility !== "private";
}

export function shouldWatermarkMedia(
  media: Pick<Media, "id" | "file" | "watermark">,
  rules: MediaProtection[] = [],
  settings: Pick<SiteSettings, "watermarkEnabled"> = DEFAULT_SITE_SETTINGS,
): boolean {
  const rule = ruleForMedia(media, rules);
  if (rule) return rule.watermark;
  if (typeof media.watermark === "boolean") return media.watermark;
  return settings.watermarkEnabled !== false;
}

export function filterPublicMedia<T extends Pick<Media, "id" | "file" | "visibility">>(
  items: T[],
  rules: MediaProtection[] = [],
): T[] {
  return items.filter((item) => isPublicMedia(item, rules));
}

export function filterPublicAlbum(
  album: Album,
  rules: MediaProtection[] = [],
): Album {
  return {
    ...album,
    media: filterPublicMedia(album.media || [], rules),
  };
}
