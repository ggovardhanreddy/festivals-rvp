import type { Album, FestivalKey } from "./types";
import { slugify } from "./slug";

export const SITE_NAME = "RVP Memories";
export const SITE_BRAND = "Festivals RVP";
export const ADMIN_NAME = "Govardhan Reddy";

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/timeline/", label: "Timeline" },
  { href: "/festivals/", label: "Festivals" },
  { href: "/birthdays/", label: "Birthdays" },
  { href: "/search/", label: "Search" },
  { href: "/about/", label: "About" },
] as const;

export const FESTIVALS: {
  key: FestivalKey;
  slug: string;
  title: string;
  eyebrow: string;
  blurb: string;
}[] = [
  {
    key: "sankranthi",
    slug: "sankranthi",
    title: "Sankranthi",
    eyebrow: "Harvest · Light · Home",
    blurb:
      "Rangoli, sweetness, and the quiet joy of a family harvest celebration.",
  },
  {
    key: "vinayaka-chavithi",
    slug: "vinayaka-chavithi",
    title: "Vinayaka Chavithi",
    eyebrow: "Devotion · Beginnings",
    blurb:
      "Clay, lamp light, and prayers that mark a beloved beginning each year.",
  },
];

export function festivalBySlug(slug: string) {
  return FESTIVALS.find((f) => f.slug === slug);
}

export function festivalByKey(key?: FestivalKey) {
  return FESTIVALS.find((f) => f.key === key);
}

export function albumHref(album: Album) {
  return `/${slugify(album.category)}/${album.year}/${album.slug}/`;
}
