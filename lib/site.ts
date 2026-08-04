import type { Album, FestivalKey } from "./types";
import type { BucketKey as CmsBucketKey } from "./types";
import { slugify } from "./slug";
import {
  CULTURE_FESTIVALS,
  festivalHeroPath,
  FESTIVAL_ASSET_VERSION,
} from "./festivals";

export const SITE_NAME = "RVP Youth";
export const SITE_BRAND = "RVP Youth";
export const ADMIN_NAME = "Govardhan Reddy";
/**
 * Official framing — this portal is the digital home of the village,
 * stewarded by RVP Youth. Prefer these when speaking for the Gram Panchayat.
 */
export const OFFICIAL_TITLE = "Reddivaripalli Gram Panchayat";
export const OFFICIAL_SUBTITLE = "Official Digital Identity";
export const OFFICIAL_MISSION =
  "The living digital home of Reddivaripalli — preserving festivals, people, projects, and history for generations.";
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
export const SITE_DESCRIPTOR = "Official Digital Identity of Reddivaripalli";

/** Village identity */
export const VILLAGE_NAME = "Kondreddigaripalli";
export const VILLAGE_ALSO_KNOWN_AS = "Reddivaripalli";
/** Common spelling variants used in local search */
export const VILLAGE_NAME_VARIANTS = [
  "Reddivaripalli",
  "Reddivari Palli",
  "Reddivaripalle",
  "Kondreddigaripalli",
] as const;

export const VILLAGE_ADDRESS = {
  village: "Reddivaripalli (Kondreddigaripalli)",
  /** Administrative home of this digital portal */
  gramPanchayat: "Reddivaripalli Gram Panchayat",
  region: "Devapatla region",
  post: "Devapatla (P)",
  mandal: "Sambepalle (Sambepalli) Mandal",
  district: "YSR Kadapa (Annamayya) District",
  pincode: "516215",
  state: "Andhra Pradesh",
  country: "India",
} as const;

export const VILLAGE_ADDRESS_LINE = [
  VILLAGE_ADDRESS.village,
  VILLAGE_ADDRESS.gramPanchayat,
  VILLAGE_ADDRESS.post,
  VILLAGE_ADDRESS.mandal,
  VILLAGE_ADDRESS.district,
  `PIN ${VILLAGE_ADDRESS.pincode}`,
  VILLAGE_ADDRESS.state,
].join(", ");

export const SEO_TITLE =
  "Reddivaripalli Gram Panchayat | Official Digital Identity | Sambepalle | YSR Kadapa | Andhra Pradesh";

export const SEO_DESCRIPTION =
  "Official digital home of Reddivaripalli Gram Panchayat in the Devapatla region of Sambepalle Mandal, YSR Kadapa District, Andhra Pradesh. Explore village history, festivals, gallery, members, developments, directory, and community services — preserved for the next decade and beyond.";

export const SEO_KEYWORDS = [
  "Reddivaripalli",
  "Reddivari Palli",
  "Reddivaripalle",
  "Kondreddigaripalli",
  "Reddivaripalli Gram Panchayat",
  "Devapatla",
  "Devapatla Gram Panchayat",
  "Devepatla",
  "Sambepalle",
  "Sambepalli",
  "YSR Kadapa",
  "Kadapa District",
  "Annamayya District",
  "Andhra Pradesh",
  "RVP Youth",
  "Village Development",
  "Sri Ramalayam",
  "Vinayaka Chavithi",
  "Varalakshmi Vratam",
  "Mathamma Jathara",
  "Devapatlamma Jathara",
  "Sankranti",
  "Sankranthi",
  "Sri Rama Navami",
  "Ugadi",
  "Deepavali",
  "Dasara",
  "Heritage Archive",
  "Our Heritage",
  "Vana Pandaga",
  "Village Directory",
] as const;

/** Google Maps — Ramalayam, Kondreddigaripalli */
export const VILLAGE_MAPS_URL = "https://maps.app.goo.gl/w7Nn7pbXju6uQ6vx6";
/** Community / heritage map shared in foundation docs */
export const VILLAGE_HERITAGE_MAPS_URL =
  "https://maps.app.goo.gl/xUJPzTMHyv6NSE899";
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
  { href: "/directory/", label: "Directory" },
  { href: "/developments/", label: "Developments" },
  { href: "/members/", label: "Members" },
  { href: "/contact/", label: "Contact" },
] as const;

/** Secondary community links (drawer / footer). */
export const COMMUNITY_NAV = [
  { href: "/about/", label: "Our Heritage" },
  { href: "/heritage/", label: "Heritage Archive" },
  { href: "/documents/", label: "Panchayat Documents" },
  { href: "/suggestions/", label: "Suggestions" },
  { href: "/timeline/", label: "Timeline" },
] as const;

export const BUCKETS = [
  ...CULTURE_FESTIVALS.map((f) => ({
    key: f.key as CmsBucketKey,
    href: `/${f.slug}/`,
    title: f.title,
    eyebrow: f.eyebrow,
    blurb: f.blurb,
    story: f.story,
  })),
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
    blurb: "Private memories on the move — roads, laughter, and unexpected stops.",
    story:
      "Fun Fest holds the open chapters — buses, roadsides, shared snacks, and the freedom of leaving home only to remember it more clearly. Sign in with your member name to enter.",
  },
] as const;

export type BucketKey = (typeof BUCKETS)[number]["key"];

/** Festival chapter heroes under /public/festivals/<folder>/hero.webp */
export const FESTIVAL_HERO_VERSION = FESTIVAL_ASSET_VERSION;

export const FESTIVAL_HEROES: Partial<Record<BucketKey, string>> = {
  ...Object.fromEntries(
    CULTURE_FESTIVALS.map((f) => [f.key, festivalHeroPath(f.folder)]),
  ),
  "fun-trips": `/brand/funfest-hero-locked.webp?v=${FESTIVAL_HERO_VERSION}`,
};

/**
 * Legacy brand plates — not used on the homepage.
 * Homepage hero is permanently locked to Vanta Birds (`HomeHero`).
 * Festival chapter pages continue to use `FESTIVAL_HEROES` / festival folders.
 */
export const LOCKED_HOME_HERO_SLIDES = [
  "/brand/village-aerial.webp",
] as const;

export const FESTIVALS: {
  key: FestivalKey;
  slug: string;
  title: string;
  eyebrow: string;
  blurb: string;
}[] = CULTURE_FESTIVALS.map((f) => ({
  key: f.key as FestivalKey,
  slug: f.slug,
  title: f.title,
  eyebrow: f.eyebrow,
  blurb: f.blurb,
}));

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
  for (const fest of CULTURE_FESTIVALS) {
    const key = fest.slug;
    if (
      album.festival === fest.key ||
      album.slug === key ||
      album.bucket === fest.key
    ) {
      return `/${key}/${album.year}/`;
    }
  }
  return `/${slugify(album.category)}/${album.year}/${album.slug}/`;
}
