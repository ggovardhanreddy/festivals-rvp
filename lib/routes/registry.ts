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
  | "dharma" | "culture" | "government" | "weather" | "ai";

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
  { path: "/government/",   section: "government", labelKey: "nav.government",     status: "live", hasTelugu: true  },
  { path: "/government/documents/", section: "government", labelKey: "docs.title", status: "live", hasTelugu: false },
  { path: "/banking/",      section: "government", labelKey: "banking.title",      status: "live", hasTelugu: true  },
  { path: "/emergency/",    section: "utility",    labelKey: "emergency.title",    status: "live", hasTelugu: false },
  { path: "/safety/",       section: "utility",    labelKey: "safety.title",       status: "live", hasTelugu: false },
  { path: "/weather/",      section: "weather",   labelKey: "nav.weather",         status: "live", hasTelugu: false },

  // ── Sanatana Dharma & Telugu Culture ──────────────────────────────────
  // Replaces the old /learn/ concept. Every page here is either original
  // writing, a verified public-domain text, or a link to the official source.
  { path: "/dharma/",                     section: "dharma",  labelKey: "dharma.title",          status: "live", hasTelugu: false },
  { path: "/dharma/knowledge/",           section: "dharma",  labelKey: "dharma.knowledge.title", status: "live", hasTelugu: false },
  { path: "/dharma/vedas/",               section: "dharma",  labelKey: "dharma.vedas.title",     status: "live", hasTelugu: false },
  { path: "/dharma/upanishads/",          section: "dharma",  labelKey: "dharma.upanishads.title", status: "live", hasTelugu: false },
  { path: "/dharma/gita/",                section: "dharma",  labelKey: "dharma.gita.title",      status: "live", hasTelugu: false },
  { path: "/dharma/ramayanam/",           section: "dharma",  labelKey: "dharma.ramayanam.title", status: "live", hasTelugu: false },
  { path: "/dharma/mahabharatam/",        section: "dharma",  labelKey: "dharma.mahabharatam.title", status: "live", hasTelugu: false },
  { path: "/dharma/puranas/",             section: "dharma",  labelKey: "dharma.puranas.title",   status: "live", hasTelugu: false },
  { path: "/dharma/slokas/",              section: "dharma",  labelKey: "dharma.slokas.title",    status: "live", hasTelugu: false },
  { path: "/dharma/music/",               section: "dharma",  labelKey: "dharma.music.title",     status: "live", hasTelugu: false },
  { path: "/telugu-culture/",             section: "culture", labelKey: "culture.title",          status: "live", hasTelugu: false },
  { path: "/telugu-culture/literature/",  section: "culture", labelKey: "culture.literature.title", status: "live", hasTelugu: false },
  { path: "/telugu-culture/poetry/",      section: "culture", labelKey: "culture.poetry.title",   status: "live", hasTelugu: false },
  { path: "/telugu-culture/stories/",     section: "culture", labelKey: "culture.stories.title",  status: "live", hasTelugu: false },
  { path: "/telugu-culture/spiritual/",   section: "culture", labelKey: "culture.spiritual.title", status: "live", hasTelugu: false },
  { path: "/telugu-culture/sri-sri/",     section: "culture", labelKey: "culture.sriSri.title",   status: "live", hasTelugu: false },
  { path: "/spiritual-heritage/",         section: "heritage", labelKey: "spiritual.title",       status: "live", hasTelugu: false },
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
/**
 * Reserved names are no longer published.
 *
 * The site used to serve an honest "planned for phase N" page at /english/,
 * /it/, /engineering/, /digital-skills/, /explore/, /community/ and
 * /temples/. Section 1 of the redesign asks for empty Coming Soon and Planned
 * sections to be removed rather than left as empty pages, so they are gone and
 * public/_redirects sends each old URL to the section that replaced it.
 *
 * Kept as an empty array rather than deleted so nothing that reads it breaks.
 */
export const PLANNED_ROUTES: RouteEntry[] = [];

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
