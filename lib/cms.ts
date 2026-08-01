import type { BucketKey } from "./types";

/** Only these album folders are valid under content/<year>/ */
export const CMS_ALBUMS: BucketKey[] = [
  "sankranthi",
  "vinayaka-chavithi",
  "rvp-birthdays",
  "fun-trips",
];

export const CMS_ALBUM_SET = new Set<string>(CMS_ALBUMS);

export const CMS_IGNORE_NAMES = new Set([
  ".ds_store",
  "thumbs.db",
  "desktop.ini",
  ".gitkeep",
  "metadata.json",
  ".git",
]);

export function isYearDir(name: string) {
  return /^\d{4}$/.test(name);
}

export function isCmsAlbum(name: string): name is BucketKey {
  return CMS_ALBUM_SET.has(name);
}

export function albumMetaDefaults(year: string, bucket: BucketKey, slug: string) {
  const titles: Record<BucketKey, string> = {
    sankranthi: `Sankranthi ${year}`,
    "vinayaka-chavithi": `Vinayaka Chavithi ${year}`,
    "rvp-birthdays":
      slug === "rvp-birthdays" ? `RVP Birthdays ${year}` : `${titleCase(slug)} · ${year}`,
    "fun-trips": `Fun Trips ${year}`,
  };
  const category =
    bucket === "rvp-birthdays"
      ? ("Birthdays" as const)
      : bucket === "fun-trips"
        ? ("Trips" as const)
        : ("Festivals" as const);

  return {
    year,
    category,
    slug,
    title: titles[bucket],
    description: `${titles[bucket]} memories.`,
    published: true,
    order: 0,
    bucket,
    festival:
      bucket === "sankranthi" || bucket === "vinayaka-chavithi" ? bucket : undefined,
    personName:
      bucket === "rvp-birthdays" && slug !== "rvp-birthdays"
        ? titleCase(slug)
        : undefined,
  };
}

function titleCase(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
