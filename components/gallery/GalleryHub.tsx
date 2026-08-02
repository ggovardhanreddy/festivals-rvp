"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Gallery } from "@/components/Gallery";
import { withBase } from "@/lib/base";
import { FESTIVAL_HEROES, BUCKETS } from "@/lib/site";
import type { Album, MediaWithAlbum } from "@/lib/types";

type CategoryKey =
  | "all"
  | "festivals"
  | "birthdays"
  | "temple"
  | "village"
  | "events"
  | "historical"
  | "other";

const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "festivals", label: "Festivals" },
  { key: "birthdays", label: "Birthdays" },
  { key: "temple", label: "Temple" },
  { key: "village", label: "Village" },
  { key: "events", label: "Events" },
  { key: "historical", label: "Historical" },
  { key: "other", label: "Other" },
];

const FESTIVAL_BUCKETS = [
  "sankranthi",
  "vinayaka-chavithi",
  "mathamma-jathara",
  "devapatlamma-jathara",
  "sri-rama-navami",
];

function categoryForAlbum(album: Album): CategoryKey[] {
  const keys: CategoryKey[] = ["all"];
  const bucket = album.bucket || "";
  const yearNum = Number(album.year);

  if (bucket === "rvp-birthdays") keys.push("birthdays");
  if (bucket === "fun-trips") keys.push("village", "events");
  if (FESTIVAL_BUCKETS.includes(bucket)) {
    keys.push("festivals", "events");
  }
  if (
    bucket === "sri-rama-navami" ||
    bucket === "vinayaka-chavithi" ||
    bucket === "mathamma-jathara" ||
    bucket === "devapatlamma-jathara"
  ) {
    keys.push("temple");
  }
  if (yearNum && yearNum <= 2018) keys.push("historical");
  if (
    !bucket ||
    ![...FESTIVAL_BUCKETS, "rvp-birthdays", "fun-trips"].includes(bucket)
  ) {
    keys.push("other");
  }
  return keys;
}

const FALLBACK = "/brand/village-aerial.webp";

export function GalleryHub({
  albums,
  media,
  years,
}: {
  albums: Album[];
  media: MediaWithAlbum[];
  years: string[];
}) {
  const [cat, setCat] = useState<CategoryKey>("all");
  const [year, setYear] = useState<string>("all");

  const filteredMedia = useMemo(() => {
    return media.filter((item) => {
      if (item.type !== "image" && item.type !== "video" && item.type !== "audio") {
        return false;
      }
      if (cat !== "all" && !categoryForAlbum(item.album).includes(cat)) {
        return false;
      }
      if (year !== "all" && item.album.year !== year) return false;
      return true;
    });
  }, [media, cat, year]);

  const chapters = BUCKETS.filter((b) =>
    albums.some((a) => a.bucket === b.key && (a.media?.length ?? 0) > 0),
  );

  if (!chapters.length && !media.length) {
    return (
      <section className="section">
        <p className="muted">
          No gallery photos yet. Add images under{" "}
          <code>content/&lt;YEAR&gt;/&lt;album&gt;/</code>, then sync.
        </p>
      </section>
    );
  }

  return (
    <div className="gallery-hub">
      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Chapters</p>
            <h2>Browse by festival & trip</h2>
          </div>
        </div>
        <div className="gallery-chapters">
          {chapters.map((bucket) => {
            const hero =
              FESTIVAL_HEROES[bucket.key] ||
              albums.find((a) => a.bucket === bucket.key)?.cover ||
              FALLBACK;
            return (
              <Link
                key={bucket.key}
                href={bucket.href}
                className="gallery-chapter-card"
              >
                <img
                  src={withBase(hero)}
                  alt=""
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = withBase(FALLBACK);
                  }}
                />
                <div>
                  <p className="eyebrow">{bucket.eyebrow}</p>
                  <h3>{bucket.title}</h3>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Gallery</p>
            <h2>All memories</h2>
          </div>
        </div>
        <div className="gallery-filters" role="tablist" aria-label="Gallery categories">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              role="tab"
              aria-selected={cat === c.key}
              className="filter-chip"
              data-active={cat === c.key || undefined}
              onClick={() => setCat(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="year-chip-row" aria-label="Filter by year">
          <button
            type="button"
            className="filter-chip"
            data-active={year === "all" || undefined}
            onClick={() => setYear("all")}
          >
            All years
          </button>
          {years.map((y) => (
            <button
              key={y}
              type="button"
              className="filter-chip"
              data-active={year === y || undefined}
              onClick={() => setYear(y)}
            >
              {y}
            </button>
          ))}
        </div>
        {filteredMedia.length ? (
          <Gallery items={filteredMedia} />
        ) : (
          <p className="muted">No photos match these filters yet.</p>
        )}
      </section>
    </div>
  );
}
