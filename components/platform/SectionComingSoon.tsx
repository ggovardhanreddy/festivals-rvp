"use client";

import Link from "next/link";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { navHref } from "@/lib/routes/registry";
import { SectionIcon } from "./SectionIcon";

/**
 * Landing page for a section that is reserved but not built.
 *
 * This exists so a navigation link never dead-ends in a 404, and so the page
 * can say plainly that there is nothing here yet. It deliberately shows NO
 * placeholder courses, crops, schemes or jobs: inventing content to fill a
 * layout is exactly what this platform must not do.
 */
export function SectionComingSoon({
  titleKey,
  icon,
  alternatives,
}: {
  titleKey: string;
  icon: string;
  /**
   * Kept so the registry can go on recording which phase a section belongs to,
   * but never rendered: "Planned for phase 3" is our roadmap, not something a
   * villager can act on.
   */
  phase?: string;
  alternatives: { href: string; labelKey: string }[];
}) {
  const { t, lang } = useUiLang();
  const title = t(titleKey);

  return (
    <main className="page section-soon">
      <div className="section">
        <span className="section-soon-icon" aria-hidden>
          <SectionIcon name={icon} size={40} />
        </span>
        <h1>{t("section.notYet.title", undefined, { section: title })}</h1>
        <p className="lede">{t("section.notYet.body")}</p>

        {alternatives.length ? (
          <>
            <h2 className="section-soon-alt-heading">{t("section.notYet.meanwhile")}</h2>
            <ul className="section-soon-alts">
              {alternatives.map((a) => (
                <li key={a.href}>
                  <Link className="btn ghost" href={navHref(a.href, lang)}>
                    {t(a.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </main>
  );
}
