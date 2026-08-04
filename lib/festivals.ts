/**
 * Culture festivals — public chapter list + asset paths under /festivals/.
 */

export const FESTIVAL_ASSET_VERSION = "festivals-v1";

export type CultureFestival = {
  key: string;
  /** Public asset folder under /festivals/ */
  folder: string;
  /** Route slug (may differ from folder, e.g. sankranthi) */
  slug: string;
  title: string;
  eyebrow: string;
  blurb: string;
  story: string;
};

export const CULTURE_DESCRIPTION =
  "Reddivaripalli is a village where festivals are celebrated with immense joy, devotion, and unity. Every festival brings together families, relatives, and friends, creating unforgettable memories through traditional rituals, cultural programs, devotional activities, music, decorations, and community feasts. The spirit of togetherness is one of the greatest strengths of our village, with people of all ages enthusiastically participating and working together to make every celebration a grand success.";

export const CULTURE_FESTIVALS: CultureFestival[] = [
  {
    key: "vinayaka-chavithi",
    folder: "vinayaka-chavithi",
    slug: "vinayaka-chavithi",
    title: "Vinayaka Chavithi",
    eyebrow: "Devotion · Beginnings",
    blurb: "Clay, lamp light, and prayers that mark a beloved beginning each year.",
    story:
      "Vinayaka Chavithi fills the house with clay idols, lamp glow, and first prayers — a tender beginning renewed each monsoon season.",
  },
  {
    key: "varalakshmi-vratam",
    folder: "varalakshmi-vratam",
    slug: "varalakshmi-vratam",
    title: "Varalakshmi Vratam",
    eyebrow: "Grace · Prosperity",
    blurb: "A sacred vow for Goddess Lakshmi — lamps, flowers, and family devotion.",
    story:
      "Varalakshmi Vratam gathers households in prayer for prosperity and wellbeing — diya light, floral offerings, and quiet strength shared among women and families.",
  },
  {
    key: "sankranthi",
    folder: "sankranti",
    slug: "sankranthi",
    title: "Sankranti",
    eyebrow: "Harvest · Light · Home",
    blurb: "Rangoli, sweetness, and the quiet joy of beginning the year together.",
    story:
      "Sankranti arrives with harvest light — rangoli at the door, sesame sweetness, and the village gathering as one family under a newly opened year.",
  },
  {
    key: "sri-rama-navami",
    folder: "sri-rama-navami",
    slug: "sri-rama-navami",
    title: "Sri Rama Navami",
    eyebrow: "Ramalayam · Grace",
    blurb: "Rama Navami at the village temple — hymns, color, and quiet devotion.",
    story:
      "Sri Rama Navami fills Ramalayam with hymns and flowers — a day of grace at the heart of Kondreddigaripalli.",
  },
  {
    key: "mathamma-jathara",
    folder: "mathamma-jathara",
    slug: "mathamma-jathara",
    title: "Mathamma Jathara",
    eyebrow: "Village · Devotion",
    blurb: "The village gathers for Mathamma — drums, offerings, and shared faith.",
    story:
      "Mathamma Jathara brings the village into one rhythm — processions, offerings, and the living bond between people and place.",
  },
  {
    key: "devapatlamma-jathara",
    folder: "devapatlamma-jathara",
    slug: "devapatlamma-jathara",
    title: "Devapatlamma Jathara",
    eyebrow: "Faith · Community",
    blurb: "Devapatlamma’s festival — lamps, community, and ancestral blessing.",
    story:
      "Devapatlamma Jathara is the village’s vow kept — temple light, shared meals, and the blessing of generations.",
  },
  {
    key: "ugadi",
    folder: "ugadi",
    slug: "ugadi",
    title: "Ugadi",
    eyebrow: "New Year · Hope",
    blurb: "Telugu New Year — kalash, mango leaves, and the taste of a fresh beginning.",
    story:
      "Ugadi opens the year with kalash, sugarcane, and pachadi — a reminder that life holds every flavour, and the village meets it together.",
  },
  {
    key: "deepavali",
    folder: "deepavali",
    slug: "deepavali",
    title: "Deepavali",
    eyebrow: "Light · Joy",
    blurb: "Rows of diyas, rangoli glow, and the festival of lights across every home.",
    story:
      "Deepavali fills Reddivaripalli with lamp light and laughter — diyas at the door, sweets shared, and darkness gently pushed aside.",
  },
  {
    key: "dasara",
    folder: "dasara",
    slug: "dasara",
    title: "Dasara",
    eyebrow: "Victory · Celebration",
    blurb: "Nine nights of devotion culminating in village celebration and colour.",
    story:
      "Dasara marks courage and celebration — processions, decorations, and the shared pride of a village that stands together.",
  },
];

export function festivalHeroPath(folder: string): string {
  return `/festivals/${folder}/hero.webp?v=${FESTIVAL_ASSET_VERSION}`;
}

export function festivalThumbPath(folder: string): string {
  return `/festivals/${folder}/thumbs/hero.webp?v=${FESTIVAL_ASSET_VERSION}`;
}

/** Prefer card/list thumbs when a festival hero path is provided. */
export function festivalCardImage(image?: string | null): string | null {
  if (!image) return null;
  const cleaned = image.replace(/\?.*$/, "");
  const match = cleaned.match(/^\/festivals\/([^/]+)\/hero\.webp$/i);
  if (match) return festivalThumbPath(match[1]!);
  if (cleaned.includes("/festivals/") && cleaned.includes("/thumbs/")) {
    return image.includes("?")
      ? image
      : `${cleaned}?v=${FESTIVAL_ASSET_VERSION}`;
  }
  return image;
}

export function cultureFestivalBySlug(slug: string) {
  return CULTURE_FESTIVALS.find((f) => f.slug === slug || f.folder === slug);
}

/** Devapatlamma Temple official social */
export const DEVAPATLAMMA_INSTAGRAM = {
  handle: "@devapatlamma.devatha",
  url: "https://www.instagram.com/devapatlamma.devatha",
  label: "Follow on Instagram",
} as const;
