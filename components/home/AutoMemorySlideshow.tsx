"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import type { Media } from "@/lib/types";
import { ResolvedMediaImage } from "@/components/media/ResolvedMediaImage";
import { mediaDisplayTitle } from "@/lib/media-label";
import { prefetchMedia } from "@/lib/use-media-url";
import { useLowPowerDevice } from "@/lib/client";

export function AutoMemorySlideshow({
  items,
  paused = false,
  eyebrow = "Memories",
}: {
  items: Media[];
  paused?: boolean;
  eyebrow?: string;
}) {
  const reduce = useReducedMotion();
  const lowPower = useLowPowerDevice();
  const maxSlides = lowPower ? 4 : 8;
  const intervalMs = lowPower ? 3200 : 4200;

  const slides = useMemo(
    () => items.filter((item) => item.type === "image").slice(0, maxSlides),
    [items, maxSlides],
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (reduce || paused || slides.length < 2) return;
    const id = window.setInterval(
      () => setIndex((value) => (value + 1) % slides.length),
      intervalMs,
    );
    return () => window.clearInterval(id);
  }, [slides.length, reduce, paused, intervalMs]);

  useEffect(() => {
    if (!slides.length) return;
    const next = slides[(index + 1) % slides.length];
    if (next) prefetchMedia(next.thumb || next.file);
  }, [index, slides]);

  if (!slides.length) return null;
  const current = slides[index]!;
  const yearHint = current.date?.slice(0, 4);
  const lightMotion = Boolean(reduce || lowPower);
  const label = mediaDisplayTitle(current.title, "From home");

  return (
    <div
      className={`apple-slideshow${lightMotion ? " apple-slideshow--lite" : ""}`}
      aria-roledescription="carousel"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <m.div
          key={current.id}
          className="apple-slideshow-slide"
          initial={lightMotion ? { opacity: 0 } : { opacity: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: lightMotion ? 0.35 : 0.65, ease: "easeOut" }}
        >
          <ResolvedMediaImage
            src={current.thumb || current.file}
            alt={label}
            className="apple-slideshow-img"
            draggable={false}
            fetchPriority={index === 0 ? "high" : "auto"}
          />
        </m.div>
      </AnimatePresence>

      <div className="apple-slideshow-veil" aria-hidden />

      <div className="apple-slideshow-caption">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="apple-slideshow-title">{label}</h2>
        {yearHint ? <p className="apple-slideshow-meta">{yearHint}</p> : null}
      </div>

      {slides.length > 1 ? (
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
