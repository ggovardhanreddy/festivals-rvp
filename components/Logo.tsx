"use client";

import { m, useReducedMotion } from "framer-motion";
import { withBase } from "@/lib/base";

export function Logo({
  className = "",
  markOnly = false,
  animated = true,
}: {
  className?: string;
  markOnly?: boolean;
  animated?: boolean;
}) {
  const reduce = useReducedMotion();
  const src = withBase(
    markOnly ? "/brand/rvp-youth-mark.svg" : "/brand/rvp-youth-logo.svg",
  );

  return (
    <m.img
      className={`brand-logo ${className}`.trim()}
      src={src}
      alt="RVP Youth"
      width={markOnly ? 40 : 160}
      height={markOnly ? 40 : 46}
      draggable={false}
      initial={animated && !reduce ? { opacity: 0, y: -8, filter: "blur(6px)" } : false}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}
