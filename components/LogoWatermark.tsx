"use client";

import { Logo } from "@/components/Logo";

/**
 * Decorative brand watermark — atmospheric only.
 * Non-interactive so it never blocks nav, drawers, or CTAs.
 */
export function LogoWatermark({
  className = "",
  vertical = false,
}: {
  className?: string;
  /** Vertical lockup for large hero watermarks; horizontal master for shell. */
  vertical?: boolean;
}) {
  return (
    <div
      className={`logo-watermark ${className}`.trim()}
      aria-hidden="true"
    >
      <Logo
        variant={vertical ? "watermark" : "auto"}
        glossy
        className="logo-watermark-mark"
      />
    </div>
  );
}
