"use client";

import { Logo } from "@/components/Logo";

/**
 * Full-viewport decorative brand watermark — atmospheric only.
 * Non-interactive so it never blocks nav, drawers, or CTAs.
 */
export function LogoWatermark() {
  return (
    <div className="logo-watermark" aria-hidden="true">
      <Logo glossy className="logo-watermark-mark" />
    </div>
  );
}
