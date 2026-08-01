import path from "node:path";
import type { FestivalKey } from "./types";
export { slugify, titleCase } from "./slug";

export const ROOT = process.cwd();
export const CONTENT_DIR = path.join(ROOT, "content");
export const ORIGINALS_DIR = path.join(ROOT, "originals");
export const PUBLIC_IMAGES_DIR = path.join(ROOT, "public", "images");
export const PUBLIC_THUMBS_DIR = path.join(ROOT, "public", "thumbs");
export const HASH_INDEX_PATH = path.join(CONTENT_DIR, "hashes.json");

export const CATEGORIES = ["festivals", "birthdays"] as const;
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

export function detectFestival(parts: string[]): FestivalKey | undefined {
  const blob = parts.join(" ").toLowerCase();
  if (/\b(vinayaka|ganesh|ganesha|chavithi|chaturthi)\b/.test(blob)) {
    return "vinayaka-chavithi";
  }
  if (/\b(sankranthi|sankranti|pongal)\b/.test(blob)) return "sankranthi";
  return undefined;
}

export function detectCategory(
  parts: string[],
  fallback: Category = "festivals",
): Category {
  const blob = parts.join(" ").toLowerCase();
  if (/\b(birthday|birthdays)\b/.test(blob)) return "birthdays";
  if (
    /\b(festival|festivals|sankranthi|sankranti|vinayaka|ganesh|chavithi)\b/.test(
      blob,
    )
  ) {
    return "festivals";
  }
  for (const part of parts) {
    const key = part.toLowerCase();
    if ((CATEGORIES as readonly string[]).includes(key)) return key as Category;
  }
  return fallback;
}

export function categoryLabel(category: Category | string): "Festivals" | "Birthdays" {
  return category.toLowerCase().startsWith("birth") ? "Birthdays" : "Festivals";
}
