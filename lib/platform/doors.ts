/**
 * "What do you want to do?" — the six audience doors, and the Explore grid.
 *
 * Data, not markup, so navigation, the homepage and search all read the same
 * definitions. `status` is honest: a door pointing at a section that has not
 * shipped links to the section's landing page, which says plainly that it is
 * coming — it never pretends to have content.
 */
import type { SectionId } from "@/lib/routes/registry";
import { findRoute } from "@/lib/routes/registry";

export type Door = {
  id: string;
  href: string;
  labelKey: string;
  taglineKey: string;
  icon: string;
  section: SectionId;
};

export const AUDIENCE_DOORS: Door[] = [
  { id: "government", href: "/government/", labelKey: "door.government", taglineKey: "door.government.tag", icon: "government", section: "government" },
  { id: "students",   href: "/students/",   labelKey: "door.students",   taglineKey: "door.students.tag",   icon: "students",   section: "learn" },
  { id: "farmers",    href: "/farmers/",    labelKey: "door.farmers",    taglineKey: "door.farmers.tag",    icon: "farmers",    section: "agriculture" },
  { id: "banking",    href: "/banking/",    labelKey: "door.banking",    taglineKey: "door.banking.tag",    icon: "banking",    section: "government" },
  { id: "kids",       href: "/kids/",       labelKey: "door.kids",       taglineKey: "door.kids.tag",       icon: "kids",       section: "kids" },
  { id: "careers",    href: "/careers/",    labelKey: "door.careers",    taglineKey: "door.careers.tag",    icon: "careers",    section: "careers" },
];

export type ExploreTile = {
  id: string;
  href: string;
  labelKey: string;
  icon: string;
};

export const EXPLORE_TILES: ExploreTile[] = [
  { id: "abc",           href: "/kids/alphabet/",  labelKey: "kids.abc",          icon: "letter" },
  { id: "stories",       href: "/kids/stories/",   labelKey: "kids.stories",      icon: "book" },
  { id: "rhymes",        href: "/kids/rhymes/",    labelKey: "kids.rhymes",       icon: "music" },
  { id: "videos",        href: "/kids/videos/",    labelKey: "kids.videos",       icon: "video" },
  { id: "documents",     href: "/government/documents/", labelKey: "docs.title",  icon: "book" },
  { id: "emergency",     href: "/emergency/",      labelKey: "emergency.title",   icon: "siren" },
  { id: "safety",        href: "/safety/",         labelKey: "safety.title",      icon: "shield" },
  { id: "agriculture",   href: "/agriculture/",    labelKey: "nav.agriculture",   icon: "agriculture" },
  { id: "learn",         href: "/learn/",          labelKey: "nav.learn",         icon: "learn" },
  { id: "play",          href: "/play/",           labelKey: "nav.play",          icon: "play" },
  { id: "kids",          href: "/kids/",           labelKey: "nav.kids",          icon: "kids" },
  { id: "english",       href: "/english/",        labelKey: "nav.english",       icon: "english" },
  { id: "engineering",   href: "/engineering/",    labelKey: "nav.engineering",   icon: "engineering" },
  { id: "it",            href: "/it/",             labelKey: "nav.it",            icon: "it" },
  { id: "careers",       href: "/careers/",        labelKey: "nav.careers",       icon: "careers" },
  { id: "temples",       href: "/heritage/",       labelKey: "nav.temples",       icon: "temples" },
  { id: "weather",       href: "/weather/",        labelKey: "nav.weather",       icon: "weather" },
  { id: "community",     href: "/members/",        labelKey: "nav.community",     icon: "community" },
  { id: "government",    href: "/government/",     labelKey: "nav.government",    icon: "government" },
  { id: "digitalSkills", href: "/digital-skills/", labelKey: "nav.digitalSkills", icon: "digital" },
];

/** True when the destination is a live route rather than a reserved one. */
export function isReady(href: string): boolean {
  return findRoute(href)?.status === "live";
}

/** Popular searches shown under the hero. Only terms that return results. */
export const POPULAR_SEARCHES = [
  { key: "popular.aadhaar", query: "Aadhaar" },
  { key: "popular.marksheet", query: "marksheet" },
  { key: "popular.pmkisan", query: "PM Kisan" },
  { key: "popular.adangal", query: "Adangal" },
  { key: "popular.netbanking", query: "net banking" },
  { key: "popular.sankranthi", query: "Sankranthi" },
  { key: "popular.members", query: "Members" },
] as const;
