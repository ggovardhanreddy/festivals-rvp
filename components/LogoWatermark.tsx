"use client";

import { Logo } from "@/components/Logo";

/**
 * Full-viewport decorative brand watermark — atmospheric only.
 * Non-interactive so it never blocks nav, drawers, or CTAs.
 *
 * Uses the hero's artwork (logo-vertical.webp), which the homepage has already
 * downloaded, and turns the gloss off: an animated sheen running forever on a
 * full-viewport layer nobody can see at this opacity is pure compositing cost.
 */
export function LogoWatermark() {
  return (
    <div className="logo-watermark" aria-hidden="true">
      <Logo variant="vertical" glossy={false} className="logo-watermark-mark" />
    </div>
  );
}
