/**
 * Translation lookup.
 *
 * Fallback chain: requested locale -> English -> the explicit fallback the
 * caller passed -> the key itself. A missing Telugu string therefore renders
 * readable English, never a key name and never a machine guess.
 */
import { en, type MessageId } from "./messages/en";
import { te } from "./messages/te";
import { DEFAULT_LOCALE, type Locale } from "./config";

const CATALOGUES: Record<Locale, Partial<Record<MessageId, string>>> = {
  en,
  te,
};

/** Legacy href-keyed lookups from the original chrome dictionary. */
const HREF_ALIASES: Record<string, MessageId> = {
  "/": "nav.home",
  "/members/": "nav.members",
  "/about/": "nav.heritage",
  "/events/": "nav.events",
  "/developments/": "nav.developments",
  "/gallery/": "nav.gallery",
  "/directory/": "nav.directory",
  "/contact/": "nav.contact",
  "/heritage/": "nav.heritageArchive",
  "/fun-trips/": "nav.funFest",
  "/documents/": "nav.documents",
  "/suggestions/": "nav.suggestions",
  "/timeline/": "nav.timeline",
  "/lost-found/": "nav.lostFound",
  "/search/": "nav.search",
  "/settings/": "nav.settings",
  "/privacy/": "nav.privacy",
  "/terms/": "nav.terms",
  "/years/": "nav.years",
  "install-app": "nav.installApp",
  "open-menu": "nav.openMenu",
  "close-menu": "nav.closeMenu",
  "primary-nav": "nav.primary",
  "quick-links": "nav.quickLinks",
  "footer-contact": "nav.contact",
  "language": "lang.label",
  "language-en": "lang.en",
  "language-te": "lang.te",
  "language-lede": "lang.lede",
  "theme": "common.theme",
  "email-us": "common.emailUs",
  "open-maps": "common.openMaps",
  "edit-mode": "nav.editMode",
  "editing": "nav.editing",
  "enter-edit": "nav.enterEdit",
  "exit-edit": "nav.exitEdit",
  "admin": "nav.admin",
  "admin-dashboard": "nav.adminDashboard",
  "settings-title": "nav.settings",
};

function resolveKey(key: string): MessageId | null {
  if (key in en) return key as MessageId;
  const alias = HREF_ALIASES[key];
  return alias ?? null;
}

/** Replace {name} placeholders. Missing values are left visible, not blanked. */
export function interpolate(
  template: string,
  values?: Record<string, string | number>,
): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in values ? String(values[name]) : whole,
  );
}

export function translate(
  locale: Locale,
  key: string,
  fallback?: string,
  values?: Record<string, string | number>,
): string {
  const id = resolveKey(key);
  if (!id) return interpolate(fallback ?? key, values);
  const hit = CATALOGUES[locale]?.[id] ?? CATALOGUES[DEFAULT_LOCALE][id];
  return interpolate(hit ?? fallback ?? key, values);
}

/** Bound translator, for server components and plain modules. */
export function getTranslator(locale: Locale) {
  return (key: string, fallback?: string, values?: Record<string, string | number>) =>
    translate(locale, key, fallback, values);
}

/** Coverage, for the CI report. */
export function localeCoverage(locale: Locale): { total: number; translated: number; pct: number } {
  const ids = Object.keys(en) as MessageId[];
  const cat = CATALOGUES[locale] ?? {};
  const translated = ids.filter((id) => typeof cat[id] === "string").length;
  return { total: ids.length, translated, pct: Math.round((translated / ids.length) * 100) };
}

export { en, te };
export type { MessageId };
