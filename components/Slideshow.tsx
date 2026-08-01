"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import type { Media } from "@/lib/types";
import { withBase } from "@/lib/base";

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

  if (!slides.length) return null;
  const current = slides[index]!;

  return (
    <div className="glass-card" style={{ minHeight: 320 }}>
      <AnimatePresence mode="wait">
        <m.img
          key={current.id}
          className="card-media"
          src={withBase(current.file)}
          alt={current.title}
          initial={reduce ? false : { opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          style={{ minHeight: 320 }}
        />
      </AnimatePresence>
      <div className="card-body">
        <p className="eyebrow">Animated slideshow</p>
        <h3>{current.title}</h3>
      </div>
    </div>
  );
}
