"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import type { Media } from "@/lib/types";
import { withBase } from "@/lib/base";

const INTERVAL_MS = 4200;

export function AutoMemorySlideshow({
  items,
  paused = false,
}: {
  items: Media[];
  paused?: boolean;
}) {
  const reduce = useReducedMotion();
  const slides = items.filter((item) => item.type === "image");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce || paused || slides.length < 2) return;
    const id = window.setInterval(
      () => setIndex((value) => (value + 1) % slides.length),
      INTERVAL_MS,
    );
    return () => window.clearInterval(id);
  }, [slides.length, reduce, paused]);

  if (!slides.length) return null;
  const current = slides[index]!;
  const yearHint = current.date?.slice(0, 4);

  return (
    <div className="apple-slideshow" aria-roledescription="carousel" aria-live="polite">
      <AnimatePresence mode="sync">
        <m.div
          key={current.id}
          className="apple-slideshow-slide"
          initial={reduce ? false : { opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: reduce ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src={withBase(current.file)}
            alt={current.title || "Memory"}
            className="apple-slideshow-img"
            draggable={false}
          />
        </m.div>
      </AnimatePresence>

      <div className="apple-slideshow-veil" aria-hidden />

      <div className="apple-slideshow-caption">
        <p className="eyebrow">Memories</p>
        <h2 className="apple-slideshow-title">{current.title || "From home"}</h2>
        {yearHint ? <p className="apple-slideshow-meta">{yearHint}</p> : null}
      </div>

      {slides.length > 1 && slides.length <= 12 ? (
        <div className="apple-slideshow-dots" aria-hidden>
          {slides.map((slide, i) => (
            <span
              key={slide.id}
              className={`apple-slideshow-dot${i === index ? " is-active" : ""}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
