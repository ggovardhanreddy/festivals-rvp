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
 * Gloss: CSS specular sheen on a glass-finish shell.
 */
export function Logo({
  className = "",
  markOnly = false,
  variant = "auto",
  glossy = true,
}: {
  className?: string;
  markOnly?: boolean;
  animated?: boolean;
  variant?: LogoVariant;
  /** Soft glass/gloss sheen. Default on for brand consistency. */
  glossy?: boolean;
}) {
  const vertical = variant === "vertical";

  const src = withBase(
    markOnly || variant === "mark"
      ? "/logo/mark.svg"
      : vertical
        ? "/logo/logo-vertical.png"
        : "/logo/logo-master.png",
  );

  return (
    <span
      className={[
        "brand-logo-shell",
        glossy ? "brand-logo-shell--gloss" : "",
        vertical ? "brand-logo-shell--vertical" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <img
        className={`brand-logo ${vertical ? "brand-logo-vertical" : ""} ${className}`.trim()}
        src={src}
        alt="RVP Youth — Reddivaripalli"
        width={markOnly ? 40 : vertical ? 120 : 168}
        height={markOnly ? 40 : vertical ? 98 : 48}
        draggable={false}
        decoding="async"
      />
      {glossy ? (
        <span className="brand-logo-gloss-clip" aria-hidden>
          <span className="brand-logo-sheen" />
        </span>
      ) : null}
    </span>
  );
}
