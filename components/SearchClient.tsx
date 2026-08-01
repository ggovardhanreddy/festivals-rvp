"use client";

import { useMemo, useState } from "react";
import { m } from "framer-motion";
import type { MediaWithAlbum } from "@/lib/types";
import { Gallery } from "./Gallery";

export function SearchClient({ items }: { items: MediaWithAlbum[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const hay = [
        item.title,
        item.date,
        item.album.title,
        item.album.category,
        item.album.personName,
        item.album.festival,
        ...(item.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  return (
    <div>
      <m.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <input
          className="search-box"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Sankranthi, Vinayaka Chavithi, birthdays, years…"
          aria-label="Search memories"
        />
      </m.div>
      <p className="muted" style={{ margin: "1rem 0 1.5rem" }}>
        {filtered.length} memor{filtered.length === 1 ? "y" : "ies"}
      </p>
      <Gallery items={filtered} />
    </div>
  );
}
