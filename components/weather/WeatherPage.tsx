"use client";

import { useUiLang } from "@/components/i18n/LanguageProvider";
import { SectionIcon } from "@/components/platform/SectionIcon";
import { OfficialLinkList } from "@/components/directory/OfficialLink";
import { byIds } from "@/lib/directory";

/**
 * Weather.
 *
 * There is no weather here unless a real provider is configured. A village
 * where people decide when to irrigate cannot be given a guessed forecast,
 * and a forecast copied from an unnamed source is a guess. Until a provider
 * is wired up, the honest answer is a link to the India Meteorological
 * Department, which is the authority everyone else is quoting anyway.
 */
export function WeatherPage({ provider }: { provider: string | null }) {
  const { t } = useUiLang();

  return (
    <main className="page weather-page">
      <div className="section">
        <span className="kids-intro-icon" aria-hidden>
          <SectionIcon name="weather" size={34} />
        </span>
        <p className="eyebrow">{t("nav.weather")}</p>
        <h1>{t("weather.title")}</h1>
        {provider ? (
          <p className="lede">{t("weather.provider", undefined, { provider })}</p>
        ) : (
          <>
            <p className="lede">{t("weather.none")}</p>
            <p className="muted">{t("weather.none.body")}</p>
          </>
        )}
      </div>

      <section className="section">
        <OfficialLinkList items={byIds(["imd"])} />
      </section>
    </main>
  );
}
