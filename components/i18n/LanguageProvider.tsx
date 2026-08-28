"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  UI_LANG_KEY,
  isLocale,
  localeFromPath,
  type Locale,
} from "@/lib/i18n/config";
import { translate } from "@/lib/i18n";

type Ctx = {
  lang: Locale;
  /** Locale implied by the URL. Authoritative; `lang` mirrors it. */
  routeLocale: Locale;
  setLang: (lang: Locale) => void;
  t: (key: string, fallback?: string, values?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<Ctx>({
  lang: DEFAULT_LOCALE,
  routeLocale: DEFAULT_LOCALE,
  setLang: () => {},
  t: (key, fallback, values) => translate(DEFAULT_LOCALE, key, fallback, values),
});

function readStored(): Locale | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(UI_LANG_KEY);
    return isLocale(v) ? v : null;
  } catch {
    return null;
  }
}

function writeStored(lang: Locale) {
  try {
    localStorage.setItem(UI_LANG_KEY, lang);
  } catch {
    /* private mode — the URL still carries the locale */
  }
}

/**
 * Language state.
 *
 * The URL is authoritative: `/te/...` is Telugu, everything else is English.
 * localStorage only records a preference so the switcher can offer the right
 * default; it never overrides the path, because that would make two URLs
 * render differently for different visitors and break caching and SEO.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const routeLocale = localeFromPath(pathname);
  const [lang, setLangState] = useState<Locale>(routeLocale);

  useEffect(() => {
    setLangState(routeLocale);
  }, [routeLocale]);

  // Keep <html lang> honest for screen readers and font selection.
  useEffect(() => {
    try {
      document.documentElement.lang = routeLocale;
      document.documentElement.dataset.uiLang = routeLocale;
    } catch {
      /* ignore */
    }
  }, [routeLocale]);

  const setLang = useCallback((next: Locale) => {
    setLangState(next);
    writeStored(next);
  }, []);

  const t = useCallback(
    (key: string, fallback?: string, values?: Record<string, string | number>) =>
      translate(lang, key, fallback, values),
    [lang],
  );

  const value = useMemo(
    () => ({ lang, routeLocale, setLang, t }),
    [lang, routeLocale, setLang, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useUiLang() {
  return useContext(LanguageContext);
}

/** Preference stored on this device, if any. Used by the switcher only. */
export function storedLocale(): Locale | null {
  return readStored();
}
