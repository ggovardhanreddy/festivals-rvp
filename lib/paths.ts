import path from "node:path";
import type { BucketKey, FestivalKey } from "./types";
export { slugify, titleCase } from "./slug";

export const ROOT = process.cwd();
export const CONTENT_DIR = path.join(ROOT, "content");
export const ORIGINALS_DIR = path.join(ROOT, "originals");
export const PUBLIC_IMAGES_DIR = path.join(ROOT, "public", "images");
export const PUBLIC_THUMBS_DIR = path.join(ROOT, "public", "thumbs");
export const PUBLIC_VIDEOS_DIR = path.join(ROOT, "public", "videos");
export const PUBLIC_AUDIO_DIR = path.join(ROOT, "public", "audio");
export const PUBLIC_DOCS_DIR = path.join(ROOT, "public", "docs");
export const REVIEW_DIR = path.join(ROOT, "review", "near-duplicates");
export const HASH_INDEX_PATH = path.join(CONTENT_DIR, "hashes.json");
export const PHASH_INDEX_PATH = path.join(CONTENT_DIR, "phashes.json");

export const DEFAULT_IMPORT_DIR =
  "/Users/govardhan.reddy.g.94gmail.com/Downloads/Photos";

export const BUCKET_FOLDERS: BucketKey[] = [
  "sankranthi",
  "vinayaka-chavithi",
  "mathamma-jathara",
  "devapatlamma-jathara",
  "sri-rama-navami",
  "rvp-birthdays",
  "fun-trips",
];

export {
  IMAGE_EXTS,
  IMAGE_SOURCE_EXTS,
  VIDEO_EXTS,
  VIDEO_PLAYABLE_EXTS,
  VIDEO_CONVERT_EXTS,
  AUDIO_EXTS,
  DOCUMENT_EXTS,
  detectMediaKind,
  mimeForExt,
  isDisplayableImageUrl,
} from "./media-formats";

export function detectFestival(parts: string[]): FestivalKey | undefined {
  const blob = parts.join(" ").toLowerCase();
  if (/\b(vinayaka|ganesh|ganesha|chavithi|chaturthi|vinakaya)\b/.test(blob)) {
    return "vinayaka-chavithi";
  }
  if (/\b(sankranthi|sankranti|pongal)\b/.test(blob)) return "sankranthi";
  if (/\b(mathamma)\b/.test(blob)) return "mathamma-jathara";
  if (/\b(devapatlamma|devepatla)\b/.test(blob)) return "devapatlamma-jathara";
  if (/\b(rama\s*navami|sreerama|sri-?rama|ramanavami)\b/.test(blob)) {
    return "sri-rama-navami";
  }
  return undefined;
}

export function isBirthdayHint(parts: string[]): boolean {
  return /\b(birthday|birthdays|bday|rvp-birthdays)\b/.test(
    parts.join(" ").toLowerCase(),
  );
}

export function isTripHint(parts: string[]): boolean {
  return /\b(trip|trips|travel|tour|vacation|fun-trips|fun-fest|funfest)\b/.test(
    parts.join(" ").toLowerCase(),
  );
}

/**
 * Classify into CMS buckets. Uncertain images go to fun-trips.
 */
export function classifyMedia(input: {
  pathParts: string[];
  fileName: string;
  date: Date;
  unknownYear: boolean;
}): { bucket: BucketKey; personName?: string; festival?: FestivalKey } {
  const parts = [...input.pathParts, input.fileName];

  if (isBirthdayHint(parts)) {
    const person =
      input.pathParts
        .filter(
          (part) =>
            !/^(birthdays?|bday|rvp-birthdays|fest|downloads?|fun-trips|photos|images)$/i.test(
              part,
            ),
        )
        .at(-1) || "rvp-birthday";
    return { bucket: "rvp-birthdays", personName: person };
  }

  const festival = detectFestival(parts);
  if (festival) return { bucket: festival, festival };

  if (isTripHint(parts)) return { bucket: "fun-trips" };

  if (!input.unknownYear) {
    const month = input.date.getMonth() + 1;
    if (month === 1) return { bucket: "sankranthi", festival: "sankranthi" };
    if (month === 3 || month === 4) {
      return { bucket: "sri-rama-navami", festival: "sri-rama-navami" };
    }
    if (month === 8 || month === 9) {
      return { bucket: "vinayaka-chavithi", festival: "vinayaka-chavithi" };
    }
  }

  return { bucket: "fun-trips" };
}

export function publicRelFor(input: {
  year: string;
  bucket: BucketKey;
  personName?: string;
  baseName: string;
}): string {
  if (input.bucket === "rvp-birthdays") {
    return path.join(
      input.year,
      "rvp-birthdays",
      input.personName || "rvp-birthday",
      input.baseName,
    );
  }
  return path.join(input.year, input.bucket, input.baseName);
}
