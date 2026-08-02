"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { m, useReducedMotion } from "framer-motion";
import { Gallery } from "@/components/Gallery";
import { Reveal } from "@/components/Reveal";
import { withBase } from "@/lib/base";
import type { MediaWithAlbum } from "@/lib/types";

const MotionLink = m.create(Link);

const FILTERS = [
  { key: "all", label: "All" },
  { key: "festivals", label: "Festivals" },
  { key: "birthdays", label: "Birthdays" },
  { key: "temple", label: "Temple" },
  { key: "village", label: "Village" },
  { key: "events", label: "Events" },
  { key: "historical", label: "Historical" },
  { key: "other", label: "Other" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

const FESTIVAL_BUCKETS = [
  "sankranthi",
  "vinayaka-chavithi",
  "mathamma-jathara",
  "devapatlamma-jathara",
  "sri-rama-navami",
] as const;

const TEMPLE_BUCKETS = [
  "sri-rama-navami",
  "vinayaka-chavithi",
  "mathamma-jathara",
  "devapatlamma-jathara",
] as const;

const KNOWN_BUCKETS = [
  ...FESTIVAL_BUCKETS,
  "rvp-birthdays",
  "fun-trips",
] as const;

function matchesFilter(item: MediaWithAlbum, key: FilterKey): boolean {
  if (key === "all") return true;
  const bucket = item.album.bucket || "";
  const year = Number(item.album.year);

  switch (key) {
    case "birthdays":
      return bucket === "rvp-birthdays";
    case "festivals":
      return (FESTIVAL_BUCKETS as readonly string[]).includes(bucket);
    case "temple":
      return (TEMPLE_BUCKETS as readonly string[]).includes(bucket);
    case "village":
      return bucket === "fun-trips";
    case "events":
      return (
        (FESTIVAL_BUCKETS as readonly string[]).includes(bucket) ||
        bucket === "fun-trips"
      );
    case "historical":
      return Boolean(year && year <= 2018);
    case "other":
      return !(KNOWN_BUCKETS as readonly string[]).includes(bucket);
    default:
      return true;
  }
}

export function HomeGallery({
  items,
  years,
}: {
  items: MediaWithAlbum[];
  years: string[];
}) {
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [year, setYear] = useState<string>("all");

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (item.type !== "image") return false;
      if (!matchesFilter(item, filter)) return false;
      if (year !== "all" && item.album.year !== year) return false;
      return true;
    });
  }, [items, filter, year]);

  const featured = filtered.slice(0, 5);
  const rest = filtered.slice(5, 24);

  return (
    <Reveal className="section home-gallery" id="gallery">
      <div className="section-head">
        <div>
          <p className="eyebrow">Memories</p>
          <h2>Gallery</h2>
          <p className="lede">
            A living archive of festivals, faces, and ordinary days that became
            extraordinary.
          </p>
        </div>
        <Link className="btn ghost" href="/gallery/">
          Open gallery
        </Link>
      </div>

      <div className="gallery-filters" role="tablist" aria-label="Gallery categories">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            role="tab"
            aria-selected={filter === f.key}
            className="filter-chip"
            data-active={filter === f.key || undefined}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
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
        {years.slice(0, 10).map((y) => (
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

      {featured.length ? (
        <div className="home-masonry">
          {featured.map((item, index) => (
            <MotionLink
              key={item.id}
              href="/gallery/"
              className="home-masonry-item"
              data-span={index === 0 || index === 3 ? "wide" : undefined}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.25) }}
            >
              <img
                src={withBase(item.thumb || item.file)}
                alt={item.title || "Memory"}
                loading="lazy"
                decoding="async"
              />
            </MotionLink>
          ))}
        </div>
      ) : (
        <p className="muted">No photos match these filters yet.</p>
      )}

      {rest.length ? (
        <div className="home-gallery-grid">
          <Gallery items={rest} />
        </div>
      ) : null}
    </Reveal>
  );
}
