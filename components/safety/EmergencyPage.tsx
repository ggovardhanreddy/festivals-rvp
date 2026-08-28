"use client";

import { useUiLang } from "@/components/i18n/LanguageProvider";
import { SectionIcon } from "@/components/platform/SectionIcon";
import { HELPLINES } from "@/lib/directory";

/**
 * Emergency numbers.
 *
 * Every number is a tel: link, large enough to hit without reading glasses,
 * and every one cites the official page it was read from. Nothing here came
 * from memory or from a listicle.
 */
export function EmergencyPage() {
  const { t, lang } = useUiLang();

  return (
    <main className="page emergency-page">
      <div className="section">
        <span className="kids-intro-icon emergency-icon" aria-hidden>
          <SectionIcon name="siren" size={34} />
        </span>
        <h1>{t("emergency.title")}</h1>
        <p className="lede">{t("emergency.lede")}</p>
      </div>

      <div className="section">
        <ul className="emergency-list">
          {HELPLINES.map((h) => (
            <li key={h.id}>
              <a className="emergency-card" href={`tel:${h.number}`}>
                <span className="emergency-number">{h.number}</span>
                <span className="emergency-text">
                  <strong>{(lang === "te" && h.nameTe) || h.name}</strong>
                  <span className="muted">
                    {(lang === "te" && h.descriptionTe) || h.description}
                  </span>
                </span>
                <span className="emergency-call" aria-hidden>
                  {t("emergency.call")}
                </span>
              </a>
              <p className="oflink-source">
                <a href={h.sourceUrl} target="_blank" rel="noopener noreferrer nofollow">
                  {h.source}
                </a>
                {" · "}
                {t("gov.verified", undefined, { date: h.lastVerified })}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
