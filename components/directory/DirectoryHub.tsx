"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { navHref } from "@/lib/routes/registry";
import { SectionIcon } from "@/components/platform/SectionIcon";
import {
  DIRECTORY,
  PRIVATE_BANKS,
  PUBLIC_BANKS,
  byIds,
  type DirectoryEntry,
  type HubDef,
} from "@/lib/directory";
import { normalize } from "@/lib/search/normalize";
import { OfficialLinkList } from "./OfficialLink";
import { SafetyBanner } from "./SafetyBanner";

/**
 * One component behind /government/, /students/, /farmers/ and /banking/.
 *
 * The hub definition decides what appears; this decides how. Filtering is
 * local and instant — 92 entries do not need the search index, and a farmer
 * on a slow connection should not wait for a network round trip to find
 * "PM-KISAN" on a page that already contains it.
 */
function matches(entry: DirectoryEntry, needle: string): boolean {
  if (!needle) return true;
  const hay = normalize(
    [
      entry.name,
      entry.nameTe ?? "",
      entry.description,
      entry.descriptionTe ?? "",
      entry.department,
      entry.officialDomain,
      ...(entry.keywords ?? []),
    ].join(" "),
  );
  return hay.includes(needle);
}

const SPECIAL_GROUPS: Record<string, DirectoryEntry[]> = {
  "banking.group.public": PUBLIC_BANKS,
  "banking.group.private": PRIVATE_BANKS,
};

export function DirectoryHub({ hub }: { hub: HubDef }) {
  const { t, lang } = useUiLang();
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const needle = normalize(deferred);

  const groups = useMemo(
    () =>
      hub.groups
        .map((g) => ({
          titleKey: g.titleKey,
          items: (
            SPECIAL_GROUPS[g.titleKey] ??
            (g.ids ? byIds(g.ids) : DIRECTORY.filter((e) => e.category === g.category))
          ).filter((e) => matches(e, needle)),
        }))
        .filter((g) => g.items.length > 0),
    [hub, needle],
  );

  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <main className="page dirhub">
      <div className="section dirhub-intro">
        <span className="kids-intro-icon" aria-hidden>
          <SectionIcon name={hub.icon} size={34} />
        </span>
        <h1>{t(hub.titleKey)}</h1>
        <p className="lede">{t(hub.ledeKey)}</p>
        <p className="dirhub-independent">{t("gov.independent")}</p>
      </div>

      <div className="section">
        <SafetyBanner kind={hub.slug === "banking" ? "bank" : "gov"} />
      </div>

      <div className="section">
        <label className="sr-only" htmlFor="dirhub-filter">
          {t("gov.filter")}
        </label>
        <input
          id="dirhub-filter"
          type="search"
          className="searchpage-input dirhub-filter"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("gov.filter")}
          autoComplete="off"
        />
        <p className="muted dirhub-count" role="status" aria-live="polite">
          {t("search.results", undefined, { count: total })}
        </p>
      </div>

      {total === 0 ? (
        <div className="section">
          <p className="careers-empty">{t("gov.noMatch")}</p>
          <p className="muted">
            <Link href={navHref("/search/", lang)}>{t("search.title")}</Link>
          </p>
        </div>
      ) : null}

      {groups.map((group) => (
        <section className="section" key={group.titleKey} aria-labelledby={`g-${group.titleKey}`}>
          <h2 id={`g-${group.titleKey}`} className="dirhub-group">
            {t(group.titleKey)}{" "}
            <span className="muted">{group.items.length}</span>
          </h2>
          <OfficialLinkList items={group.items} />
        </section>
      ))}

      <p className="muted section dirhub-note">{t("gov.notAllSites")}</p>
    </main>
  );
}
