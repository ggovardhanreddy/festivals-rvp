import fs from "node:fs";
import path from "node:path";
import type { Album, BucketKey, FestivalKey, MediaWithAlbum } from "./types";
import { slugify } from "./slug";

const root = path.join(process.cwd(), "content");

function normalizeAlbum(raw: Album): Album {
  const album = { ...raw, year: String(raw.year), media: raw.media || [] };
  if (!album.bucket) {
    if (album.category === "Birthdays" || album.slug.includes("birthday")) {
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
    } else {
      album.bucket = "fun-trips";
      album.category = "Trips";
    }
  }
  return album;
}

export function albums(): Album[] {
  if (!fs.existsSync(root)) return [];
  const out: Album[] = [];
  for (const year of fs.readdirSync(root)) {
    const yearPath = path.join(root, year);
    if (!fs.statSync(yearPath).isDirectory()) continue;
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
  return out.sort((a, b) => b.year.localeCompare(a.year) || a.order - b.order);
}

export const years = () =>
  [...new Set(albums().map((a) => a.year))]
    .filter((y) => y !== "Unknown")
    .sort((a, b) => b.localeCompare(a));

export const publicAlbums = () => albums().filter((a) => a.published);

export const albumsByBucket = (bucket: BucketKey) =>
  publicAlbums().filter((a) => a.bucket === bucket);

export const festivalAlbums = (key?: FestivalKey) =>
  publicAlbums().filter(
    (a) => a.category === "Festivals" && (!key || a.festival === key || a.bucket === key),
  );

export const birthdayAlbums = () => albumsByBucket("rvp-birthdays");
export const tripAlbums = () => albumsByBucket("fun-trips");

export const allMedia = (): MediaWithAlbum[] =>
  publicAlbums().flatMap((album) => album.media.map((media) => ({ ...media, album })));

export const findAlbum = (year: string, category: string, slug: string) =>
  albums().find(
    (a) => a.year === year && slugify(a.category) === category && a.slug === slug,
  );

export const findYearBucketAlbum = (bucket: BucketKey, year: string) =>
  publicAlbums().find((a) => a.bucket === bucket && a.year === year);

export { albumHref } from "./site";
export { slugify };
