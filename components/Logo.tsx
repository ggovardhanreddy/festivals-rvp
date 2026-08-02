"use client";

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
  | "loading"
  | "vertical";

/**
 * Always renders the provided brand artwork (Downloads logo.png → logo-master).
 * SVG variants are kept only for tiny mark / favicon use cases.
 */
export function Logo({
  className = "",
  markOnly = false,
  variant = "auto",
}: {
  className?: string;
  markOnly?: boolean;
  animated?: boolean;
  variant?: LogoVariant;
}) {
  const src = withBase(
    markOnly || variant === "mark"
      ? "/logo/mark.svg"
      : variant === "vertical"
        ? "/logo/logo-vertical.png"
        : "/logo/logo-master.png",
  );

  const vertical = variant === "vertical";

  return (
    <img
      className={`brand-logo ${vertical ? "brand-logo-vertical" : ""} ${className}`.trim()}
      src={src}
      alt="RVP Youth — Reddivaripalli"
      width={markOnly ? 40 : vertical ? 120 : 168}
      height={markOnly ? 40 : vertical ? 98 : 48}
      draggable={false}
      decoding="async"
    />
  );
}
