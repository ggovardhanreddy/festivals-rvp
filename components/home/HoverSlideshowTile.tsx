"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import type { Media } from "@/lib/types";
import { mediaDisplaySrc, prefetchImage } from "@/lib/media-src";
import { useFinePointer, useLowPowerDevice } from "@/lib/client";

const HOVER_INTERVAL_MS = 900;
const TOUCH_INTERVAL_MS = 1400;

export function HoverSlideshowTile({
  cover,
  frames,
  title,
  meta,
  onHoverChange,
  onOpen,
  size = "md",
  autoPlayInView = false,
}: {
  cover: Media;
  frames: Media[];
  title?: string;
  meta?: string;
  onHoverChange?: (hovered: boolean) => void;
  onOpen?: () => void;
  size?: "sm" | "md" | "lg" | "xl";
  /** Mobile: cycle frames when scrolled into view */
  autoPlayInView?: boolean;
}) {
  const reduce = useReducedMotion();
  const lowPower = useLowPowerDevice();
  const finePointer = useFinePointer();
  const rootRef = useRef<HTMLButtonElement>(null);

  const images = useMemo(() => {
    const list = [
      cover,
      ...frames.filter((f) => f.id !== cover.id && f.type === "image"),
    ];
    const max = lowPower ? 5 : 12;
    return list.filter((item) => item.type === "image").slice(0, max);
  }, [cover, frames, lowPower]);

  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!autoPlayInView || finePointer || !rootRef.current) return;
    const el = rootRef.current;
    const io = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [autoPlayInView, finePointer]);

  const playing =
    !reduce &&
    images.length > 1 &&
    (active || (autoPlayInView && !finePointer && inView));

  useEffect(() => {
    if (!playing) return;
    const ms = finePointer ? HOVER_INTERVAL_MS : TOUCH_INTERVAL_MS;
    const id = window.setInterval(
      () => setIndex((value) => (value + 1) % images.length),
      ms,
    );
    return () => window.clearInterval(id);
  }, [playing, images.length, finePointer]);

  useEffect(() => {
    if (!playing) return;
    const next = images[(index + 1) % images.length];
    if (next) prefetchImage(mediaDisplaySrc(next));
  }, [playing, index, images]);

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

  const onClick = () => {
    onOpen?.();
  };

  return (
    <button
      ref={rootRef}
      type="button"
      className={`hover-slide-tile hover-slide-tile--${size}${playing ? " is-active" : ""}`}
      onMouseEnter={finePointer ? start : undefined}
      onMouseLeave={finePointer ? stop : undefined}
      onFocus={finePointer ? start : undefined}
      onBlur={finePointer ? stop : undefined}
      onClick={onClick}
      aria-label={title || cover.title || "Open memory"}
    >
      <div className="hover-slide-tile-media">
        <AnimatePresence mode="popLayout" initial={false}>
          <m.img
            key={current.id}
            src={mediaDisplaySrc(current)}
            alt={current.title || title || "Memory"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: lowPower ? 0.25 : 0.35 }}
            draggable={false}
            loading={index === 0 ? "eager" : "lazy"}
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
