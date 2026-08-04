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
 * Brand artwork — circular emblem (header) or full vertical lockup (hero).
 * Source: public/brand/rvp-youth-logo-master.png → scripts/generate-logo-system.ts
 */
export function Logo({
  className = "",
  markOnly = false,
  variant = "auto",
  glossy = true,
  priority = false,
}: {
  className?: string;
  markOnly?: boolean;
  animated?: boolean;
  variant?: LogoVariant;
  /** Soft glass/gloss sheen. Default on for brand consistency. */
  glossy?: boolean;
  /** Mark the LCP logo candidate (home hero). */
  priority?: boolean;
}) {
  const vertical = variant === "vertical";
  const mark = markOnly || variant === "mark";

  const src = withBase(
    mark
      ? "/logo/logo-mark.png"
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
        alt="Reddivaripalli Village — Heritage, Community, Progress"
        width={mark ? 40 : vertical ? 120 : 48}
        height={mark ? 40 : vertical ? 160 : 48}
        draggable={false}
        decoding={priority ? "sync" : "async"}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "low"}
      />
      {glossy ? (
        <span className="brand-logo-gloss-clip" aria-hidden>
          <span className="brand-logo-sheen" />
        </span>
      ) : null}
    </span>
  );
}
