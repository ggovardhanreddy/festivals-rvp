"use client";

import { m, useReducedMotion } from "framer-motion";

export function Reveal({
  children,
  delay = 0,
  className,
  id,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  id?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <m.div
      id={id}
      className={className}
      // Never start at opacity 0 — whileInView can miss on mobile when
      // overflow is locked or IntersectionObserver is delayed after nav.
      initial={reduce ? false : { opacity: 1, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05, margin: "80px 0px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </m.div>
  );
}
