"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { m } from "framer-motion";
import type { Album, MediaType, MediaWithAlbum } from "@/lib/types";
import { BUCKETS } from "@/lib/site";
import { withBase } from "@/lib/base";
import { trackAnalyticsHit } from "@/lib/use-community";
import { Gallery } from "./Gallery";
import { Input } from "./ui/input";

type SearchDoc = {
  id?: string;
  title: string;
  date?: string;
  tags?: string[];
  type?: string;
  kind?: string;
  album?: string;
  albumSlug?: string;
  category?: Album["category"];
  bucket?: string;
  year?: string;
  url: string;
  body?: string;
  file?: string;
  thumb?: string;
  poster?: string;
};

function mediaFromIndex(docs: SearchDoc[]): MediaWithAlbum[] {
  return docs
    .filter((doc) => doc.kind === "media" && doc.file)
    .map((doc) => {
      const album: Album = {
        year: doc.year || "Unknown",
        category: doc.category || "Festivals",
        slug: doc.albumSlug || "album",
        title: doc.album || "Album",
        description: "",
        published: true,
        order: 0,
        media: [],
        bucket: doc.bucket as Album["bucket"],
      };
      return {
        id: doc.id || `${doc.year}-${doc.title}`,
        file: doc.file!,
        thumb: doc.thumb || doc.file!,
        poster: doc.poster,
        type: (doc.type || "image") as MediaType,
        title: doc.title,
        date: doc.date || "",
        tags: doc.tags || [],
        album,
      };
    });
}

export function SearchClient() {
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("all");
  const [bucket, setBucket] = useState("all");
  const [type, setType] = useState("all");
  const [kind, setKind] = useState("all");
  const [index, setIndex] = useState<SearchDoc[] | null>(null);

  useEffect(() => {
    fetch(withBase("/search-index.json"))
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) setIndex(data as SearchDoc[]);
      })
      .catch(() => setIndex(null));
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const t = window.setTimeout(() => {
      void trackAnalyticsHit({
        path: "/search/",
        kind: "search",
        meta: q.slice(0, 80),
      });
    }, 900);
    return () => window.clearTimeout(t);
  }, [query]);

  const mediaItems = useMemo(
    () => (index ? mediaFromIndex(index) : []),
    [index],
  );

  const years = useMemo(
    () =>
      [...new Set(mediaItems.map((item) => item.album.year))]
        .filter((y) => y !== "Unknown")
        .sort((a, b) => b.localeCompare(a)),
    [mediaItems],
  );

  const communityHits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!index) return [] as SearchDoc[];
    return index.filter((doc) => {
      if (!doc.kind || doc.kind === "media") return false;
      if (kind !== "all" && doc.kind !== kind) return false;
      if (!q) return kind !== "all";
      const hay = [doc.title, doc.body, doc.kind, ...(doc.tags || [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [index, query, kind]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (kind !== "all" && kind !== "media") return [];
    return mediaItems.filter((item) => {
      if (year !== "all" && item.album.year !== year) return false;
      if (bucket !== "all" && item.album.bucket !== bucket) return false;
      if (type !== "all" && item.type !== type) return false;
      if (!q) return true;
      const hay = [
        item.title,
        item.date,
        item.album.title,
        item.album.category,
        item.album.bucket,
        ...(item.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [mediaItems, query, year, bucket, type, kind]);

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
          placeholder="Search members, festivals, photos, doctors, documents…"
          aria-label="Search the village portal"
        />
        <div className="search-filters">
          <label>
            <span className="sr-only">Kind</span>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              aria-label="Filter by kind"
            >
              <option value="all">Everything</option>
              <option value="media">Gallery media</option>
              <option value="member">Members</option>
              <option value="directory">Directory</option>
              <option value="event">Events</option>
              <option value="development">Developments</option>
              <option value="document">Documents</option>
              <option value="heritage">Heritage</option>
            </select>
          </label>
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
              {BUCKETS.filter((b) =>
                mediaItems.some((i) => i.album.bucket === b.key),
              ).map((b) => (
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

      {communityHits.length ? (
        <section className="search-community" style={{ margin: "1.25rem 0" }}>
          <h2 style={{ fontSize: "1.1rem" }}>
            Village records ({communityHits.length})
          </h2>
          <ul className="search-community-list">
            {communityHits.slice(0, 40).map((doc) => (
              <li key={`${doc.kind}-${doc.url}-${doc.title}`}>
                <Link href={doc.url}>
                  <span className="eyebrow">{doc.kind}</span>
                  <strong>{doc.title}</strong>
                  {doc.body ? <span className="muted">{doc.body}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {(kind === "all" || kind === "media") && (
        <>
          <p className="muted" style={{ margin: "1rem 0 1.5rem" }}>
            {filtered.length} memor{filtered.length === 1 ? "y" : "ies"}
            {index ? " · index ready" : " · loading index…"}
          </p>
          <Gallery items={filtered} />
        </>
      )}
    </div>
  );
}
