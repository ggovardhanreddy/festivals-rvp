"use client";

import { m, useReducedMotion } from "framer-motion";
import { DIST, DUR, EASE, VIEWPORT_SAFE } from "@/components/motion/tokens";

export function Reveal({
  children,
  delay = 0,
  className,
  id,
  "aria-labelledby": ariaLabelledBy,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  id?: string;
  "aria-labelledby"?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <m.div
      id={id}
      className={className}
      aria-labelledby={ariaLabelledBy}
      // Never start at opacity 0 — whileInView can miss on mobile when
      // overflow is locked or IntersectionObserver is delayed after nav.
      initial={reduce ? false : { opacity: 1, y: DIST.near }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT_SAFE}
      transition={{ duration: DUR.reveal, delay, ease: EASE }}
    >
      {children}
    </m.div>
  );
}
