"use client";

import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";
import type { Album } from "@/lib/types";
import { albumHref } from "@/lib/site";
import { withBase } from "@/lib/base";

export function AlbumCard({
  album,
  index = 0,
  meta,
}: {
  album: Album;
  index?: number;
  meta?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <m.div
      initial={reduce ? false : { opacity: 0, y: 22 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.5 }}
    >
      <Link className="glass-card" href={albumHref(album)} style={{ display: "block" }}>
        {album.cover ? (
          <img
            className="card-media"
            src={withBase(album.cover)}
            alt={album.title}
            loading="lazy"
          />
        ) : (
          <div className="card-media skeleton" />
        )}
        <div className="card-body">
          <p className="eyebrow">{meta || `${album.year} · ${album.category}`}</p>
          <h3>{album.title}</h3>
          <p className="muted">{album.description}</p>
        </div>
      </Link>
    </m.div>
  );
}
