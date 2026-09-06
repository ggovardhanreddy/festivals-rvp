"use client";

import { useEffect, useMemo, useState } from "react";
import { withBase } from "@/lib/base";
import {
  DEFAULT_SITE_SETTINGS,
  DIRECTORY_CATEGORIES,
  loadDirectorySeed,
  sortByName,
} from "@/lib/community";
import { mergeMemberRosters } from "@/lib/member-stats";
import { useCommunityList } from "@/lib/use-community";
import type {
  DirectoryCategory,
  DirectoryEntry,
  Member,
  SiteSettings,
} from "@/lib/types";
import { Reveal } from "@/components/Reveal";
import { MediaImage } from "@/components/media/MediaImage";
import membersSeed from "@/content/data/members.json";
import { useUiLang } from "@/components/i18n/LanguageProvider";

const SEED = loadDirectorySeed();
const MEMBER_SEED = membersSeed as Member[];

/** Keep parenthetical suffixes (CG/CK) so similarly named people do not collide. */
function directoryNameKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/^dr\.?\s+/i, "")
    .replace(/[^a-z0-9()]+/g, "");
}

function memberPhotoByName(members: Member[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const member of members) {
    if (!member.photo) continue;
    map.set(directoryNameKey(member.name), member.photo);
  }
  return map;
}

/** Fill missing directory photos from the members roster (same person, same portrait). */
function applyMemberPhotos(
  entries: DirectoryEntry[],
  members: Member[],
): DirectoryEntry[] {
  const photos = memberPhotoByName(members);
  if (!photos.size) return entries;
  return entries.map((entry) => {
    if (entry.photo) return entry;
    const photo = photos.get(directoryNameKey(entry.name));
    return photo ? { ...entry, photo } : entry;
  });
}

function mergeDirectory(
  seed: DirectoryEntry[],
  remote: DirectoryEntry[],
  members: Member[],
): DirectoryEntry[] {
  const base = applyMemberPhotos(seed, members);
  if (!remote.length) return base;
  const map = new Map<string, DirectoryEntry>();
  for (const item of base) map.set(item.id, item);
  for (const item of remote) {
    const prev = map.get(item.id);
    map.set(item.id, {
      ...prev,
      ...item,
      name: item.name?.trim() || prev?.name || item.name,
      designation: item.designation?.trim() || prev?.designation,
      profession: item.profession?.trim() || prev?.profession || item.profession,
      photo: item.photo || prev?.photo || null,
      category: item.category || prev?.category || item.category,
    });
  }
  // Keep seed order, then append remote-only entries
  const seen = new Set<string>();
  const out: DirectoryEntry[] = [];
  for (const item of base) {
    const merged = map.get(item.id);
    if (merged) {
      out.push(merged);
      seen.add(item.id);
    }
  }
  for (const item of remote) {
    if (!seen.has(item.id) && map.has(item.id)) out.push(map.get(item.id)!);
  }
  return applyMemberPhotos(out, members);
}

export function DirectoryPage() {
  const { t } = useUiLang();
  const { raw, loading } = useCommunityList<DirectoryEntry>("directory", SEED);
  const { raw: memberRaw } = useCommunityList<Member>("members", MEMBER_SEED);
  const members = useMemo(
    () => mergeMemberRosters(MEMBER_SEED, memberRaw),
    [memberRaw],
  );
  const items = useMemo(
    () => mergeDirectory(SEED, raw, members),
    [raw, members],
  );
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
            <p className="eyebrow">{t("directory.eyebrow")}</p>
            <h1>{t("directory.title")}</h1>
            <p className="lede">
              Doctors, teachers, government staff, and other professionals who
              serve Reddivaripalli — updated from the community roster.
            </p>
          </div>
        </div>

        <div className="community-toolbar">
          <label className="community-search">
            <span className="sr-only">{t("directory.searchLabel")}</span>
            <input
              type="search"
              placeholder={t("directory.searchPlaceholder")}
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

        {loading ? <p className="muted">{t("directory.loading")}</p> : null}

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
                        <MediaImage
                          src={person.photo}
                          alt={person.name}
                          loading="lazy"
                          draggable={false}
                        />
                      ) : (
                        <span aria-hidden>
                          {person.name
                            .replace(/^Dr\.?\s+/i, "")
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
                      {person.designation ? (
                        <p className="directory-badge">{person.designation}</p>
                      ) : null}
                      <p className="muted">
                        {person.category}
                        {person.profession ? ` · ${person.profession}` : ""}
                      </p>
                      {!person.photo ? (
                        <p className="directory-meta">{t("directory.photoSoon")}</p>
                      ) : null}
                      {person.availability ? (
                        <p className="directory-meta">
                          Availability · {person.availability}
                        </p>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))
        ) : (
          <p className="muted">{t("directory.noMatches")}</p>
        )}
      </Reveal>
    </div>
  );
}
