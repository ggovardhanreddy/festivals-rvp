"use client";

import Link from "next/link";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { navHref } from "@/lib/routes/registry";
import { SectionIcon } from "@/components/platform/SectionIcon";

type Course = { id: string; title: { en: string; te?: string }; summary?: { en: string; te?: string } };

/**
 * Learning hub.
 *
 * The structure is here; the courses are not. Everything that genuinely
 * exists is linked, and everything that does not is named with the reason,
 * because a hub full of invented syllabi would be worse than a short one.
 */
const AREAS = [
  { id: "kids", href: "/kids/", labelKey: "nav.kids", descKey: "learn.kids.desc", icon: "kids", ready: true },
  { id: "play", href: "/play/", labelKey: "nav.play", descKey: "learn.play.desc", icon: "play", ready: true },
  { id: "english", href: "/english/", labelKey: "nav.english", descKey: "learn.english.desc", icon: "english", ready: false },
  { id: "it", href: "/it/", labelKey: "nav.it", descKey: "learn.it.desc", icon: "it", ready: false },
  { id: "engineering", href: "/engineering/", labelKey: "nav.engineering", descKey: "learn.engineering.desc", icon: "engineering", ready: false },
  { id: "digital", href: "/digital-skills/", labelKey: "nav.digitalSkills", descKey: "learn.digital.desc", icon: "digital", ready: false },
];

export function LearnPage({ courses }: { courses: Course[] }) {
  const { t, lang } = useUiLang();
  const ready = AREAS.filter((a) => a.ready);
  const planned = AREAS.filter((a) => !a.ready);

  return (
    <main className="page learn-page">
      <div className="section">
        <span className="kids-intro-icon" aria-hidden>
          <SectionIcon name="learn" size={34} />
        </span>
        <p className="eyebrow">{t("common.free")}</p>
        <h1>{t("nav.learn")}</h1>
        <p className="lede">{t("learn.lede")}</p>
      </div>

      <section className="section">
        <h2>{t("learn.available")}</h2>
        <ul className="kids-grid">
          {ready.map((a) => (
            <li key={a.id}>
              <Link className="kids-card" href={navHref(a.href, lang)}>
                <span className="kids-card-icon" aria-hidden>
                  <SectionIcon name={a.icon} size={26} />
                </span>
                <span className="kids-card-title">{t(a.labelKey)}</span>
                <span className="kids-card-desc">{t(a.descKey)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {courses.length ? (
        <section className="section">
          <h2>{t("learn.courses")}</h2>
          <ul className="agri-list">
            {courses.map((c) => (
              <li key={c.id} className="agri-card">
                <strong>{(lang === "te" && c.title.te) || c.title.en}</strong>
                {c.summary ? (
                  <span className="muted">
                    {(lang === "te" && c.summary.te) || c.summary.en}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="section">
          <h2>{t("learn.courses")}</h2>
          <p className="careers-empty">{t("learn.noCourses")}</p>
        </section>
      )}

      <section className="section">
        <h2>{t("learn.planned")}</h2>
        <ul className="kids-grid kids-grid--pending">
          {planned.map((a) => (
            <li key={a.id}>
              <div className="kids-card is-pending" aria-disabled="true">
                <span className="kids-card-icon" aria-hidden>
                  <SectionIcon name={a.icon} size={26} />
                </span>
                <span className="kids-card-title">{t(a.labelKey)}</span>
                <span className="kids-card-desc">{t(a.descKey)}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
