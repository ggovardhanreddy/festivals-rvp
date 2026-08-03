"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Gallery } from "@/components/Gallery";
import { MediaImage } from "@/components/media/MediaImage";
import { albumHref, BUCKETS } from "@/lib/site";
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
    ![...FESTIVAL_BUCKETS, "rvp-birthdays"].includes(bucket)
  ) {
    keys.push("other", "village");
  }
  return keys;
}

function albumTitle(album: Album): string {
  const bucket = BUCKETS.find((b) => b.key === album.bucket);
  if (bucket) return bucket.title;
  return album.title.replace(/\s+\d{4}$/, "") || album.title;
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

  const publicAlbums = useMemo(
    () =>
      albums.filter(
        (a) =>
          a.bucket !== "fun-trips" &&
          (a.media?.length ?? 0) > 0 &&
          (cat === "all" || categoryForAlbum(a).includes(cat)) &&
          (year === "all" || a.year === year),
      ),
    [albums, cat, year],
  );

  const byYear = useMemo(() => {
    const map = new Map<string, Album[]>();
    for (const album of publicAlbums) {
      const list = map.get(album.year) || [];
      list.push(album);
      map.set(album.year, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => {
        const at = albumTitle(a).localeCompare(albumTitle(b));
        return at || a.slug.localeCompare(b.slug);
      });
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [publicAlbums]);

  const filteredMedia = useMemo(() => {
    return media.filter((item) => {
      if (item.album.bucket === "fun-trips") return false;
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

  if (!publicAlbums.length && !filteredMedia.length) {
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
            <p className="eyebrow">Albums</p>
            <h2>Browse by year &amp; festival</h2>
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

        {byYear.length ? (
          <div className="gallery-year-groups">
            {byYear.map(([yr, yearAlbums]) => (
              <div key={yr} className="gallery-year-group">
                <h3 className="gallery-year-heading">{yr}</h3>
                <div className="gallery-album-grid">
                  {yearAlbums.map((album) => {
                    const count = album.media?.length ?? 0;
                    return (
                      <Link
                        key={`${album.year}-${album.bucket}-${album.slug}`}
                        href={albumHref(album)}
                        className="gallery-album-card"
                      >
                        <div className="gallery-album-cover">
                          <MediaImage
                            src={album.cover}
                            fallback={FALLBACK}
                            alt=""
                            loading="lazy"
                          />
                        </div>
                        <div className="gallery-album-meta">
                          <p className="eyebrow">{album.year}</p>
                          <h4>{albumTitle(album)}</h4>
                          <p className="muted">
                            {count} {count === 1 ? "item" : "items"}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">No albums match these filters yet.</p>
        )}
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">All media</p>
            <h2>Every frame</h2>
          </div>
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
