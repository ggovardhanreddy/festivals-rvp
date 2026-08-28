"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, LOCALE_LABEL, localeFromPath, stripLocale, type Locale } from "@/lib/i18n/config";
import { localeAlternate } from "@/lib/routes/registry";
import { useUiLang } from "./LanguageProvider";

/**
 * Language switcher.
 *
 * Maps the current page to its counterpart in the other language. When no
 * translation of that exact page exists, it links to the section fallback
 * (the locale root) and says so, rather than producing a URL that 404s.
 * It never links to a page that does not exist.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const pathname = usePathname() || "/";
  const current = localeFromPath(pathname);
  const canonical = stripLocale(pathname);
  const { t, setLang } = useUiLang();

  return (
    <div className={className ? `lang-switch ${className}` : "lang-switch"}>
      <span className="sr-only" id="lang-switch-label">
        {t("lang.label")}
      </span>
      <div role="group" aria-labelledby="lang-switch-label" className="lang-switch-group">
        {LOCALES.map((locale: Locale) => {
          const isCurrent = locale === current;
          const { href, exact } = localeAlternate(canonical, locale);
          const label = LOCALE_LABEL[locale];

          if (isCurrent) {
            return (
              <span key={locale} className="lang-switch-btn" aria-current="true" data-active>
                {label}
              </span>
            );
          }
          return (
            <Link
              key={locale}
              href={href}
              className="lang-switch-btn"
              hrefLang={locale}
              lang={locale}
              onClick={() => setLang(locale)}
              title={
                exact
                  ? t("lang.switchTo", undefined, { language: label })
                  : t("lang.notTranslated")
              }
            >
              {label}
              {exact ? null : <span className="sr-only"> — {t("lang.notTranslated")}</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
