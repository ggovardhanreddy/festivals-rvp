/**
 * Locale configuration — the single place that knows about languages.
 *
 * English is the default and keeps the bare path (`/about/`), so every URL
 * that is already indexed stays exactly where it is. Telugu is served from a
 * `/te/` prefix, which is a brand-new URL space and therefore cannot break
 * anything. See docs/ROUTE_MIGRATION.md for the reasoning.
 */
export const LOCALES = ["en", "te"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Path prefix for a locale. The default locale has none, by design. */
export const LOCALE_PREFIX: Record<Locale, string> = {
  en: "",
  te: "/te",
};

/** BCP-47 tags for <html lang>, hreflang and Intl formatting. */
export const LOCALE_TAG: Record<Locale, string> = {
  en: "en-IN",
  te: "te-IN",
};

/** Endonyms — a language is always named in its own language. */
export const LOCALE_LABEL: Record<Locale, string> = {
  en: "English",
  te: "తెలుగు",
};

export const UI_LANG_KEY = "rvp-ui-lang";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Locale implied by a pathname. `/te/about/` -> "te"; anything else -> "en". */
export function localeFromPath(pathname: string): Locale {
  const clean = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return clean === "/te" || clean.startsWith("/te/") ? "te" : "en";
}

/** Strip the locale prefix, returning the canonical English-space path. */
export function stripLocale(pathname: string): string {
  const clean = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (clean === "/te" || clean === "/te/") return "/";
  if (clean.startsWith("/te/")) return clean.slice(3);
  return clean;
}

/** Add the prefix for `locale` to a canonical English-space path. */
export function withLocale(pathname: string, locale: Locale): string {
  const base = stripLocale(pathname);
  if (locale === DEFAULT_LOCALE) return base;
  const joined = `${LOCALE_PREFIX[locale]}${base === "/" ? "/" : base}`;
  return joined.endsWith("/") ? joined : `${joined}/`;
}
