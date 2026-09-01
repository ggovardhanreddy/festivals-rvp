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
/** Brand pillars from the village lockup */
export const SITE_TAGLINE_PILLARS = "Heritage · Community · Progress";
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

export const SEO_TITLE = "Reddivaripalli | Heritage \u00b7 Community \u00b7 Progress";

/**
 * Homepage description. The first sentence is the promise; the locality tail
 * stays because it is what local search actually matches on.
 */
export const SEO_DESCRIPTION =
  "Discover Reddivaripalli \u2014 its heritage, people, traditions, events, memories and village development. Reddivaripalli (Kondreddigaripalli) Gram Panchayat, Sambepalle Mandal, Annamayya / YSR Kadapa, Andhra Pradesh 516215.";

/** Public contact inbox — override with NEXT_PUBLIC_CONTACT_EMAIL at build time. */
export const SITE_CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ||
  "reddivaripalli.rvp@gmail.com";

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

/**
 * Primary navigation — seven items, never more.
 *
 * Everything else lives behind More (MORE_NAV) or in the footer. Nothing is
 * removed from the site by being absent here: every route below still resolves
 * and is still reachable, it just stops competing for space in the header.
 */
export const NAV = [
  { href: "/", label: "Home" },
  { href: "/about/", label: "Our Village" },
  { href: "/members/", label: "People" },
  { href: "/events/", label: "Events" },
  { href: "/developments/", label: "Developments" },
  { href: "/gallery/", label: "Gallery" },
  { href: "/dharma/", label: "Sanatana Dharma" },
  { href: "/telugu-culture/", label: "Telugu Culture" },
  { href: "/government/", label: "Government" },
] as const;

/**
 * Secondary destinations, shown under "More" in the header and drawer.
 * Fun Fest stays here; SiteHeader applies member-auth gating for /fun-trips/.
 */
export const MORE_NAV = [
  { href: "/spiritual-heritage/", label: "Temple Heritage" },
  { href: "/heritage/", label: "Heritage Archive" },
  { href: "/timeline/", label: "Timeline" },
  { href: "/directory/", label: "Directory" },
  { href: "/fun-trips/", label: "Fun Fest" },
  { href: "/suggestions/", label: "Suggestions" },
  { href: "/contact/", label: "Contact" },
  { href: "/services/", label: "Village Services" },
  { href: "/emergency/", label: "Emergency Information" },
] as const;

/**
 * The two knowledge sections' own sub-navigation, rendered on each hub.
 *
 * Kept here rather than inside the components so the hub page, the footer and
 * the section landing pages cannot drift apart — the failure mode that leaves
 * a menu item pointing at a page nobody built.
 */
export const DHARMA_NAV = [
  { href: "/dharma/", label: "About Sanatana Dharma", labelTe: "సనాతన ధర్మం" },
  { href: "/dharma/vedas/", label: "Vedas", labelTe: "వేదాలు" },
  { href: "/dharma/upanishads/", label: "Upanishads", labelTe: "ఉపనిషత్తులు" },
  { href: "/dharma/gita/", label: "Bhagavad Gita", labelTe: "భగవద్గీత" },
  { href: "/dharma/ramayanam/", label: "Ramayanam", labelTe: "రామాయణం" },
  { href: "/dharma/mahabharatam/", label: "Mahabharatam", labelTe: "మహాభారతం" },
  { href: "/dharma/puranas/", label: "Puranas", labelTe: "పురాణాలు" },
  { href: "/dharma/slokas/", label: "Slokas & Mantras", labelTe: "శ్లోకాలు & మంత్రాలు" },
  { href: "/dharma/music/", label: "Devotional Music", labelTe: "భక్తి సంగీతం" },
  { href: "/dharma/knowledge/", label: "Dharma & Spiritual Knowledge", labelTe: "ధర్మం & ఆధ్యాత్మిక జ్ఞానం" },
  { href: "/events/", label: "Festivals & Traditions", labelTe: "పండుగలు & సంప్రదాయాలు" },
] as const;

export const CULTURE_NAV = [
  { href: "/telugu-culture/", label: "Telugu Culture", labelTe: "తెలుగు సంస్కృతి" },
  { href: "/telugu-culture/literature/", label: "Telugu Literature", labelTe: "తెలుగు సాహిత్యం" },
  { href: "/telugu-culture/poetry/", label: "Telugu Poetry", labelTe: "తెలుగు కవిత్వం" },
  { href: "/telugu-culture/stories/", label: "Telugu Stories", labelTe: "తెలుగు కథలు" },
  { href: "/telugu-culture/spiritual/", label: "Telugu Spiritual Literature", labelTe: "తెలుగు ఆధ్యాత్మిక సాహిత్యం" },
  { href: "/telugu-culture/sri-sri/", label: "Sri Sri", labelTe: "శ్రీశ్రీ" },
] as const;

export const HERITAGE_NAV = [
  { href: "/about/", label: "Village History", labelTe: "గ్రామ చరిత్ర" },
  { href: "/spiritual-heritage/", label: "Temple Heritage", labelTe: "ఆలయ వారసత్వం" },
  { href: "/heritage/", label: "Heritage Archive", labelTe: "వారసత్వ సేకరణ" },
  { href: "/gallery/", label: "Old Photos & Videos", labelTe: "పాత ఫోటోలు & వీడియోలు" },
  { href: "/timeline/", label: "Timeline", labelTe: "కాలరేఖ" },
] as const;

/**
 * Kept for compatibility with anything still reading the old name.
 * @deprecated Prefer MORE_NAV.
 */
export const COMMUNITY_NAV = MORE_NAV;

/**
 * Footer column: community pages.
 *
 * Fun Fest is deliberately absent. It is member-gated and noindex — a visitor
 * who follows it from the footer gets a login dialog, and a search engine that
 * follows it gets a page we asked it not to index. It stays in the More menu,
 * where the people who have an account will look for it.
 */
export const FOOTER_COMMUNITY = [
  { href: "/directory/", label: "Directory" },
  { href: "/heritage/", label: "Heritage Archive" },
  { href: "/timeline/", label: "Timeline" },
  { href: "/suggestions/", label: "Suggestions" },
  { href: "/contact/", label: "Contact" },
] as const;

/** Footer column: the knowledge section and everyday services. */
export const FOOTER_SERVICES = [
  { href: "/dharma/", label: "Sanatana Dharma" },
  { href: "/telugu-culture/", label: "Telugu Culture" },
  { href: "/spiritual-heritage/", label: "Temple Heritage" },
  { href: "/government/", label: "Government Resources" },
  { href: "/services/", label: "Village Services" },
  { href: "/emergency/", label: "Emergency Information" },
] as const;

/** Footer column: legal. The disclaimer is a section of the Terms page. */
export const FOOTER_LEGAL = [
  { href: "/privacy/", label: "Privacy Policy" },
  { href: "/terms/", label: "Terms & Conditions" },
  { href: "/terms/#disclaimer", label: "Disclaimer" },
] as const;

/** Homepage shortcuts — mirrors primary priority (excludes Home). */
export const HOME_QUICK_LINKS = NAV.slice(1);

/** Short village description used on the homepage and in the footer. */
export const VILLAGE_SHORT_DESCRIPTION =
  "Reddivaripalli is a historic village in Andhra Pradesh, known for its temples, agriculture, festivals and the community traditions that have held families together across generations.";

/**
 * Optional photographic backdrop for the homepage hero.
 *
 * `null` today, deliberately: the only wide image in the project is a
 * watermarked satellite screenshot, and inventing a village photograph is not
 * an option. The hero renders its approved badge treatment while this is null.
 *
 * To switch it on, drop a genuine photograph into public/brand/ and set this
 * to its path — for example "/brand/village-photo.webp". Everything else is
 * already in place: the image is full-bleed and object-fit: cover at every
 * breakpoint, a scrim keeps the heading above 4.5:1 over whatever the
 * photograph does, and it loads as the LCP candidate with fetchpriority high.
 * Supply roughly 2000px wide, landscape, with the subject slightly right of
 * centre so the badge on the left does not cover it.
 */
export const HOME_HERO_PHOTO: string | null = null;

/** Alt text for HOME_HERO_PHOTO. Describe the actual photograph when set. */
export const HOME_HERO_PHOTO_ALT = "";

/** Homepage identity lines. */
export const HOME_HERO_TITLE = "REDDIVARIPALLI";
export const HOME_HERO_PILLARS = SITE_TAGLINE_PILLARS;
export const HOME_HERO_SUPPORT = "One Village · One Family · One Heritage";

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

/**
 * Telugu names for the CMS buckets.
 *
 * Album titles come from folder names in the media pipeline and are therefore
 * English ("Devapatlamma Jathara 2026"), which left one English string on an
 * otherwise Telugu homepage. These are the same festival proper nouns already
 * used for event titles, so a Telugu album label can be composed from the
 * bucket and the year without the pipeline having to carry a second title.
 */
export const BUCKET_TITLE_TE: Partial<Record<BucketKey, string>> = {
  ugadi: "\u0c09\u0c17\u0c3e\u0c26\u0c3f",
  "sri-rama-navami": "\u0c36\u0c4d\u0c30\u0c40 \u0c30\u0c3e\u0c2e \u0c28\u0c35\u0c2e\u0c3f",
  "mathamma-jathara": "\u0c2e\u0c3e\u0c24\u0c2e\u0c4d\u0c2e \u0c1c\u0c3e\u0c24\u0c30",
  "devapatlamma-jathara": "\u0c26\u0c47\u0c35\u0c2a\u0c1f\u0c4d\u0c32\u0c2e\u0c4d\u0c2e \u0c1c\u0c3e\u0c24\u0c30",
  "varalakshmi-vratam": "\u0c35\u0c30\u0c32\u0c15\u0c4d\u0c37\u0c4d\u0c2e\u0c40 \u0c35\u0c4d\u0c30\u0c24\u0c02",
  "vinayaka-chavithi": "\u0c35\u0c3f\u0c28\u0c3e\u0c2f\u0c15 \u0c1a\u0c35\u0c3f\u0c24\u0c3f",
  dasara: "\u0c26\u0c38\u0c30\u0c3e",
  deepavali: "\u0c26\u0c40\u0c2a\u0c3e\u0c35\u0c33\u0c3f",
  sankranthi: "\u0c38\u0c02\u0c15\u0c4d\u0c30\u0c3e\u0c02\u0c24\u0c3f",
  "rvp-birthdays": "\u0c2a\u0c41\u0c1f\u0c4d\u0c1f\u0c3f\u0c28\u0c30\u0c4b\u0c1c\u0c41\u0c32\u0c41",
  "fun-trips": "\u0c2b\u0c28\u0c4d \u0c2b\u0c46\u0c38\u0c4d\u0c1f\u0c4d",
};

/** Festival chapter heroes under /public/festivals/<folder>/hero.webp */
export const FESTIVAL_HERO_VERSION = FESTIVAL_ASSET_VERSION;

export const FESTIVAL_HEROES: Partial<Record<BucketKey, string>> = {
  ...Object.fromEntries(
    CULTURE_FESTIVALS.map((f) => [f.key, festivalHeroPath(f.folder)]),
  ),
  "rvp-birthdays": `/brand/village-aerial.webp?v=${FESTIVAL_HERO_VERSION}`,
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
