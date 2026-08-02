import fs from "node:fs";
import path from "node:path";
import type { Album, BucketKey, FestivalKey, MediaWithAlbum } from "./types";
import { slugify } from "./slug";
import { CMS_ALBUMS, isCmsAlbum, isYearDir } from "./cms";

const root = path.join(process.cwd(), "content");
const generatedAlbums = path.join(process.cwd(), "generated", "albums.json");

function normalizeAlbum(raw: Album): Album {
  const album = { ...raw, year: String(raw.year), media: raw.media || [] };
  if (!album.bucket) {
    if (isCmsAlbum(album.slug)) album.bucket = album.slug;
    else if (album.category === "Birthdays" || album.slug.includes("birthday")) {
      album.bucket = "rvp-birthdays";
      album.category = "Birthdays";
    } else if (album.slug === "fun-trips" || album.category === "Trips") {
      album.bucket = "fun-trips";
      album.category = "Trips";
    } else if (
      album.festival === "vinayaka-chavithi" ||
      album.slug.includes("vinayaka")
    ) {
      album.bucket = "vinayaka-chavithi";
      album.festival = "vinayaka-chavithi";
      album.category = "Festivals";
    } else if (album.festival === "sankranthi" || album.slug.includes("sankr")) {
      album.bucket = "sankranthi";
      album.festival = "sankranthi";
      album.category = "Festivals";
    } else if (
      album.festival === "mathamma-jathara" ||
      album.slug.includes("mathamma")
    ) {
      album.bucket = "mathamma-jathara";
      album.festival = "mathamma-jathara";
      album.category = "Festivals";
    } else if (
      album.festival === "devapatlamma-jathara" ||
      album.slug.includes("devapatlamma")
    ) {
      album.bucket = "devapatlamma-jathara";
      album.festival = "devapatlamma-jathara";
      album.category = "Festivals";
    } else if (
      album.festival === "sri-rama-navami" ||
      album.slug.includes("rama-navami") ||
      album.slug.includes("ramanavami")
    ) {
      album.bucket = "sri-rama-navami";
      album.festival = "sri-rama-navami";
      album.category = "Festivals";
    } else {
      album.bucket = "fun-trips";
      album.category = "Trips";
    }
  }
  return album;
}

function albumsFromGenerated(): Album[] | null {
  if (!fs.existsSync(generatedAlbums)) return null;
  try {
    const raw = JSON.parse(fs.readFileSync(generatedAlbums, "utf8")) as Album[];
    // Empty generated file usually means sync is mid-run — fall back to disk.
    if (!Array.isArray(raw) || raw.length === 0) return null;
    return raw.map(normalizeAlbum);
  } catch {
    return null;
  }
}

/** Legacy + flat metadata fallback when generated/albums.json is missing. */
function albumsFromDiskScan(): Album[] {
  if (!fs.existsSync(root)) return [];
  const out: Album[] = [];

  for (const year of fs.readdirSync(root)) {
    const yearPath = path.join(root, year);
    if (!fs.statSync(yearPath).isDirectory()) continue;
    if (!isYearDir(year) && year !== "Unknown") continue;

    // Flat CMS layout: content/YEAR/album/metadata.json
    for (const albumName of fs.readdirSync(yearPath)) {
      if (!isCmsAlbum(albumName)) continue;
      const albumPath = path.join(yearPath, albumName);
      if (!fs.statSync(albumPath).isDirectory()) continue;

      const metaFile = path.join(albumPath, "metadata.json");
      if (fs.existsSync(metaFile)) {
        try {
          out.push(normalizeAlbum(JSON.parse(fs.readFileSync(metaFile, "utf8"))));
        } catch {
          /* skip */
        }
      }

      if (albumName === "rvp-birthdays") {
        for (const person of fs.readdirSync(albumPath)) {
          const personPath = path.join(albumPath, person);
          if (!fs.statSync(personPath).isDirectory()) continue;
          const personMeta = path.join(personPath, "metadata.json");
          if (!fs.existsSync(personMeta)) continue;
          try {
            out.push(normalizeAlbum(JSON.parse(fs.readFileSync(personMeta, "utf8"))));
          } catch {
            /* skip */
          }
        }
      }
    }

    // Legacy nested layout
    for (const category of fs.readdirSync(yearPath)) {
      const categoryPath = path.join(yearPath, category);
      if (!fs.statSync(categoryPath).isDirectory()) continue;
      const cat = category.toLowerCase();
      if (!["festivals", "birthdays", "trips"].includes(cat)) continue;
      for (const albumName of fs.readdirSync(categoryPath)) {
        const file = path.join(categoryPath, albumName, "metadata.json");
        if (!fs.existsSync(file)) continue;
        try {
          out.push(normalizeAlbum(JSON.parse(fs.readFileSync(file, "utf8"))));
        } catch {
          /* skip */
        }
      }
    }
  }

  // Dedupe by year+bucket+slug
  const map = new Map<string, Album>();
  for (const album of out) {
    map.set(`${album.year}:${album.bucket}:${album.slug}`, album);
  }
  return [...map.values()].sort(
    (a, b) => b.year.localeCompare(a.year) || a.order - b.order,
  );
}

export function albums(): Album[] {
  return albumsFromGenerated() ?? albumsFromDiskScan();
}

export const publicAlbums = () => albums().filter((a) => a.published);

/** Published albums that actually contain media — empty CMS folders stay hidden. */
export const liveAlbums = () =>
  publicAlbums().filter((a) => (a.media?.length ?? 0) > 0);

/** Years that actually have published media — skip empty stub folders. */
export const years = () =>
  [...new Set(liveAlbums().map((a) => a.year))]
    .filter((y) => y !== "Unknown")
    .sort((a, b) => b.localeCompare(a));

export const albumsByBucket = (bucket: BucketKey) =>
  liveAlbums().filter((a) => a.bucket === bucket);

/** True when a CMS bucket folder has at least one published image/video. */
export function bucketHasContent(bucket: BucketKey | string | undefined) {
  if (!bucket) return false;
  return liveAlbums().some((a) => a.bucket === bucket);
}

export function bucketsWithContent(): BucketKey[] {
  return [
    ...new Set(
      liveAlbums()
        .map((a) => a.bucket)
        .filter((b): b is BucketKey => Boolean(b)),
    ),
  ];
}

export const festivalAlbums = (key?: FestivalKey) =>
  liveAlbums().filter(
    (a) =>
      a.category === "Festivals" &&
      (!key || a.festival === key || a.bucket === key),
  );

export const birthdayAlbums = () => albumsByBucket("rvp-birthdays");
export const tripAlbums = () => albumsByBucket("fun-trips");

export const allMedia = (): MediaWithAlbum[] =>
  liveAlbums().flatMap((album) =>
    album.media.map((media) => ({ ...media, album })),
  );

export const findAlbum = (year: string, category: string, slug: string) =>
  albums().find(
    (a) => a.year === year && slugify(a.category) === category && a.slug === slug,
  );

export const findYearBucketAlbum = (bucket: BucketKey, year: string) =>
  publicAlbums().find(
    (a) => a.bucket === bucket && a.year === year && a.slug === bucket,
  ) || publicAlbums().find((a) => a.bucket === bucket && a.year === year);

export const cmsAlbumFolders = () => CMS_ALBUMS;

export { albumHref } from "./site";
export { slugify };
