"use client";

import Link from "next/link";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { navHref } from "@/lib/routes/registry";
import { SectionIcon } from "@/components/platform/SectionIcon";
import { OfficialLinkList } from "@/components/directory/OfficialLink";
import { byIds } from "@/lib/directory";
import type { AgricultureGuide } from "@/lib/content/schema";

type Crop = {
  id: string;
  title: { en: string; te?: string };
  season: string[];
  waterNeed: string;
  provenance: { source: string; sourceUrl: string; lastVerified: string };
};

/**
 * Agriculture.
 *
 * Two things this page will not do, both of which are the reason it looks
 * sparse rather than full:
 *
 *  - It sends nothing. No crop reminders, no sowing alerts, no scheduled
 *    notifications of any kind. A farmer opens this when they want it.
 *  - It prints no dosage, pesticide or fertiliser recommendation that does
 *    not carry a citation to the document it came from. There are none yet,
 *    so it prints none.
 */
export function AgriculturePage({
  crops,
  guides,
}: {
  crops: Crop[];
  guides: AgricultureGuide[];
}) {
  const { t, lang } = useUiLang();
  // The same curated entries the /farmers/ hub shows, not a second copy of
  // the data: one directory, read from in two places.
  const farming = byIds(["pmkisan", "pmfby", "soilhealth", "enam", "icar", "ap-agriculture", "e-panta"]);
  const empty = crops.length === 0 && guides.length === 0;

  return (
    <main className="page agri-page">
      <div className="section">
        <span className="kids-intro-icon" aria-hidden>
          <SectionIcon name="agriculture" size={34} />
        </span>
        <p className="eyebrow">{t("nav.agriculture")}</p>
        <h1>{t("agri.title")}</h1>
        <p className="lede">{t("agri.lede")}</p>
        <p className="agri-pledge">{t("agri.noReminders")}</p>
      </div>

      {empty ? (
        <section className="section agri-empty">
          <h2>{t("agri.noGuides")}</h2>
          <p className="muted">{t("agri.noGuides.body")}</p>
        </section>
      ) : (
        <>
          {crops.length ? (
            <section className="section" aria-labelledby="agri-crops">
              <h2 id="agri-crops">{t("agri.crops")}</h2>
              <ul className="agri-grid">
                {crops.map((c) => (
                  <li key={c.id} className="agri-card">
                    <strong>
                      {(lang === "te" && c.title.te) || c.title.en}
                    </strong>
                    <span className="muted">
                      {c.season.join(", ")} · {t(`agri.water.${c.waterNeed}`)}
                    </span>
                    <a
                      className="agri-source"
                      href={c.provenance.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                    >
                      {c.provenance.source}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {guides.length ? (
            <section className="section" aria-labelledby="agri-guides">
              <h2 id="agri-guides">{t("agri.guides")}</h2>
              <ul className="agri-list">
                {guides.map((g) => (
                  <li key={g.id} className="agri-card">
                    <strong>{(lang === "te" && g.title.te) || g.title.en}</strong>
                    <span>
                      {(lang === "te" && g.guidance.te) || g.guidance.en}
                    </span>
                    {g.dosage ? (
                      <span className="agri-dosage">
                        {(lang === "te" && g.dosage.text.te) || g.dosage.text.en}
                        <a
                          href={g.dosage.provenance.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                        >
                          {g.dosage.provenance.source}
                        </a>
                      </span>
                    ) : null}
                    <a
                      className="agri-source"
                      href={g.provenance.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                    >
                      {g.provenance.source} · {g.provenance.lastVerified}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}

      <section className="section" aria-labelledby="agri-official">
        <h2 id="agri-official">{t("agri.official")}</h2>
        <p className="muted">{t("agri.official.body")}</p>
        <OfficialLinkList items={farming} />
        <p className="muted">
          <Link href={navHref("/farmers/", lang)}>{t("farmers.title")}</Link>
          {" · "}
          <Link href={navHref("/government/", lang)}>{t("gov.title")}</Link>
        </p>
      </section>
    </main>
  );
}
