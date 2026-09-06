"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Album, Media, MediaWithAlbum } from "@/lib/types";
import { albumHref } from "@/lib/site";
import { useLowPowerDevice } from "@/lib/client";
import { AutoMemorySlideshow } from "./AutoMemorySlideshow";
import { FloatingTileField } from "./FloatingTileField";
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

export function AppleHomeStage({
  featuredAlbums,
  media,
  galleryTeaser,
}: {
  featuredAlbums: Album[];
  media: MediaWithAlbum[];
  galleryTeaser: MediaWithAlbum[];
}) {
  const { t } = useUiLang();
  const router = useRouter();
  const lowPower = useLowPowerDevice();
  const [tileHovered, setTileHovered] = useState(false);

  const pool = useMemo(
    () => media.filter((m) => m.type === "image").slice(0, lowPower ? 20 : 48),
    [media, lowPower],
  );

  const slideshowItems = useMemo(() => {
    const favorites = pool.filter((m) => m.favorite);
    return (favorites.length ? favorites : pool).slice(0, lowPower ? 4 : 8);
  }, [pool, lowPower]);

  const frameTiles = useMemo(
    () =>
      galleryTeaser
        .filter((m) => m.type === "image")
        .slice(0, lowPower ? 3 : 6),
    [galleryTeaser, lowPower],
  );

  return (
    <div className="apple-stage">
      <section
        className="apple-chapter apple-chapter--memories"
        aria-label={t("home.memoriesSlideshow")}
      >
        <div className="apple-chapter-head">
          <p className="eyebrow">{t("home.fullscreen")}</p>
          <h2>{t("home.everyMoment")}</h2>
          <p className="lede apple-chapter-lede">
            {lowPower
              ? "A living reel from Kondreddigaripalli — frames advance as you scroll."
              : "A living reel from Kondreddigaripalli — hover any frame below to watch it unfold."}
          </p>
        </div>
        <AutoMemorySlideshow items={slideshowItems} paused={tileHovered} />
      </section>

      <section
        className="apple-chapter apple-chapter--gather"
        id="festivals"
        aria-label={t("home.whereWeGather")}
      >
        <div className="apple-chapter-head">
          <p className="eyebrow">{t("home.gather")}</p>
          <h2>{t("home.whereWeGather")}</h2>
          <p className="lede apple-chapter-lede">
            {t("home.festivalsJourneys")}
          </p>
        </div>
        <FloatingTileField
          albums={featuredAlbums}
          onHoverChange={setTileHovered}
        />
      </section>

      <section
        className="apple-chapter apple-chapter--frames"
        aria-label={t("home.framesFromHome")}
      >
        <div className="apple-chapter-head apple-chapter-head--row">
          <div>
            <p className="eyebrow">{t("home.frames")}</p>
            <h2>{lowPower ? "Tap a memory" : "Move over a memory"}</h2>
            <p className="lede apple-chapter-lede">
              {lowPower
                ? "Frames play when you scroll to them. Tap any frame to open the album."
                : "Hover an image to start its slideshow. Click to open it larger."}
            </p>
          </div>
          <Link className="btn ghost" href="/search/">
            {t("home.searchMemories")}
          </Link>
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
                key={`${item.id}-${item.file}`}
                cover={item}
                frames={relatedFrames(item, pool)}
                title={item.title}
                meta={`${item.album.year} · ${item.album.title}`}
                size={size}
                autoPlayInView={lowPower}
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
