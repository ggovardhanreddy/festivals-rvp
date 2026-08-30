"use client";

import Link from "next/link";
import { MediaImage } from "@/components/media/MediaImage";
import type { MediaWithAlbum } from "@/lib/types";

/**
 * Six recent photographs. No category chips, no year chips, no media-type
 * switches — the gallery owns all of that, and duplicating it here made the
 * homepage load the archive twice over.
 */
export function LatestMemories({ items }: { items: MediaWithAlbum[] }) {
  if (!items.length) return null;

  return (
    <section className="section home-memories" aria-labelledby="home-memories-heading">
      <div className="home-section-head">
        <div>
          <p className="eyebrow">Gallery</p>
          <h2 id="home-memories-heading">Latest Memories</h2>
          <p className="home-panel-lede">
            The most recent photographs added to the village archive.
          </p>
        </div>
        <Link className="btn ghost" href="/gallery/">
          View Gallery <span aria-hidden>→</span>
        </Link>
      </div>

      <ul className="home-memory-grid">
        {items.map((item, index) => (
          <li key={item.id}>
            <Link className="home-memory-tile" href="/gallery/">
              <MediaImage
                src={item.thumb || item.file}
                alt={`${item.album.title || "Village memory"} — ${item.album.year}`}
                loading={index < 2 ? "eager" : "lazy"}
                width={item.width || undefined}
                height={item.height || undefined}
              />
              <span className="home-memory-meta">
                <span>{item.album.title}</span>
                <span className="muted">{item.album.year}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
