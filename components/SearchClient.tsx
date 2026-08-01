"use client";

import { useEffect, useMemo, useState } from "react";
import { m } from "framer-motion";
import type { MediaWithAlbum } from "@/lib/types";
import { BUCKETS } from "@/lib/site";
import { withBase } from "@/lib/base";
import { Gallery } from "./Gallery";
import { Input } from "./ui/input";

type SearchDoc = {
  title: string;
  date: string;
  tags?: string[];
  type?: string;
  album: string;
  bucket?: string;
  url: string;
};

export function SearchClient({ items }: { items: MediaWithAlbum[] }) {
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("all");
  const [bucket, setBucket] = useState("all");
  const [type, setType] = useState("all");
  const [index, setIndex] = useState<SearchDoc[] | null>(null);

  useEffect(() => {
    fetch(withBase("/search-index.json"))
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) setIndex(data as SearchDoc[]);
      })
      .catch(() => setIndex(null));
  }, []);

  const years = useMemo(
    () =>
      [...new Set(items.map((item) => item.album.year))]
        .filter((y) => y !== "Unknown")
        .sort((a, b) => b.localeCompare(a)),
    [items],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (year !== "all" && item.album.year !== year) return false;
      if (bucket !== "all" && item.album.bucket !== bucket) return false;
      if (type !== "all" && item.type !== type) return false;
      if (!q) return true;
      const fromIndex = index?.find(
        (doc) => doc.title === item.title && doc.date === item.date,
      );
      const hay = [
        item.title,
        item.date,
        item.album.title,
        item.album.category,
        item.album.personName,
        item.album.festival,
        item.album.bucket,
        ...(item.tags || []),
        ...(fromIndex?.tags || []),
        fromIndex?.album,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [items, query, year, bucket, type, index]);

  return (
    <div>
      <m.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search year, festival, album, keyword…"
          aria-label="Search memories"
        />
        <div className="search-filters">
          <label>
            <span className="sr-only">Year</span>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              aria-label="Filter by year"
            >
              <option value="all">All years</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Festival</span>
            <select
              value={bucket}
              onChange={(e) => setBucket(e.target.value)}
              aria-label="Filter by festival or album type"
            >
              <option value="all">All collections</option>
              {BUCKETS.map((b) => (
                <option key={b.key} value={b.key}>
                  {b.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Media type</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              aria-label="Filter by media type"
            >
              <option value="all">All media</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
              <option value="document">Documents</option>
            </select>
          </label>
        </div>
      </m.div>
      <p className="muted" style={{ margin: "1rem 0 1.5rem" }}>
        {filtered.length} memor{filtered.length === 1 ? "y" : "ies"}
        {index ? " · index ready" : ""}
      </p>
      <Gallery items={filtered} />
    </div>
  );
}
