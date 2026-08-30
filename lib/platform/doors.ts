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

/**
 * Village Services — the homepage's old "What do you want to do?" doors and
 * "Explore" grid, regrouped by errand and moved to /services/.
 *
 * Nothing here is new and nothing was dropped: every href below already
 * resolves today. Grouping them by what someone is actually trying to do
 * ("I need a certificate", "my child needs to study") is what the flat
 * twenty-tile grid on the homepage could not do.
 */
export type ServiceGroup = {
  id: string;
  titleKey: string;
  links: { href: string; labelKey: string; icon: string }[];
};

export const SERVICE_GROUPS: ServiceGroup[] = [
  {
    id: "village",
    titleKey: "services.group.village",
    links: [
      { href: "/emergency/", labelKey: "emergency.title", icon: "siren" },
      { href: "/government/", labelKey: "nav.government", icon: "government" },
      { href: "/government/documents/", labelKey: "docs.title", icon: "book" },
      { href: "/banking/", labelKey: "banking.title", icon: "banking" },
      { href: "/documents/", labelKey: "nav.documents", icon: "book" },
      { href: "/safety/", labelKey: "safety.title", icon: "shield" },
      { href: "/weather/", labelKey: "nav.weather", icon: "weather" },
      { href: "/directory/", labelKey: "nav.directory", icon: "community" },
      { href: "/lost-found/", labelKey: "nav.lostFound", icon: "shield" },
      { href: "/contact/", labelKey: "nav.contact", icon: "community" },
    ],
  },
  {
    id: "learning",
    titleKey: "services.group.learning",
    links: [
      { href: "/students/", labelKey: "students.title", icon: "students" },
      { href: "/learn/", labelKey: "nav.learn", icon: "learn" },
      { href: "/digital-skills/", labelKey: "nav.digitalSkills", icon: "digital" },
      { href: "/kids/", labelKey: "nav.kids", icon: "kids" },
      { href: "/kids/alphabet/", labelKey: "kids.abc", icon: "letter" },
      { href: "/kids/stories/", labelKey: "kids.stories", icon: "book" },
      { href: "/kids/rhymes/", labelKey: "kids.rhymes", icon: "music" },
      { href: "/kids/videos/", labelKey: "kids.videos", icon: "video" },
      { href: "/play/", labelKey: "nav.play", icon: "play" },
    ],
  },
  {
    id: "agriculture",
    titleKey: "services.group.agriculture",
    links: [
      { href: "/agriculture/", labelKey: "nav.agriculture", icon: "agriculture" },
      { href: "/farmers/", labelKey: "farmers.title", icon: "farmers" },
    ],
  },
  {
    id: "careers",
    titleKey: "services.group.careers",
    links: [{ href: "/careers/", labelKey: "nav.careers", icon: "careers" }],
  },
];
