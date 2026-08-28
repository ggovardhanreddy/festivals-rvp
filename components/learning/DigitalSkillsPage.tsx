"use client";

import Link from "next/link";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { withLocale } from "@/lib/i18n/config";
import { SectionIcon } from "@/components/platform/SectionIcon";
import { byIds } from "@/lib/directory";
import { OfficialLinkList } from "@/components/directory/OfficialLink";
import { text, type PublicationStatus, type VideoItem } from "@/lib/learning";
import { StatusNotice } from "./StatusNotice";

type Course2 = {
  id: string;
  slug: string;
  title: { en: string; te?: string };
  description: { en: string; te?: string };
  status?: PublicationStatus;
};

/**
 * Digital Skills.
 *
 * The modules below are the syllabus this section is being built to, not
 * lessons pretending to exist: each is listed with what it will cover and
 * marked as not yet launched. That is a deliberate middle ground between a
 * blank "coming soon" page, which tells a villager nothing, and inventing
 * lesson content, which would tell them something false.
 *
 * The three official links at the bottom are real and usable today — they are
 * where someone who needs this now should actually go.
 */
const MODULES = [
  { id: "phone", icon: "digital", titleKey: "digital.mod.phone", descKey: "digital.mod.phone.desc" },
  { id: "internet", icon: "it", titleKey: "digital.mod.internet", descKey: "digital.mod.internet.desc" },
  { id: "gov", icon: "government", titleKey: "digital.mod.gov", descKey: "digital.mod.gov.desc" },
  { id: "payments", icon: "banking", titleKey: "digital.mod.payments", descKey: "digital.mod.payments.desc" },
  { id: "safety", icon: "shield", titleKey: "digital.mod.safety", descKey: "digital.mod.safety.desc" },
  { id: "documents", icon: "book", titleKey: "digital.mod.documents", descKey: "digital.mod.documents.desc" },
] as const;

export function DigitalSkillsPage({
  courses,
  videos,
}: {
  courses: Course2[];
  videos: VideoItem[];
}) {
  const { t, lang } = useUiLang();
  const published = courses.filter((c) => c.status === "published");
  const clips = videos.filter((v) => v.category === "digital-skills");

  return (
    <main className="page digital-page">
      <div className="section">
        <span className="kids-intro-icon" aria-hidden>
          <SectionIcon name="digital" size={34} />
        </span>
        <h1>{t("digital.title")}</h1>
        <p className="lede">{t("digital.notLaunched")}</p>
        <p className="muted digital-phase">{t("section.plannedPhase", undefined, { phase: "5" })}</p>
      </div>

      <section className="section" aria-labelledby="digital-plan">
        <h2 id="digital-plan">{t("digital.plan")}</h2>
        <p className="muted">{t("digital.plan.body")}</p>
        <ul className="kids-grid kids-grid--pending">
          {MODULES.map((m) => (
            <li key={m.id}>
              <div className="kids-card is-pending" aria-disabled="true">
                <span className="kids-card-icon" aria-hidden>
                  <SectionIcon name={m.icon} size={26} />
                </span>
                <span className="kids-card-title">{t(m.titleKey)}</span>
                <span className="kids-card-desc">{t(m.descKey)}</span>
                <StatusNotice status="planned" variant="inline" />
              </div>
            </li>
          ))}
        </ul>
      </section>

      {published.length ? (
        <section className="section" aria-labelledby="digital-lessons">
          <h2 id="digital-lessons">{t("learn.courses")}</h2>
          <ul className="libgrid">
            {published.map((c) => (
              <li key={c.id}>
                <Link className="libcard" href={withLocale(`/digital-skills/${c.slug}/`, lang)}>
                  <span className="libcard-body">
                    <strong className="libcard-title">{text(c.title, lang)}</strong>
                    <span className="libcard-desc">{text(c.description, lang)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {clips.length ? (
        <section className="section">
          <h2>{t("kids.videos")}</h2>
          <p className="muted">
            <Link href={withLocale("/kids/videos/", lang)}>{t("common.viewAll")}</Link>
          </p>
        </section>
      ) : null}

      <section className="section" aria-labelledby="digital-now">
        <h2 id="digital-now">{t("digital.useNow")}</h2>
        <p className="muted">{t("digital.useNow.body")}</p>
        <OfficialLinkList items={byIds(["skillindia", "digilocker", "sanchar-saathi"])} />
        <p className="muted">
          <Link href={withLocale("/safety/", lang)}>{t("safety.title")}</Link>
          {" · "}
          <Link href={withLocale("/government/", lang)}>{t("gov.title")}</Link>
        </p>
      </section>
    </main>
  );
}
