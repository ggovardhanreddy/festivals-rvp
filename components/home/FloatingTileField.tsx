"use client";

import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";
import type { Album } from "@/lib/types";
import { BUCKETS, FESTIVAL_HEROES, albumHref } from "@/lib/site";
import { MediaImage } from "@/components/media/MediaImage";

export function FloatingTileField({
  albums,
  onHoverChange,
}: {
  albums: Album[];
  onHoverChange?: (hovered: boolean) => void;
}) {
  const reduce = useReducedMotion();
  const featured = albums.slice(0, 3);

  return (
    <div className="float-field" onMouseLeave={() => onHoverChange?.(false)}>
      {BUCKETS.filter((bucket) =>
        albums.some((a) => a.bucket === bucket.key && (a.media?.length ?? 0) > 0),
      ).map((bucket, index) => {
        const hero =
          FESTIVAL_HEROES[bucket.key] ||
          albums.find((a) => a.bucket === bucket.key && a.cover)?.cover ||
          featured[index % Math.max(featured.length, 1)]?.cover ||
          "/brand/og-banner.jpg";
        const size =
          bucket.key === "sankranthi" ||
          bucket.key === "vinayaka-chavithi" ||
          bucket.key === "mathamma-jathara"
            ? "lg"
            : "md";

        return (
          <m.div
            key={bucket.key}
            className={`float-tile float-tile--${size} float-tile--bucket-${bucket.key}`}
            initial={reduce ? false : { opacity: 0, y: 36 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8% 0px" }}
            transition={{ delay: index * 0.07, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={() => onHoverChange?.(true)}
          >
            <Link href={bucket.href} className="float-tile-link">
              <MediaImage
                src={hero}
                alt=""
                className="float-tile-bg"
                loading="lazy"
                draggable={false}
              />
              <div className="float-tile-shade" />
              <div className="float-tile-copy">
                <p className="eyebrow">{bucket.eyebrow}</p>
                <h3>{bucket.title}</h3>
                <p className="float-tile-blurb">{bucket.blurb}</p>
              </div>
            </Link>
          </m.div>
        );
      })}

      {featured.map((album, index) => (
        <m.div
          key={`${album.year}-${album.slug}`}
          className={`float-tile float-tile--album float-tile--album-${index}`}
          initial={reduce ? false : { opacity: 0, y: 28 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-8% 0px" }}
          transition={{
            delay: 0.28 + index * 0.08,
            duration: 0.65,
            ease: [0.22, 1, 0.36, 1],
          }}
          onMouseEnter={() => onHoverChange?.(true)}
        >
          <Link href={albumHref(album)} className="float-tile-link">
            {album.cover ? (
              <MediaImage
                src={album.cover}
                alt=""
                className="float-tile-bg"
                loading="lazy"
                draggable={false}
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
  );
}
