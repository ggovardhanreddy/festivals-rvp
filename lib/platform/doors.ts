/**
 * Service navigation data.
 *
 * The six audience doors and the twenty-tile explore grid that used to live
 * here were the homepage blocks removed in the redesign; their components are
 * gone and the destinations now live in SERVICE_GROUPS below, grouped by the
 * errand someone is actually on.
 */
import { findRoute } from "@/lib/routes/registry";

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
