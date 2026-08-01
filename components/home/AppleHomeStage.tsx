"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Album, Media, MediaWithAlbum } from "@/lib/types";
import { albumHref } from "@/lib/site";
import { AutoMemorySlideshow } from "./AutoMemorySlideshow";
import { FloatingTileField } from "./FloatingTileField";
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

export function AppleHomeStage({
  featuredAlbums,
  media,
  galleryTeaser,
}: {
  featuredAlbums: Album[];
  media: MediaWithAlbum[];
  galleryTeaser: MediaWithAlbum[];
}) {
  const router = useRouter();
  const [tileHovered, setTileHovered] = useState(false);

  const pool = useMemo(
    () => media.filter((m) => m.type === "image").slice(0, 48),
    [media],
  );

  const slideshowItems = useMemo(() => {
    const favorites = pool.filter((m) => m.favorite);
    return (favorites.length ? favorites : pool).slice(0, 8);
  }, [pool]);

  const frameTiles = useMemo(
    () => galleryTeaser.filter((m) => m.type === "image").slice(0, 6),
    [galleryTeaser],
  );

  return (
    <div className="apple-stage">
      <section className="apple-chapter apple-chapter--memories" aria-label="Memories slideshow">
        <div className="apple-chapter-head">
          <p className="eyebrow">Fullscreen</p>
          <h2>Every moment, kept alive</h2>
          <p className="lede apple-chapter-lede">
            A living reel from Kondreddigaripalli — hover any frame below to watch it unfold.
          </p>
        </div>
        <AutoMemorySlideshow items={slideshowItems} paused={tileHovered} />
      </section>

      <section className="apple-chapter apple-chapter--gather" id="festivals" aria-label="Where we gather">
        <div className="apple-chapter-head">
          <p className="eyebrow">Gather</p>
          <h2>Where we gather</h2>
          <p className="lede apple-chapter-lede">
            Festivals, birthdays, and journeys — floating doorways into the archive.
          </p>
        </div>
        <FloatingTileField albums={featuredAlbums} onHoverChange={setTileHovered} />
      </section>

      <section className="apple-chapter apple-chapter--frames" aria-label="Frames from home">
        <div className="apple-chapter-head apple-chapter-head--row">
          <div>
            <p className="eyebrow">Frames</p>
            <h2>Move over a memory</h2>
            <p className="lede apple-chapter-lede">
              Hover an image to start its slideshow. Click to open it larger.
            </p>
          </div>
          <Link className="btn ghost" href="/search/">
            Search memories
          </Link>
        </div>

        <div className="apple-frames-bento">
          {frameTiles.map((item, index) => {
            const size =
              index === 0 || index === 3 ? "xl" : index % 3 === 0 ? "lg" : index % 2 === 0 ? "md" : "sm";
            return (
              <HoverSlideshowTile
                key={item.id}
                cover={item}
                frames={relatedFrames(item, pool)}
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
    </div>
  );
}
