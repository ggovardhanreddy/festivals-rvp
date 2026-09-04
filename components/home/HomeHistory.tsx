"use client";

import Link from "next/link";
import { useUiLang } from "@/components/i18n/LanguageProvider";

/**
 * Homepage history highlight — a village record teaser, not a second copy
 * of the full chronology. Stories and memories live on /stories/.
 */
export function HomeHistory() {
  const { t } = useUiLang();
  return (
    <section className="home-panel home-history" aria-labelledby="home-history-heading">
      <p className="eyebrow">{t("home.history.eyebrow")}</p>
      <h2 id="home-history-heading">{t("home.history.title")}</h2>
      <p className="home-panel-lede">{t("home.history.lede")}</p>
      <div className="home-panel-actions">
        <Link className="btn ghost" href="/about/#history">
          {t("home.readHistory")} <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
