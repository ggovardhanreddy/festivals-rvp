"use client";

import Link from "next/link";
import {
  m,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
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
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-40, 40], [8, -8]), {
    stiffness: 120,
    damping: 16,
  });
  const ry = useSpring(useTransform(x, [-40, 40], [-10, 10]), {
    stiffness: 120,
    damping: 16,
  });

  return (
    <m.div
      className="card-3d"
      initial={reduce ? false : { opacity: 0, y: 22, rotateX: 6 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.55 }}
      style={
        reduce ? undefined : { rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }
      }
      onMouseMove={(event) => {
        if (reduce) return;
        const rect = event.currentTarget.getBoundingClientRect();
        x.set(event.clientX - rect.left - rect.width / 2);
        y.set(event.clientY - rect.top - rect.height / 2);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      <Link
        className="glass-card card-lift"
        href={albumHref(album)}
        style={{ display: "block" }}
      >
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
