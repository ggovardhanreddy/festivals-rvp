"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { Album, Media, MediaWithAlbum } from "@/lib/types";
import { albumHref, type BucketKey } from "@/lib/site";
import { MediaImage } from "@/components/media/MediaImage";
import { AutoMemorySlideshow } from "./AutoMemorySlideshow";
import { HoverSlideshowTile } from "./HoverSlideshowTile";
import { useUiLang } from "@/components/i18n/LanguageProvider";

function relatedFrames(item: MediaWithAlbum, pool: MediaWithAlbum[]): Media[] {
  const sameAlbum = pool.filter(
    (m) =>
      m.type === "image" &&
      m.album.year === item.album.year &&
      m.album.slug === item.album.slug,
  );
  if (sameAlbum.length >= 2) return sameAlbum;
  return pool.filter((m) => m.type === "image").slice(0, 10);
}

export function AppleBucketStage({
  bucket,
  title,
  eyebrow,
  blurb,
  story,
  albums,
  heroImage,
}: {
  bucket: BucketKey;
  title: string;
  eyebrow: string;
  blurb: string;
  story: string;
  albums: Album[];
  heroImage?: string;
}) {
  const { t } = useUiLang();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [tileHovered, setTileHovered] = useState(false);

  const media = useMemo<MediaWithAlbum[]>(
    () =>
      albums.flatMap((album) =>
        album.media.map((item) => ({ ...item, album })),
      ),
    [albums],
  );

  const slideshowItems = useMemo(() => {
    const favorites = media.filter((m) => m.type === "image" && m.favorite);
    const images = (
      favorites.length ? favorites : media.filter((m) => m.type === "image")
    ).slice(0, 18);
    return images;
  }, [media]);

  const frameTiles = useMemo(
    () => media.filter((m) => m.type === "image").slice(0, 10),
    [media],
  );

  const years = useMemo(
    () => [...new Set(albums.map((a) => a.year))].sort((a, b) => b.localeCompare(a)),
    [albums],
  );

  return (
    <div className={`apple-stage apple-stage--bucket apple-stage--${bucket}`}>
      <section
        className="apple-chapter apple-chapter--memories"
        aria-label={`${title} memories`}
      >
        {heroImage ? (
          <div className="apple-festival-hero">
            <MediaImage
              src={heroImage}
              alt=""
              className="apple-festival-hero-img"
              fetchPriority="high"
            />
            <div className="apple-festival-hero-veil" aria-hidden />
            <div className="apple-festival-hero-copy">
              <p className="eyebrow">{eyebrow}</p>
              <h1 className="apple-festival-hero-title">{title}</h1>
              <p className="lede apple-chapter-lede">{blurb}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="apple-chapter-head">
              <p className="eyebrow">{eyebrow}</p>
              <h2>{title}</h2>
              <p className="lede apple-chapter-lede">{blurb}</p>
            </div>
            {slideshowItems.length ? (
              <AutoMemorySlideshow
                items={slideshowItems}
                paused={tileHovered}
                eyebrow={eyebrow}
              />
            ) : null}
          </>
        )}
      </section>

      <section className="apple-chapter apple-chapter--gather" aria-label={t("home.story")}>
        <div className="apple-chapter-head">
          <p className="eyebrow">{t("home.festivalStory")}</p>
          <h2>{t("home.whyChapter")}</h2>
          <p className="lede apple-chapter-lede">{story}</p>
        </div>

        <div className="float-field float-field--albums">
          {albums.slice(0, 6).map((album, index) => (
            <m.div
              key={`${album.year}-${album.slug}`}
              className={`float-tile float-tile--album-card float-tile--slot-${index}`}
              initial={reduce ? false : { opacity: 0, y: 28 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ delay: index * 0.06, duration: 0.65 }}
              onMouseEnter={() => setTileHovered(true)}
              onMouseLeave={() => setTileHovered(false)}
            >
              <Link href={albumHref(album)} className="float-tile-link">
                {album.cover ? (
                  <MediaImage
                    src={album.cover}
                    alt=""
                    className="float-tile-bg"
                    loading="lazy"
                  />
                ) : (
                  <div className="float-tile-bg float-tile-bg--empty" />
                )}
                <div className="float-tile-shade" />
                <div className="float-tile-copy">
                  <p className="eyebrow">
                    {album.year} · {album.media?.length ?? 0} items
                  </p>
                  <h3>{album.title}</h3>
                </div>
              </Link>
            </m.div>
          ))}
        </div>
      </section>

      {!!years.length && (
        <section className="apple-chapter apple-chapter--years" aria-label={t("home.years")}>
          <div className="apple-chapter-head apple-chapter-head--row">
            <div>
              <p className="eyebrow">{t("home.seasons")}</p>
              <h2>{t("home.browseYears")}</h2>
            </div>
            <Link className="btn ghost" href="/years/">
              {t("home.years")}
            </Link>
          </div>
          <div className="apple-year-tiles">
            {years.map((year) => (
              <Link
                key={year}
                href={`/${bucket}/${year}/`}
                className="apple-year-tile magnetic"
                onMouseEnter={() => setTileHovered(true)}
                onMouseLeave={() => setTileHovered(false)}
              >
                <span className="apple-year-tile-label">{year}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!!frameTiles.length && (
        <section
          className="apple-chapter apple-chapter--frames"
          id="gallery"
          aria-label={t("home.frames")}
        >
          <div className="apple-chapter-head">
            <p className="eyebrow">{t("home.frames")}</p>
            <h2>{t("home.moveOverMemory")}</h2>
            <p className="lede apple-chapter-lede">
              {t("home.hoverHint")}
            </p>
          </div>
          <div className="apple-frames-bento">
            {frameTiles.map((item, index) => {
              const size =
                index === 0 || index === 3
                  ? "xl"
                  : index % 3 === 0
                    ? "lg"
                    : index % 2 === 0
                      ? "md"
                      : "sm";
              return (
                <HoverSlideshowTile
                  key={item.id}
                  cover={item}
                  frames={relatedFrames(item, media)}
                  title={item.title}
                  meta={`${item.album.year} · ${item.album.title}`}
                  size={size}
                  onHoverChange={setTileHovered}
                  onOpen={() => router.push(albumHref(item.album))}
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
