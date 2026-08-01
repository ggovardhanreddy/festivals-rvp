import fs from "node:fs";
import path from "node:path";
import type { Album, FestivalKey, MediaWithAlbum } from "./types";
import { festivalByKey } from "./site";
import { slugify } from "./slug";

const root = path.join(process.cwd(), "content");

function normalizeAlbum(raw: Album): Album {
  const album = { ...raw, year: String(raw.year), media: raw.media || [] };
  if (album.category?.toLowerCase().startsWith("birth")) {
    album.category = "Birthdays";
  } else {
    album.category = "Festivals";
  }
  if (!album.festival && album.category === "Festivals") {
    const fromSlug = album.slug.includes("vinayaka")
      ? "vinayaka-chavithi"
      : album.slug.includes("sankr")
        ? "sankranthi"
        : undefined;
    album.festival = fromSlug as FestivalKey | undefined;
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
      if (cat !== "festivals" && cat !== "birthdays") continue;
      for (const albumName of fs.readdirSync(categoryPath)) {
        const file = path.join(categoryPath, albumName, "metadata.json");
        if (!fs.existsSync(file)) continue;
        try {
          out.push(normalizeAlbum(JSON.parse(fs.readFileSync(file, "utf8"))));
        } catch {
          /* skip broken metadata */
        }
      }
    }
  }
  return out.sort(
    (a, b) => b.year.localeCompare(a.year) || a.order - b.order,
  );
}

export const years = () =>
  [...new Set(albums().map((a) => a.year))]
    .filter((y) => y !== "Unknown")
    .sort((a, b) => b.localeCompare(a));

export const publicAlbums = () => albums().filter((a) => a.published);

export const festivalAlbums = (key?: FestivalKey) =>
  publicAlbums().filter(
    (a) =>
      a.category === "Festivals" &&
      (!key || a.festival === key || a.slug.includes(key || "")),
  );

export const birthdayAlbums = () =>
  publicAlbums().filter((a) => a.category === "Birthdays");

export const allMedia = (): MediaWithAlbum[] =>
  publicAlbums().flatMap((album) =>
    album.media.map((media) => ({ ...media, album })),
  );

export const findAlbum = (
  year: string,
  category: string,
  slug: string,
) =>
  albums().find(
    (a) =>
      a.year === year &&
      slugify(a.category) === category &&
      a.slug === slug,
  );

export { albumHref } from "./site";

export const festivalTitle = (album: Album) =>
  festivalByKey(album.festival)?.title || album.title;

export { slugify };
