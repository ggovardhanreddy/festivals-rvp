import path from "node:path";

export const ROOT = process.cwd();
export const CONTENT_DIR = path.join(ROOT, "content");
export const ORIGINALS_DIR = path.join(ROOT, "originals");
export const PUBLIC_IMAGES_DIR = path.join(ROOT, "public", "images");
export const PUBLIC_THUMBS_DIR = path.join(ROOT, "public", "thumbs");
export const HASH_INDEX_PATH = path.join(CONTENT_DIR, "hashes.json");

export const CATEGORIES = [
  "festivals",
  "family",
  "trips",
  "birthdays",
  "misc",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const IMAGE_EXTS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".heic",
  ".webp",
  ".avif",
  ".gif",
]);

export const VIDEO_EXTS = new Set([".mp4", ".mov", ".webm", ".mkv"]);

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80) || "memory";
}

export function titleCase(value: string): string {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function detectCategory(parts: string[], fallback: Category = "misc"): Category {
  const blob = parts.join(" ").toLowerCase();
  if (/\b(festival|festivals|diwali|sankranti|holi|navratri|christmas|eid|pongal)\b/.test(blob)) {
    return "festivals";
  }
  if (/\b(trip|trips|travel|vacation|tour|holiday|goa|coorg)\b/.test(blob)) {
    return "trips";
  }
  if (/\b(birthday|birthdays)\b/.test(blob)) return "birthdays";
  if (/\b(family|home|relatives)\b/.test(blob)) return "family";
  for (const part of parts) {
    const key = part.toLowerCase();
    if ((CATEGORIES as readonly string[]).includes(key)) return key as Category;
  }
  return fallback;
}

export function categoryLabel(category: Category | string): string {
  return titleCase(category);
}
