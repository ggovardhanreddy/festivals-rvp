"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import type { Media } from "@/lib/types";
import { ResolvedMediaImage } from "@/components/media/ResolvedMediaImage";
import { mediaDisplayTitle } from "@/lib/media-label";
import { prefetchMedia } from "@/lib/use-media-url";

export function Slideshow({ items }: { items: Media[] }) {
  const reduce = useReducedMotion();
  const slides = items.filter((item) => item.type === "image");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce || slides.length < 2) return;
    const id = window.setInterval(
      () => setIndex((value) => (value + 1) % slides.length),
      4200,
    );
    return () => window.clearInterval(id);
  }, [slides.length, reduce]);

  useEffect(() => {
    if (!slides.length) return;
    const next = slides[(index + 1) % slides.length];
    if (next) prefetchMedia(next.thumb || next.file);
  }, [index, slides]);

  if (!slides.length) return null;
  const current = slides[index]!;
  const label = mediaDisplayTitle(current.title, "Memory");

  return (
    <div className="glass-card" style={{ minHeight: 320 }}>
      <AnimatePresence mode="wait">
        <m.div
          key={current.id}
          initial={reduce ? false : { opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          style={{ minHeight: 320 }}
        >
          <ResolvedMediaImage
            className="card-media"
            src={current.thumb || current.file}
            alt={label}
            style={{ minHeight: 320 }}
          />
        </m.div>
      </AnimatePresence>
      <div className="card-body">
        <p className="eyebrow">Animated slideshow</p>
        <h3>{label}</h3>
      </div>
    </div>
  );
}
