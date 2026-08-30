"use client";

import Link from "next/link";
import Image from "next/image";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { withLocale } from "@/lib/i18n/config";
import { POPULAR_SEARCHES } from "@/lib/platform/doors";
import { UniversalSearchBar } from "./UniversalSearchBar";

/**
 * Platform hero.
 *
 * Deliberately short — no full-bleed image, no WebGL, no entrance animation.
 * On a 360px phone the search field has to be reachable without scrolling,
 * which the previous logo-and-postal-address hero did not manage.
 */
export function PlatformHero() {
  const { t, lang } = useUiLang();
  return (
    <section className="pf-hero" aria-labelledby="pf-hero-title">
      <div className="pf-hero-inner">
        <Image
          className="pf-hero-logo"
          src="/logo/logo-mark.webp"
          alt=""
          width={80}
          height={64}
          priority
        />
        <p className="pf-hero-eyebrow">REDDIVARIPALLI</p>
        <h1 id="pf-hero-title" className="pf-hero-title">
          {t("home.headline")}
        </h1>
        <p className="pf-hero-tagline">{t("home.tagline")}</p>

        <UniversalSearchBar />

        <div className="pf-hero-popular">
          <span className="pf-hero-popular-label">{t("search.popular")}</span>
          <ul className="pf-chip-row">
            {POPULAR_SEARCHES.map((p) => (
              <li key={p.key}>
                <Link
                  className="pf-chip"
                  href={`${withLocale("/search/", lang)}?q=${encodeURIComponent(p.query)}`}
                >
                  {t(p.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
