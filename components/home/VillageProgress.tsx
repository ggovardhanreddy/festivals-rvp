"use client";

import Link from "next/link";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { withBase } from "@/lib/base";
import { STATUS_META } from "@/lib/development-status";
import type { Development } from "@/lib/types";

const FALLBACK_IMAGE = "/logo/logo-mark.webp";

/**
 * The village's current development projects.
 *
 * Reads content/data/developments.json only — no example roads, no example
 * water schemes. If the file holds one project, one card renders; the section
 * never pads itself out with work nobody has proposed.
 */
export function VillageProgress({
  developments,
  limit = 4,
}: {
  developments: Development[];
  limit?: number;
}) {
  const { t, lang } = useUiLang();
  if (!developments.length) return null;

  const shown = [...developments]
    .sort((a, b) => (b.startDate || "").localeCompare(a.startDate || ""))
    .slice(0, limit);

  return (
    <section className="section home-progress" aria-labelledby="home-progress-heading">
      <div className="home-section-head">
        <div>
          <p className="eyebrow">{t("home.eyebrow.developments")}</p>
          <h2 id="home-progress-heading">{t("home.villageProgress")}</h2>
        </div>
        <Link className="btn ghost" href="/developments/">
          {t("home.viewAllDevelopments")} <span aria-hidden>→</span>
        </Link>
      </div>

      <ul className="progress-grid" data-count={shown.length}>
        {shown.map((project) => {
          const meta = STATUS_META[project.status];
          const image = project.images?.[0];
          // Village-authored content. Telugu is used when the village has
          // supplied it; nothing is machine-translated on their behalf.
          const title = (lang === "te" && project.titleTe) || project.title;
          const summary =
            (lang === "te" && project.summaryTe) ||
            project.summary ||
            project.description;
          return (
            <li key={project.id}>
              <Link className="progress-card" href="/developments/">
                <span
                  className="progress-card-media"
                  data-placeholder={image ? undefined : true}
                >
                  <img
                    src={withBase(image || FALLBACK_IMAGE)}
                    alt=""
                    width={640}
                    height={360}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <span className="progress-card-body">
                  <span className="progress-status" data-tone={meta?.tone}>
                    <span aria-hidden>{meta?.icon}</span>
                    {t(`development.status.${project.status}`, meta?.label ?? project.status)}
                  </span>
                  <span className="progress-card-title">{title}</span>
                  {/* Summary, not description. The full account of a project —
                      stages, milestones, what it needs from the village — is
                      what the Developments page is for. */}
                  <span className="progress-card-text muted">{summary}</span>
                  <span className="progress-card-cta">
                    {t("home.viewProject")} <span aria-hidden>→</span>
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
