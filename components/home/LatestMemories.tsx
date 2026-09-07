"use client";

import Link from "next/link";
import { MediaImage } from "@/components/media/MediaImage";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { StaggerChildren, StaggerItem } from "@/components/motion";
import { BUCKET_TITLE_TE } from "@/lib/site";
import type { Album, MediaWithAlbum } from "@/lib/types";

/**
 * Album titles already carry their year ("Devapatlamma Jathara 2026"), so
 * appending album.year produced "Devapatlamma Jathara 2026 · 2026" on every
 * tile and in every alt attribute.
 */
function albumLabel(
  album: Pick<Album, "title" | "year" | "bucket">,
  lang: string,
): string {
  const te = lang === "te" && album.bucket ? BUCKET_TITLE_TE[album.bucket] : null;
  const title = (te || album.title || "Village memories").trim();
  return title.endsWith(album.year) ? title : `${title} \u00b7 ${album.year}`;
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
  const { t, lang } = useUiLang();
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
                  album: albumLabel(single, lang),
                })
              : t("home.memories.lede")}
          </p>
        </div>
        <Link className="btn ghost" href="/gallery/">
          {t("home.viewGallery")} <span aria-hidden>→</span>
        </Link>
      </div>

      <StaggerChildren
        as="ul"
        className="home-memory-grid"
        // The grid's own layout hooks: dropping these would collapse the
        // single-photo and three-up variants into the default.
        dataset={{
          "data-single": single ? true : undefined,
          "data-count": Math.min(items.length, 3),
        }}
        safe
      >
        {items.map((item, index) => (
          <StaggerItem as="li" key={item.id}>
            <Link className="home-memory-tile" href="/gallery/">
              <MediaImage
                src={item.thumb || item.file}
                // Distinct per tile: six identical alt strings read as six
                // identical links to anyone using a screen reader.
                alt={t("home.memories.photoAlt", undefined, {
                  n: index + 1,
                  total: items.length,
                  album: albumLabel(item.album, lang),
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
          </StaggerItem>
        ))}
      </StaggerChildren>
    </section>
  );
}
