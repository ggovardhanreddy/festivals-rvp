"use client";

import { useMemo } from "react";
import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";
import type { MediaWithAlbum } from "@/lib/types";
import { VILLAGE_QUOTES } from "@/lib/village";
import { albumHref } from "@/lib/site";
import { withBase } from "@/lib/base";
import { Reveal } from "./Reveal";

function pickWallItems(items: MediaWithAlbum[], count: number) {
  const favorites = items.filter((m) => m.type === "image" && m.favorite);
  const images = items.filter((m) => m.type === "image");
  const pool = favorites.length ? favorites : images;
  // Deterministic rotation for SSR/hydration safety
  const step = Math.max(1, Math.floor(pool.length / count) || 1);
  const picked: MediaWithAlbum[] = [];
  for (let i = 0; i < pool.length && picked.length < count; i += step) {
    picked.push(pool[i]!);
  }
  return picked;
}

export function MemoryWall({ items }: { items: MediaWithAlbum[] }) {
  const reduce = useReducedMotion();
  const cards = useMemo(() => pickWallItems(items, 6), [items]);
  const quote = VILLAGE_QUOTES[cards.length % VILLAGE_QUOTES.length]!;

  if (!cards.length) {
    return (
      <Reveal className="section">
        <p className="eyebrow">Memory Wall</p>
        <h2>Stories waiting to gather</h2>
        <p className="muted">Import photos to begin building the wall.</p>
      </Reveal>
    );
  }

  return (
    <Reveal className="section">
      <div className="section-head">
        <div>
          <p className="eyebrow">Memory Wall</p>
          <h2>Fragments that still glow</h2>
          <p className="lede quote-line">&ldquo;{quote}&rdquo;</p>
        </div>
      </div>
      <div className="memory-wall">
        {cards.map((item, index) => (
          <m.article
            key={item.id}
            className="memory-card"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: Math.min(index * 0.05, 0.3) }}
          >
            <Link href={albumHref(item.album)}>
              <img
                src={withBase(item.thumb || item.file)}
                alt={item.title}
                loading="lazy"
                draggable={false}
              />
              <div className="memory-card-copy">
                <p className="eyebrow">
                  {item.album.year} · {item.album.bucket}
                </p>
                <h3>{item.title}</h3>
                <p className="muted">{item.album.title}</p>
              </div>
            </Link>
          </m.article>
        ))}
      </div>
    </Reveal>
  );
}
