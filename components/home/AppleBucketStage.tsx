"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { Album, Media, MediaWithAlbum } from "@/lib/types";
import { albumHref, type BucketKey } from "@/lib/site";
import { withBase } from "@/lib/base";
import { AutoMemorySlideshow } from "./AutoMemorySlideshow";
import { HoverSlideshowTile } from "./HoverSlideshowTile";

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
        <div className="apple-chapter-head">
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p className="lede apple-chapter-lede">{blurb}</p>
        </div>
        {slideshowItems.length ? (
          <AutoMemorySlideshow items={slideshowItems} paused={tileHovered} />
        ) : heroImage ? (
          <div className="apple-slideshow apple-slideshow--static">
            <img
              src={withBase(heroImage)}
              alt={title}
              className="apple-slideshow-img"
            />
            <div className="apple-slideshow-veil" aria-hidden />
            <div className="apple-slideshow-caption">
              <p className="eyebrow">{eyebrow}</p>
              <h2 className="apple-slideshow-title">{title}</h2>
            </div>
          </div>
        ) : null}
      </section>

      <section className="apple-chapter apple-chapter--gather" aria-label="Story">
        <div className="apple-chapter-head">
          <p className="eyebrow">Festival Story</p>
          <h2>Why this chapter matters</h2>
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
                  <img
                    src={withBase(album.cover)}
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
                    {album.year} · {album.category}
                  </p>
                  <h3>{album.title}</h3>
                </div>
              </Link>
            </m.div>
          ))}
        </div>
      </section>

      {!!years.length && (
        <section className="apple-chapter apple-chapter--years" aria-label="Years">
          <div className="apple-chapter-head apple-chapter-head--row">
            <div>
              <p className="eyebrow">Seasons</p>
              <h2>Browse the years</h2>
            </div>
            <Link className="btn ghost" href="/timeline/">
              Timeline
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
          aria-label="Frames"
        >
          <div className="apple-chapter-head">
            <p className="eyebrow">Frames</p>
            <h2>Move over a memory</h2>
            <p className="lede apple-chapter-lede">
              Hover an image to start its slideshow. Click to open the album.
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
