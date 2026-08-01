import type { Album, FestivalKey } from "./types";
import { slugify } from "./slug";

export const SITE_NAME = "RVP Youth";
export const SITE_BRAND = "RVP Youth";
export const ADMIN_NAME = "Govardhan Reddy";
/** Primary brand line */
export const SITE_TAGLINE = "Where Every Celebration Becomes a Legacy.";
export const SITE_TAGLINE_HERITAGE = "Our Village. Our Heritage. Our Memories.";
export const SITE_TAGLINE_TOGETHER = "Together We Celebrate. Together We Remember.";
export const SITE_TAGLINE_TOMORROW = "From Traditions to Tomorrow.";
/** Landing hero line */
export const SITE_TAGLINE_LANDING =
  "Celebrating Every Moment. Preserving Every Memory.";
/** Brand lines shown on the cinematic landing before Explore */
export const LANDING_BRAND_TAGLINES = [
  SITE_TAGLINE,
  SITE_TAGLINE_HERITAGE,
  SITE_TAGLINE_TOGETHER,
  SITE_TAGLINE_TOMORROW,
] as const;
export const SITE_TAGLINES = [
  SITE_TAGLINE_LANDING,
  ...LANDING_BRAND_TAGLINES,
] as const;
/** Short descriptor for SEO / utility contexts */
export const SITE_DESCRIPTOR = "Digital Village Experience";

/** Village identity */
export const VILLAGE_NAME = "Kondreddigaripalli";
export const VILLAGE_ALSO_KNOWN_AS = "Reddivaripalli";
export const VILLAGE_ADDRESS = {
  village: "Kondreddigaripalli (Reddivaripalli)",
  post: "Devepatla (P)",
  mandal: "Sambepalli (M)",
  district: "Annamayya Dist",
  pincode: "516215",
  state: "Andhra Pradesh",
  country: "India",
} as const;

export const VILLAGE_ADDRESS_LINE = [
  VILLAGE_ADDRESS.village,
  VILLAGE_ADDRESS.post,
  VILLAGE_ADDRESS.mandal,
  VILLAGE_ADDRESS.district,
  `PIN ${VILLAGE_ADDRESS.pincode}`,
].join(", ");

/** Google Maps — Ramalayam, Kondreddigaripalli */
export const VILLAGE_MAPS_URL = "https://maps.app.goo.gl/w7Nn7pbXju6uQ6vx6";
export const VILLAGE_MAPS_EMBED =
  "https://www.google.com/maps?q=13.9039796,78.7552737&z=18&output=embed";
export const VILLAGE_COORDS = {
  lat: 13.9039796,
  lng: 78.7552737,
  label: "Ramalayam",
  labelTe: "రామాలయం",
} as const;

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

/** Festival chapter hero plates (never leave bucket pages blank). */
export const FESTIVAL_HEROES: Partial<Record<BucketKey, string>> = {
  "vinayaka-chavithi": "/brand/vinayaka-hero.webp",
  sankranthi: "/brand/og-banner.jpg",
};

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
