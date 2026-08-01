"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import type { Media } from "@/lib/types";
import { mediaDisplaySrc } from "@/lib/media-src";

const HOVER_INTERVAL_MS = 900;

export function HoverSlideshowTile({
  cover,
  frames,
  title,
  meta,
  onHoverChange,
  onOpen,
  size = "md",
}: {
  cover: Media;
  frames: Media[];
  title?: string;
  meta?: string;
  onHoverChange?: (hovered: boolean) => void;
  onOpen?: () => void;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const reduce = useReducedMotion();
  const images = useMemo(() => {
    const list = [cover, ...frames.filter((f) => f.id !== cover.id && f.type === "image")];
    return list.filter((item) => item.type === "image").slice(0, 12);
  }, [cover, frames]);

  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active || reduce || images.length < 2) return;
    const id = window.setInterval(
      () => setIndex((value) => (value + 1) % images.length),
      HOVER_INTERVAL_MS,
    );
    return () => window.clearInterval(id);
  }, [active, reduce, images.length]);

  const current = images[index] ?? cover;

  const start = () => {
    setActive(true);
    onHoverChange?.(true);
  };

  const stop = () => {
    setActive(false);
    setIndex(0);
    onHoverChange?.(false);
  };

  return (
    <button
      type="button"
      className={`hover-slide-tile hover-slide-tile--${size}${active ? " is-active" : ""}`}
      onMouseEnter={start}
      onMouseLeave={stop}
      onFocus={start}
      onBlur={stop}
      onClick={() => onOpen?.()}
      aria-label={title || cover.title || "Open memory"}
    >
      <div className="hover-slide-tile-media">
        <AnimatePresence mode="sync">
          <m.img
            key={current.id}
            src={mediaDisplaySrc(current)}
            alt={current.title || title || "Memory"}
            initial={reduce || !active ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce || !active ? undefined : { opacity: 0 }}
            transition={{ duration: 0.35 }}
            draggable={false}
            loading="lazy"
            decoding="async"
          />
        </AnimatePresence>
      </div>
      {(title || meta) && (
        <div className="hover-slide-tile-caption">
          {meta ? <p className="eyebrow">{meta}</p> : null}
          {title ? <h3>{title}</h3> : null}
        </div>
      )}
    </button>
  );
}
