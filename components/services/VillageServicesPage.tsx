"use client";

import Link from "next/link";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { navHref } from "@/lib/routes/registry";
import { SERVICE_GROUPS, isReady } from "@/lib/platform/doors";
import { SectionIcon } from "@/components/platform/SectionIcon";
import { UniversalSearchBar } from "@/components/platform/UniversalSearchBar";
import { PromiseBar } from "@/components/platform/PromiseBar";

/**
 * Village Services.
 *
 * The home of everything the homepage used to fan out across two large tile
 * blocks: government, banking, students, farmers, kids, careers, learning,
 * digital skills, weather, safety and emergency information. Same links, same
 * destinations — grouped by errand, on the page that owns them.
 */
export function VillageServicesPage() {
  const { t, lang } = useUiLang();

  return (
    <main className="page services-page">
      <div className="section services-intro">
        <p className="eyebrow">Reddivaripalli</p>
        <h1>{t("services.title")}</h1>
        <p className="lede">{t("services.lede")}</p>
        <UniversalSearchBar />
      </div>

      {SERVICE_GROUPS.map((group) => (
        <section
          key={group.id}
          className="section services-group"
          id={group.id}
          aria-labelledby={`services-${group.id}`}
        >
          <h2 id={`services-${group.id}`}>{t(group.titleKey)}</h2>
          <ul className="services-grid">
            {group.links.map((link) => (
              <li key={link.href}>
                <Link
                  className="service-tile"
                  href={navHref(link.href, lang)}
                  data-pending={isReady(link.href) ? undefined : true}
                >
                  <span className="service-tile-icon" aria-hidden>
                    <SectionIcon name={link.icon} size={24} />
                  </span>
                  <span className="service-tile-label">{t(link.labelKey)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <PromiseBar />
    </main>
  );
}
