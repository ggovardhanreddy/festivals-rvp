/**
 * Route registry — one source of truth for every public path.
 *
 * The catch-all in app/[...slug]/page.tsx still renders these pages; this
 * registry does not replace it. What it adds is a machine-readable description
 * of the route surface that navigation, metadata, hreflang, the sitemap, the
 * search index and the tests can all read from, instead of each maintaining
 * its own list.
 *
 * `hasTelugu` is the honest switch. A route is only offered at /te/ and only
 * gets an hreflang pair when its content genuinely exists in Telugu. Marking a
 * route true before it is translated would tell Google a Telugu page exists
 * when it does not.
 */
import type { Locale } from "@/lib/i18n/config";

export type SectionId =
  | "village" | "media" | "community" | "heritage" | "temples"
  | "utility" | "gated" | "admin"
  | "learn" | "games" | "kids" | "agriculture" | "english"
  | "engineering" | "it" | "careers" | "government" | "weather" | "ai";

export type RouteStatus =
  /** Live today, rendered by the existing catch-all. */
  | "live"
  /** Reserved in the registry, no page yet. Never rendered as an empty shell. */
  | "planned";

export type RouteEntry = {
  /** Canonical English-space path, always with a trailing slash. */
  path: string;
  section: SectionId;
  /** Message key for the human label. */
  labelKey: string;
  status: RouteStatus;
  /** True only when real Telugu content exists. Gates /te/ and hreflang. */
  hasTelugu: boolean;
  /** Excluded from the sitemap and the search index. */
  noindex?: boolean;
  /** Requires a member or admin session. */
  private?: boolean;
  /** Phase that will make this route live. Documentation only. */
  plannedPhase?: string;
};

/**
 * Existing live routes. Every one of these resolves on the production site
 * today and must continue to resolve. Verified against the built sitemap by
 * tests/unit/routes.test.ts.
 */
export const LIVE_ROUTES: RouteEntry[] = [
  { path: "/",              section: "village",   labelKey: "nav.home",            status: "live", hasTelugu: true },
  { path: "/about/",        section: "heritage",  labelKey: "nav.heritage",        status: "live", hasTelugu: false },
  { path: "/heritage/",     section: "heritage",  labelKey: "nav.heritageArchive", status: "live", hasTelugu: false },
  { path: "/timeline/",     section: "heritage",  labelKey: "nav.timeline",        status: "live", hasTelugu: false },
  { path: "/years/",        section: "media",     labelKey: "nav.years",           status: "live", hasTelugu: false },
  { path: "/gallery/",      section: "media",     labelKey: "nav.gallery",         status: "live", hasTelugu: false },
  { path: "/rvp-birthdays/",section: "media",     labelKey: "nav.events",          status: "live", hasTelugu: false },
  { path: "/members/",      section: "community", labelKey: "nav.members",         status: "live", hasTelugu: false },
  { path: "/events/",       section: "community", labelKey: "nav.events",          status: "live", hasTelugu: false },
  { path: "/directory/",    section: "community", labelKey: "nav.directory",       status: "live", hasTelugu: false },
  { path: "/developments/", section: "community", labelKey: "nav.developments",    status: "live", hasTelugu: false },
  { path: "/suggestions/",  section: "community", labelKey: "nav.suggestions",     status: "live", hasTelugu: false },
  { path: "/lost-found/",   section: "community", labelKey: "nav.lostFound",       status: "live", hasTelugu: false },
  { path: "/documents/",    section: "community", labelKey: "nav.documents",       status: "live", hasTelugu: false },
  { path: "/contact/",      section: "community", labelKey: "nav.contact",         status: "live", hasTelugu: false },
  { path: "/services/",     section: "utility",   labelKey: "nav.villageServices", status: "live", hasTelugu: false },
  { path: "/search/",       section: "utility",   labelKey: "nav.search",          status: "live", hasTelugu: true,  noindex: true },
  { path: "/settings/",     section: "utility",   labelKey: "nav.settings",        status: "live", hasTelugu: false, noindex: true },
  { path: "/offline/",      section: "utility",   labelKey: "error.offline.title", status: "live", hasTelugu: false, noindex: true },
  { path: "/privacy/",      section: "utility",   labelKey: "nav.privacy",         status: "live", hasTelugu: false },
  { path: "/terms/",        section: "utility",   labelKey: "nav.terms",           status: "live", hasTelugu: false },
  { path: "/fun-trips/",    section: "gated",     labelKey: "nav.funFest",         status: "live", hasTelugu: false, noindex: true, private: true },
  { path: "/chat/",         section: "gated",     labelKey: "nav.community",       status: "live", hasTelugu: false, noindex: true, private: true },
  { path: "/login/",        section: "gated",     labelKey: "nav.funFest",         status: "live", hasTelugu: false, noindex: true, private: true },
  { path: "/admin/",        section: "admin",     labelKey: "nav.adminDashboard",  status: "live", hasTelugu: false, noindex: true, private: true },
  { path: "/play/",         section: "games",     labelKey: "nav.play",            status: "live", hasTelugu: false },
  { path: "/kids/",         section: "kids",      labelKey: "nav.kids",            status: "live", hasTelugu: false },
  { path: "/kids/telugu/",  section: "kids",      labelKey: "kids.telugu",         status: "live", hasTelugu: false },
  { path: "/kids/english/", section: "kids",      labelKey: "kids.english",        status: "live", hasTelugu: false },
  { path: "/kids/numbers/", section: "kids",      labelKey: "kids.numbers",        status: "live", hasTelugu: false },
  { path: "/kids/math/",    section: "kids",      labelKey: "kids.math",           status: "live", hasTelugu: false },
  { path: "/kids/drawing/", section: "kids",      labelKey: "kids.drawing",        status: "live", hasTelugu: false },
  { path: "/kids/gk/",      section: "kids",      labelKey: "kids.gk",             status: "live", hasTelugu: false },
  { path: "/kids/alphabet/",section: "kids",      labelKey: "kids.abc",            status: "live", hasTelugu: false },
  { path: "/kids/stories/", section: "kids",      labelKey: "kids.stories",        status: "live", hasTelugu: false },
  { path: "/kids/rhymes/",  section: "kids",      labelKey: "kids.rhymes",         status: "live", hasTelugu: false },
  { path: "/kids/science/", section: "kids",      labelKey: "kids.science",        status: "live", hasTelugu: false },
  { path: "/kids/videos/",  section: "kids",      labelKey: "kids.videos",         status: "live", hasTelugu: false },
  { path: "/digital-skills/", section: "government", labelKey: "nav.digitalSkills", status: "live", hasTelugu: false },
  { path: "/learn/",        section: "learn",     labelKey: "nav.learn",           status: "live", hasTelugu: false },
  { path: "/agriculture/",  section: "agriculture", labelKey: "nav.agriculture",   status: "live", hasTelugu: false },
  { path: "/government/",   section: "government", labelKey: "nav.government",     status: "live", hasTelugu: true  },
  { path: "/government/documents/", section: "government", labelKey: "docs.title", status: "live", hasTelugu: false },
  { path: "/banking/",      section: "government", labelKey: "banking.title",      status: "live", hasTelugu: true  },
  { path: "/students/",     section: "learn",      labelKey: "students.title",     status: "live", hasTelugu: true  },
  { path: "/farmers/",      section: "agriculture", labelKey: "farmers.title",     status: "live", hasTelugu: true  },
  { path: "/emergency/",    section: "utility",    labelKey: "emergency.title",    status: "live", hasTelugu: false },
  { path: "/safety/",       section: "utility",    labelKey: "safety.title",       status: "live", hasTelugu: false },
  { path: "/careers/",      section: "careers",   labelKey: "nav.careers",         status: "live", hasTelugu: false },
  { path: "/weather/",      section: "weather",   labelKey: "nav.weather",         status: "live", hasTelugu: false },
];

/**
 * Festival chapters. Paths come from CULTURE_FESTIVALS in lib/festivals.ts so
 * the two can never drift; see festivalRoutes().
 */
export const FESTIVAL_SECTION: SectionId = "temples";

/**
 * Sections the platform is planned to grow into.
 *
 * These are RESERVED, not built. Nothing renders an empty page for them: the
 * catch-all has no branch, so they 404 until their phase ships. They are
 * listed here so navigation, search and documentation can describe the target
 * shape without anyone fabricating a placeholder page.
 */
export const PLANNED_ROUTES: RouteEntry[] = [
  { path: "/explore/",       section: "village",     labelKey: "nav.explore",       status: "planned", hasTelugu: false, plannedPhase: "1B" },
  { path: "/english/",       section: "english",     labelKey: "nav.english",       status: "planned", hasTelugu: false, plannedPhase: "3" },
  { path: "/engineering/",   section: "engineering", labelKey: "nav.engineering",   status: "planned", hasTelugu: false, plannedPhase: "3" },
  { path: "/it/",            section: "it",          labelKey: "nav.it",            status: "planned", hasTelugu: false, plannedPhase: "3" },
  { path: "/temples/",       section: "temples",     labelKey: "nav.temples",       status: "planned", hasTelugu: false, plannedPhase: "5" },
  { path: "/community/",     section: "community",   labelKey: "nav.community",     status: "planned", hasTelugu: false, plannedPhase: "5" },
];

export const ALL_ROUTES: RouteEntry[] = [...LIVE_ROUTES, ...PLANNED_ROUTES];

export function findRoute(path: string): RouteEntry | undefined {
  const p = path.endsWith("/") ? path : `${path}/`;
  return ALL_ROUTES.find((r) => r.path === p);
}

export function isLive(path: string): boolean {
  return findRoute(path)?.status === "live";
}

/** Routes that should appear in the sitemap and be indexed. */
export function indexableRoutes(): RouteEntry[] {
  return LIVE_ROUTES.filter((r) => !r.noindex && !r.private);
}

/** Routes that have a genuine Telugu counterpart at /te/. */
export function teluguRoutes(): RouteEntry[] {
  return LIVE_ROUTES.filter((r) => r.hasTelugu && !r.private);
}

/**
 * Where the language switcher should send someone.
 *
 * If the target locale has no translation of this exact page, fall back to the
 * locale root rather than producing a URL that 404s. Never invent a page.
 */
export function localeAlternate(path: string, target: Locale): { href: string; exact: boolean } {
  const entry = findRoute(path);
  if (target === "en") {
    return { href: entry?.path ?? "/", exact: Boolean(entry) };
  }
  if (entry?.hasTelugu) {
    return { href: `/te${entry.path}`, exact: true };
  }
  return { href: "/te/", exact: false };
}

/**
 * Href for a navigation item in a given locale.
 *
 * `withLocale` prefixes /te/ unconditionally, which is right for a language
 * switcher and wrong for navigation: it produced links like /te/events/ and
 * /te/gallery/ for pages that have no Telugu version, so a Telugu visitor
 * tapping Events got a 404. Here the registry decides — a locale prefix is
 * only added when a Telugu page genuinely exists.
 */
export function navHref(path: string, locale: Locale): string {
  if (locale === "en") return path;
  return findRoute(path)?.hasTelugu ? `/te${path}` : path;
}
