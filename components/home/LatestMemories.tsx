"use client";

import Link from "next/link";
import { MediaImage } from "@/components/media/MediaImage";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import type { Album, MediaWithAlbum } from "@/lib/types";

/**
 * Album titles already carry their year ("Devapatlamma Jathara 2026"), so
 * appending album.year produced "Devapatlamma Jathara 2026 · 2026" on every
 * tile and in every alt attribute.
 */
function albumLabel(album: Pick<Album, "title" | "year">): string {
  const title = (album.title || "Village memories").trim();
  return title.endsWith(album.year) ? title : `${title} · ${album.year}`;
}

/**
 * Six recent photographs. No category chips, no year chips, no media-type
 * switches — the gallery owns all of that, and duplicating it here made the
 * homepage load the archive twice over.
 *
 * When the six newest photographs come from one event, which is the normal
 * case just after a festival, the album is named once above the grid and the
 * tiles carry no caption. Six cards each repeating the same event name is a
 * list of six things; a grid of six photographs from one afternoon is what it
 * actually is.
 */
export function LatestMemories({ items }: { items: MediaWithAlbum[] }) {
  const { t } = useUiLang();
  if (!items.length) return null;

  const albums = new Set(items.map((i) => `${i.album.slug}/${i.album.year}`));
  const single = albums.size === 1 ? items[0]!.album : null;

  return (
    <section className="section home-memories" aria-labelledby="home-memories-heading">
      <div className="home-section-head">
        <div>
          <p className="eyebrow">{t("home.eyebrow.gallery")}</p>
          <h2 id="home-memories-heading">{t("home.latestMemories")}</h2>
          <p className="home-panel-lede">
            {single
              ? t("home.memories.ledeAlbum", undefined, {
                  album: albumLabel(single),
                })
              : t("home.memories.lede")}
          </p>
        </div>
        <Link className="btn ghost" href="/gallery/">
          {t("home.viewGallery")} <span aria-hidden>→</span>
        </Link>
      </div>

      <ul
        className="home-memory-grid"
        data-single={single ? true : undefined}
        data-count={Math.min(items.length, 3)}
      >
        {items.map((item, index) => (
          <li key={item.id}>
            <Link className="home-memory-tile" href="/gallery/">
              <MediaImage
                src={item.thumb || item.file}
                // Distinct per tile: six identical alt strings read as six
                // identical links to anyone using a screen reader.
                alt={t("home.memories.photoAlt", undefined, {
                  n: index + 1,
                  total: items.length,
                  album: albumLabel(item.album),
                })}
                loading="lazy"
                decoding="async"
              />
              {single ? null : (
                <span className="home-memory-meta">
                  <span>{item.album.title}</span>
                  <span className="muted">{item.album.year}</span>
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
