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

/** Primary nav — keep compact and scannable. */
export const NAV = [
  { href: "/", label: "Home" },
  { href: "/gallery/", label: "Gallery" },
  { href: "/events/", label: "Events" },
  { href: "/developments/", label: "Developments" },
  { href: "/suggestions/", label: "Suggestions" },
  { href: "/members/", label: "Members" },
  { href: "/contact/", label: "Contact" },
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
    key: "mathamma-jathara" as const,
    href: "/mathamma-jathara/",
    title: "Mathamma Jathara",
    eyebrow: "Village · Devotion",
    blurb: "The village gathers for Mathamma — drums, offerings, and shared faith.",
    story:
      "Mathamma Jathara brings the village into one rhythm — processions, offerings, and the living bond between people and place.",
  },
  {
    key: "devapatlamma-jathara" as const,
    href: "/devapatlamma-jathara/",
    title: "Devapatlamma Jathara",
    eyebrow: "Faith · Community",
    blurb: "Devapatlamma’s festival — lamps, community, and ancestral blessing.",
    story:
      "Devapatlamma Jathara is the village’s vow kept — temple light, shared meals, and the blessing of generations.",
  },
  {
    key: "sri-rama-navami" as const,
    href: "/sri-rama-navami/",
    title: "Sri Rama Navami",
    eyebrow: "Ramalayam · Grace",
    blurb: "Rama Navami at the village temple — hymns, color, and quiet devotion.",
    story:
      "Sri Rama Navami fills Ramalayam with hymns and flowers — a day of grace at the heart of Kondreddigaripalli.",
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
    title: "Fun Fest",
    eyebrow: "Members only",
    blurb: "Protected memories on the move — roads, laughter, and unexpected stops.",
    story:
      "Fun Fest holds the open chapters — buses, roadsides, shared snacks, and the freedom of leaving home only to remember it more clearly.",
  },
] as const;

export type BucketKey = (typeof BUCKETS)[number]["key"];

/** Festival chapter hero plates (from Downloads brand ingest). */
export const FESTIVAL_HEROES: Partial<Record<BucketKey, string>> = {
  "vinayaka-chavithi": "/brand/vinayaka-hero.webp",
  sankranthi: "/brand/sankranthi-hero.webp",
  "mathamma-jathara": "/brand/mathamma-hero.webp",
  "devapatlamma-jathara": "/brand/devapatlamma-hero.webp",
  "sri-rama-navami": "/brand/rama-navami-hero.webp",
  "fun-trips": "/brand/funfest-hero.webp",
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
  {
    key: "mathamma-jathara",
    slug: "mathamma-jathara",
    title: "Mathamma Jathara",
    eyebrow: "Village · Devotion",
    blurb: "The village gathers for Mathamma — drums, offerings, and shared faith.",
  },
  {
    key: "devapatlamma-jathara",
    slug: "devapatlamma-jathara",
    title: "Devapatlamma Jathara",
    eyebrow: "Faith · Community",
    blurb: "Devapatlamma’s festival — lamps, community, and ancestral blessing.",
  },
  {
    key: "sri-rama-navami",
    slug: "sri-rama-navami",
    title: "Sri Rama Navami",
    eyebrow: "Ramalayam · Grace",
    blurb: "Rama Navami at the village temple — hymns, color, and quiet devotion.",
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
  const festivalBuckets = [
    "vinayaka-chavithi",
    "sankranthi",
    "mathamma-jathara",
    "devapatlamma-jathara",
    "sri-rama-navami",
  ] as const;
  for (const key of festivalBuckets) {
    if (album.festival === key || album.slug === key || album.bucket === key) {
      return `/${key}/${album.year}/`;
    }
  }
  return `/${slugify(album.category)}/${album.year}/${album.slug}/`;
}
