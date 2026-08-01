import type { Album, FestivalKey } from "./types";
import { slugify } from "./slug";

export const SITE_NAME = "RVP Youth";
export const SITE_BRAND = "RVP Youth";
export const ADMIN_NAME = "Govardhan Reddy";
export const SITE_TAGLINE = "Digital Village Experience";

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/sankranthi/", label: "Sankranthi" },
  { href: "/vinayaka-chavithi/", label: "Vinayaka Chavithi" },
  { href: "/rvp-birthdays/", label: "RVP Birthdays" },
  { href: "/fun-trips/", label: "Fun Trips" },
  { href: "/timeline/", label: "Timeline" },
  { href: "/search/", label: "Search" },
  { href: "/about/", label: "About" },
] as const;

export const BUCKETS = [
  {
    key: "sankranthi" as const,
    href: "/sankranthi/",
    title: "Sankranthi",
    eyebrow: "Harvest · Light · Home",
    blurb: "Rangoli, sweetness, and the quiet joy of beginning the year together.",
    story:
      "Sankranthi arrives with harvest light — rangoli at the door, sesame sweetness, and the village gathering as one family under a newly opened year.",
  },
  {
    key: "vinayaka-chavithi" as const,
    href: "/vinayaka-chavithi/",
    title: "Vinayaka Chavithi",
    eyebrow: "Devotion · Beginnings",
    blurb: "Clay, lamp light, and prayers that mark a beloved beginning each year.",
    story:
      "Vinayaka Chavithi fills the house with clay idols, lamp glow, and first prayers — a tender beginning renewed each monsoon season.",
  },
  {
    key: "rvp-birthdays" as const,
    href: "/rvp-birthdays/",
    title: "RVP Birthdays",
    eyebrow: "People we love",
    blurb: "Candles, laughter, and the warmth of another year celebrated.",
    story:
      "Birthdays hold the faces we love most — cake light, teasing, and the soft archive of another year lived together.",
  },
  {
    key: "fun-trips" as const,
    href: "/fun-trips/",
    title: "Fun Trips",
    eyebrow: "Journeys & moments",
    blurb: "Memories on the move — roads, laughter, and unexpected stops.",
    story:
      "Fun trips are the open chapters — buses, roadsides, shared snacks, and the freedom of leaving home only to remember it more clearly.",
  },
] as const;

export type BucketKey = (typeof BUCKETS)[number]["key"];

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
    blurb: "Rangoli, sweetness, and the quiet joy of a family harvest celebration.",
  },
  {
    key: "vinayaka-chavithi",
    slug: "vinayaka-chavithi",
    title: "Vinayaka Chavithi",
    eyebrow: "Devotion · Beginnings",
    blurb: "Clay, lamp light, and prayers that mark a beloved beginning each year.",
  },
];

export function festivalBySlug(slug: string) {
  return FESTIVALS.find((f) => f.slug === slug);
}

export function festivalByKey(key?: FestivalKey) {
  return FESTIVALS.find((f) => f.key === key);
}

export function bucketByKey(key: string) {
  return BUCKETS.find((b) => b.key === key);
}

export function albumHref(album: Album) {
  if (album.category === "Birthdays" || album.bucket === "rvp-birthdays") {
    return `/rvp-birthdays/${album.year}/${album.slug}/`;
  }
  if (album.bucket === "fun-trips" || album.slug === "fun-trips") {
    return `/fun-trips/${album.year}/`;
  }
  if (album.festival === "vinayaka-chavithi" || album.slug === "vinayaka-chavithi") {
    return `/vinayaka-chavithi/${album.year}/`;
  }
  if (album.festival === "sankranthi" || album.slug === "sankranthi") {
    return `/sankranthi/${album.year}/`;
  }
  return `/${slugify(album.category)}/${album.year}/${album.slug}/`;
}
