"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { withLocale } from "@/lib/i18n/config";
import { SectionIcon } from "@/components/platform/SectionIcon";
import { isPublished, ordered, type LearningItem } from "@/lib/learning";
import { LibraryCard } from "./LibraryCard";
import { EmptyLibrary } from "./StatusNotice";

export type Facet = { id: string; labelKey: string; match: (item: LearningItem) => boolean };

/**
 * The listing shell shared by Stories, Rhymes, Science and Videos.
 *
 * It renders the same way whether the library holds forty items or none: the
 * filters, the grid and the empty state are all part of the finished design,
 * not a placeholder to be replaced when content arrives. That is the point —
 * adding a real story later is a JSON file, not a redesign.
 */
export function LibrarySection({
  titleKey,
  ledeKey,
  icon,
  items,
  hrefFor,
  facets = [],
  emptyTitleKey,
  emptyReasonKey,
  emptyHelpKey,
  children,
}: {
  titleKey: string;
  ledeKey: string;
  icon: string;
  items: LearningItem[];
  hrefFor?: (item: LearningItem) => string | undefined;
  facets?: Facet[];
  emptyTitleKey: string;
  emptyReasonKey: string;
  emptyHelpKey?: string;
  children?: React.ReactNode;
}) {
  const { t, lang } = useUiLang();
  const [facet, setFacet] = useState("all");

  const all = useMemo(() => ordered(items), [items]);
  const shown = useMemo(() => {
    if (facet === "all") return all;
    const f = facets.find((x) => x.id === facet);
    return f ? all.filter(f.match) : all;
  }, [all, facet, facets]);

  const publishedCount = all.filter(isPublished).length;

  return (
    <main className="page library-page">
      <div className="section library-head">
        <p className="eyebrow">
          <Link href={withLocale("/kids/", lang)}>{t("nav.kids")}</Link>
        </p>
        <span className="kids-intro-icon" aria-hidden>
          <SectionIcon name={icon} size={32} />
        </span>
        <h1>{t(titleKey)}</h1>
        <p className="lede">{t(ledeKey)}</p>
      </div>

      {children ? <div className="section">{children}</div> : null}

      {all.length === 0 ? (
        <div className="section">
          <EmptyLibrary
            titleKey={emptyTitleKey}
            reasonKey={emptyReasonKey}
            helpKey={emptyHelpKey}
          />
        </div>
      ) : (
        <>
          {facets.length ? (
            <div className="section">
              <div className="searchpage-facets" role="group" aria-label={t("search.filters")}>
                <button
                  type="button"
                  className={`filter-chip${facet === "all" ? " is-active" : ""}`}
                  aria-pressed={facet === "all"}
                  onClick={() => setFacet("all")}
                >
                  {t("search.allSections")}
                </button>
                {facets.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={`filter-chip${facet === f.id ? " is-active" : ""}`}
                    aria-pressed={facet === f.id}
                    onClick={() => setFacet(f.id)}
                  >
                    {t(f.labelKey)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="section">
            {publishedCount === 0 ? (
              <p className="status-block" role="status">
                {t(emptyReasonKey)}
              </p>
            ) : null}
            <ul className="libgrid">
              {shown.map((item) => (
                <LibraryCard
                  key={item.id}
                  item={item}
                  href={hrefFor?.(item)}
                  icon={icon}
                />
              ))}
            </ul>
          </div>
        </>
      )}
    </main>
  );
}
