"use client";

import { useUiLang } from "@/components/i18n/LanguageProvider";
import { SectionIcon } from "@/components/platform/SectionIcon";
import { OfficialLinkList } from "@/components/directory/OfficialLink";
import { byIds } from "@/lib/directory";

type Job = {
  id: string;
  title: { en: string; te?: string };
  provenance: { source: string; sourceUrl: string; lastVerified: string };
};

/**
 * Careers.
 *
 * There are no job listings on this page because no one has submitted a
 * verified one. A village jobs board filled with plausible-looking invented
 * vacancies would waste people's bus fare, so the page links to the official
 * portals instead and says clearly that it lists nothing of its own yet.
 */
export function CareersPage({ jobs }: { jobs: Job[] }) {
  const { t, lang } = useUiLang();

  return (
    <main className="page careers-page">
      <div className="section">
        <span className="kids-intro-icon" aria-hidden>
          <SectionIcon name="careers" size={34} />
        </span>
        <p className="eyebrow">{t("nav.careers")}</p>
        <h1>{t("careers.title")}</h1>
        <p className="lede">{t("careers.lede")}</p>
      </div>

      <section className="section">
        <h2>{t("careers.listings")}</h2>
        {jobs.length ? (
          <ul className="oflink-list">
          {jobs.map((j) => (
            <li key={j.id} className="oflink-item">
              <a
                className="oflink"
                href={j.provenance.sourceUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
              >
                <span className="oflink-body">
                  <span className="oflink-head">
                    <strong>{(lang === "te" && j.title.te) || j.title.en}</strong>
                  </span>
                  <span className="oflink-meta">
                    <span className="oflink-dept">{j.provenance.source}</span>
                    <span className="oflink-domain">{j.provenance.lastVerified}</span>
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
        ) : (
          <p className="careers-empty">{t("careers.none")}</p>
        )}
      </section>

      <section className="section">
        <h2>{t("careers.official")}</h2>
        <OfficialLinkList items={byIds(["ncs", "appsc", "skillindia"])} />
      </section>
    </main>
  );
}
