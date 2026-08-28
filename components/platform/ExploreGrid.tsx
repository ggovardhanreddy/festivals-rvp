"use client";

import Link from "next/link";
import { EXPLORE_TILES, isReady } from "@/lib/platform/doors";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { withLocale } from "@/lib/i18n/config";
import { SectionIcon } from "./SectionIcon";

export function ExploreGrid() {
  const { t, lang } = useUiLang();
  return (
    <section className="section explore-section" aria-labelledby="explore-heading">
      <div className="section-head">
        <div>
          <p className="eyebrow">{t("home.explore")}</p>
          <h2 id="explore-heading">{t("home.explore")}</h2>
        </div>
      </div>
      <ul className="explore-grid">
        {EXPLORE_TILES.map((tile) => (
          <li key={tile.id}>
            <Link
              className="explore-tile"
              href={withLocale(tile.href, lang)}
              data-pending={isReady(tile.href) ? undefined : true}
            >
              <span className="explore-tile-icon" aria-hidden>
                <SectionIcon name={tile.icon} size={26} />
              </span>
              <span className="explore-tile-label">{t(tile.labelKey)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
