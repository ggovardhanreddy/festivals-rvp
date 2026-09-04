"use client";

import Link from "next/link";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { VILLAGE_NAME } from "@/lib/site";

/**
 * Three or four lines about the village, and one door to the full story.
 *
 * Deliberately says nothing about heritage beyond the description itself. The
 * hero already carries the village tagline; a second heritage button here
 * made two competing calls to action.
 *
 * A client component because /te/ renders this same tree and the copy has to
 * come from the catalogue, not from a hard-coded English string.
 */
export function VillageIntro() {
  const { t } = useUiLang();
  return (
    <section className="home-panel home-village" aria-labelledby="home-village-heading">
      {/* The village's other name, kept because half the district searches for
          it. A proper noun — never translated, only transliterated by the
          catalogue if a Telugu spelling is supplied. */}
      <p className="eyebrow">{t("village.altName", VILLAGE_NAME)}</p>
      <h2 id="home-village-heading">{t("home.ourVillage")}</h2>
      <p className="home-panel-lede">{t("home.village.lede")}</p>

      <div className="home-panel-actions">
        <Link className="btn" href="/about/">
          {t("home.readMore", t("common.readMore"))} <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
