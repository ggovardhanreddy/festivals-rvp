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
  { id: "kids",     href: "/kids/",        labelKey: "door.kids",     taglineKey: "door.kids.tag",     icon: "kids",     section: "kids" },
  { id: "students", href: "/learn/",       labelKey: "door.students", taglineKey: "door.students.tag", icon: "students", section: "learn" },
  { id: "farmers",  href: "/agriculture/", labelKey: "door.farmers",  taglineKey: "door.farmers.tag",  icon: "farmers",  section: "agriculture" },
  { id: "careers",  href: "/careers/",     labelKey: "door.careers",  taglineKey: "door.careers.tag",  icon: "careers",  section: "careers" },
  { id: "seniors",  href: "/settings/",    labelKey: "door.seniors",  taglineKey: "door.seniors.tag",  icon: "seniors",  section: "utility" },
  { id: "explore",  href: "/explore/",     labelKey: "door.explore",  taglineKey: "door.explore.tag",  icon: "explore",  section: "village" },
];

export type ExploreTile = {
  id: string;
  href: string;
  labelKey: string;
  icon: string;
};

export const EXPLORE_TILES: ExploreTile[] = [
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
  { id: "government",    href: "/services/",       labelKey: "nav.government",    icon: "government" },
  { id: "digitalSkills", href: "/digital-skills/", labelKey: "nav.digitalSkills", icon: "digital" },
];

/** True when the destination is a live route rather than a reserved one. */
export function isReady(href: string): boolean {
  return findRoute(href)?.status === "live";
}

/** Popular searches shown under the hero. Only terms that return results. */
export const POPULAR_SEARCHES = [
  { key: "popular.sankranthi", query: "Sankranthi" },
  { key: "popular.ramalayam", query: "Ramalayam" },
  { key: "popular.members", query: "Members" },
  { key: "popular.gallery", query: "Gallery" },
  { key: "popular.developments", query: "Developments" },
] as const;
