"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { m, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { withBase } from "@/lib/base";

type LogoVariant =
  | "auto"
  | "glass"
  | "light"
  | "dark"
  | "gold"
  | "white"
  | "black"
  | "mark"
  | "loading";

export function Logo({
  className = "",
  markOnly = false,
  animated = true,
  variant = "auto",
}: {
  className?: string;
  markOnly?: boolean;
  animated?: boolean;
  variant?: LogoVariant;
}) {
  const reduce = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const ref = useRef<HTMLImageElement>(null);
  const dark = resolvedTheme === "dark";

  const src = withBase(
    markOnly || variant === "mark"
      ? "/logo/mark.svg"
      : variant === "glass" || variant === "loading"
        ? variant === "loading"
          ? "/logo/loading-logo.svg"
          : "/logo/logo-glass.svg"
        : variant === "gold"
          ? "/logo/logo-gold.svg"
          : variant === "white"
            ? "/logo/logo-white.svg"
            : variant === "black"
              ? "/logo/logo-black.svg"
              : variant === "light"
                ? "/logo/logo-light.svg"
                : variant === "dark"
                  ? "/logo/logo-dark.svg"
                  : dark
                    ? "/logo/logo-dark.svg"
                    : "/logo/logo-light.svg",
  );

  useEffect(() => {
    if (!animated || reduce || !ref.current) return;
    const tween = gsap.fromTo(
      ref.current,
      { opacity: 0, y: -8, filter: "blur(6px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.75,
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
      width={markOnly ? 40 : 168}
      height={markOnly ? 40 : 48}
      draggable={false}
    />
  );
}
