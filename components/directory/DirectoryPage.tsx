"use client";

import { useEffect, useMemo, useState } from "react";
import { withBase } from "@/lib/base";
import {
  DEFAULT_SITE_SETTINGS,
  DIRECTORY_CATEGORIES,
  loadDirectorySeed,
  sortByName,
} from "@/lib/community";
import { useCommunityList } from "@/lib/use-community";
import type { DirectoryCategory, DirectoryEntry, SiteSettings } from "@/lib/types";
import { Reveal } from "@/components/Reveal";

const SEED = loadDirectorySeed();

export function DirectoryPage() {
  const { items, loading } = useCommunityList<DirectoryEntry>("directory", SEED);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<DirectoryCategory | "all">("all");
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    fetch(withBase("/api/community/site-settings"))
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { settings?: SiteSettings } | null) => {
        if (data?.settings) {
          setSettings({ ...DEFAULT_SITE_SETTINGS, ...data.settings });
        }
      })
      .catch(() => undefined);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sortByName(items).filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (!q) return true;
      return [item.name, item.profession, item.designation, item.category]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [items, query, category]);

  const groups = DIRECTORY_CATEGORIES.map((cat) => ({
    cat,
    people: filtered.filter((p) => p.category === cat),
  })).filter((g) => g.people.length);

  return (
    <div className="directory-page">
      <Reveal className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Village services</p>
            <h1>Village Directory</h1>
            <p className="lede">
              Find doctors, teachers, and government employees who serve
              Reddivaripalli.
            </p>
          </div>
        </div>

        <div className="community-toolbar">
          <label className="community-search">
            <span className="sr-only">Search directory</span>
            <input
              type="search"
              placeholder="Search by name, profession…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="dev-filters" role="tablist" aria-label="Category">
            <button
              type="button"
              className="dev-filter-btn"
              aria-pressed={category === "all"}
              onClick={() => setCategory("all")}
            >
              All
            </button>
            {DIRECTORY_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className="dev-filter-btn"
                aria-pressed={category === cat}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? <p className="muted">Loading directory…</p> : null}

        {groups.length ? (
          groups.map(({ cat, people }) => (
            <section key={cat} className="directory-group">
              <h2>{cat}</h2>
              <div className="directory-grid">
                {people.map((person) => (
                  <article key={person.id} className="directory-card">
                    <div
                      className="directory-photo"
                      data-placeholder={!person.photo || undefined}
                    >
                      {person.photo ? (
                        <img
                          src={withBase(person.photo)}
                          alt={person.name}
                          loading="lazy"
                          draggable={false}
                        />
                      ) : (
                        <span aria-hidden>
                          {person.name
                            .split(/\s+/)
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((p) => p[0])
                            .join("")
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3>{person.name}</h3>
                      <p className="muted">
                        {person.profession}
                        {person.designation ? ` · ${person.designation}` : ""}
                      </p>
                      {person.availability ? (
                        <p className="directory-meta">
                          Availability · {person.availability}
                        </p>
                      ) : null}
                      {!settings.hideDirectoryContactsByDefault && person.phone ? (
                        <p className="directory-meta">
                          <a href={`tel:${person.phone}`}>{person.phone}</a>
                        </p>
                      ) : null}
                      {!settings.hideDirectoryContactsByDefault && person.email ? (
                        <p className="directory-meta">
                          <a href={`mailto:${person.email}`}>{person.email}</a>
                        </p>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))
        ) : (
          <p className="muted">No directory matches for this search.</p>
        )}
      </Reveal>
    </div>
  );
}
