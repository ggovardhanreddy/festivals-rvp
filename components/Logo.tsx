"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { m, useReducedMotion } from "framer-motion";
import gsap from "gsap";
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
  const { resolvedTheme } = useTheme();
  const ref = useRef<HTMLImageElement>(null);
  const dark = resolvedTheme === "dark";

  const src = withBase(
    markOnly
      ? "/brand/rvp-youth-mark.svg"
      : dark
        ? "/brand/rvp-youth-logo-dark.svg"
        : "/brand/rvp-youth-logo-light.svg",
  );

  useEffect(() => {
    if (!animated || reduce || !ref.current) return;
    const tween = gsap.fromTo(
      ref.current,
      { opacity: 0, y: -10, filter: "blur(8px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.85,
        ease: "power3.out",
      },
    );
    return () => {
      tween.kill();
    };
  }, [animated, reduce, src]);

  return (
    <m.img
      ref={ref}
      className={`brand-logo ${className}`.trim()}
      src={src}
      alt="RVP Youth"
      width={markOnly ? 40 : 160}
      height={markOnly ? 40 : 46}
      draggable={false}
    />
  );
}
