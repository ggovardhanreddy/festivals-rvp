"use client";

/**
 * One category, grouped by subcategory, with the §8 language filter and the
 * §15 fields as client-side filters.
 *
 * Filtering happens in the browser over the published catalog. On a static
 * export that is the only option, and it is the right one at this scale — a
 * village's worth of resources is a few hundred records, and a filter that
 * responds instantly beats one that needs a round trip.
 */
import { useMemo, useState } from "react";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { ResourceCard } from "./ResourceCard";
import {
  applyFilters,
  CATEGORY_BY_KEY,
  facets,
  groupBySubcategory,
  LANGUAGE_LABEL,
  publicResources,
  RESOURCE_TYPE_LABEL,
  sortByRecency,
  subcategoryLabel,
  type CategoryKey,
  type Resource,
  type Source,
} from "@/lib/resources";
import { EmptyState } from "@/components/ui/empty-state";

export function ResourceCategoryPage({
  category,
  resources,
  sources,
}: {
  category: CategoryKey;
  resources: Resource[];
  sources: Source[];
}) {
  const { lang } = useUiLang();
  const cat = CATEGORY_BY_KEY[category];
  const all = useMemo(
    () => publicResources(resources).filter((r) => r.category === category),
    [resources, category],
  );
  const options = useMemo(() => facets(all), [all]);
  const sourceName = new Map(sources.map((s) => [s.id, s.name]));

  const [language, setLanguage] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () => applyFilters(all, { language, classLevel, resourceType, q }),
    [all, language, classLevel, resourceType, q],
  );
  const groups = useMemo(() => groupBySubcategory(filtered, category), [filtered, category]);
  const filtering = Boolean(language || classLevel || resourceType || q);

  return (
    <main className="page resource-category">
      <div className="section">
        <p className="eyebrow">{lang === "te" ? "లెర్నింగ్ సెంటర్" : "Learning Center"}</p>
        <h1>{lang === "te" ? cat.labelTe : cat.label}</h1>
        <p className="lede">{cat.blurb}</p>
      </div>

      {all.length > 0 ? (
        <section className="section resource-filters">
          <label>
            <span>{lang === "te" ? "వెతకండి" : "Search"}</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={lang === "te" ? "శీర్షిక, సబ్జెక్ట్..." : "Title, subject, text…"}
            />
          </label>

          {options.languages.length > 1 ? (
            <label>
              <span>{lang === "te" ? "భాష" : "Language"}</span>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="">{lang === "te" ? "అన్నీ" : "All"}</option>
                {options.languages.map((l) => (
                  <option key={l} value={l}>
                    {LANGUAGE_LABEL[l]}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {options.classLevels.length > 1 ? (
            <label>
              <span>{lang === "te" ? "తరగతి" : "Class"}</span>
              <select value={classLevel} onChange={(e) => setClassLevel(e.target.value)}>
                <option value="">{lang === "te" ? "అన్నీ" : "All"}</option>
                {options.classLevels.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {options.resourceTypes.length > 1 ? (
            <label>
              <span>{lang === "te" ? "రకం" : "Type"}</span>
              <select value={resourceType} onChange={(e) => setResourceType(e.target.value)}>
                <option value="">{lang === "te" ? "అన్నీ" : "All"}</option>
                {options.resourceTypes.map((t) => (
                  <option key={t} value={t}>
                    {RESOURCE_TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <p className="muted resource-filter-count">
            {filtered.length} {lang === "te" ? "వనరులు" : filtered.length === 1 ? "resource" : "resources"}
          </p>
        </section>
      ) : null}

      {all.length === 0 ? (
        <div className="section">
          <EmptyState
            title={lang === "te" ? "ఇంకా వనరులు లేవు" : "Nothing published here yet"}
            description={
              lang === "te"
                ? "ఈ విభాగంలో వనరులు సేకరించిన తర్వాత సమీక్షించి ప్రచురిస్తాము."
                : "Resources for this section are reviewed before they appear. Check the official portals on the Learning Center in the meantime."
            }
          />
        </div>
      ) : groups.length === 0 ? (
        <div className="section">
          <EmptyState
            title={lang === "te" ? "ఫలితాలు లేవు" : "No matches"}
            description={
              filtering
                ? lang === "te"
                  ? "వడపోతలను మార్చి ప్రయత్నించండి."
                  : "Try clearing a filter."
                : ""
            }
          />
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.key} className="section">
            <h2>{subcategoryLabel(category, group.key, lang === "te" ? "te" : "en")}</h2>
            <div className="resource-grid">
              {sortByRecency(group.items).map((r) => (
                <ResourceCard key={r.id} resource={r} sourceName={sourceName.get(r.sourceId)} />
              ))}
            </div>
          </section>
        ))
      )}
    </main>
  );
}
