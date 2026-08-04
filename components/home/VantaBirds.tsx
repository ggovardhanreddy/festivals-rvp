"use client";

import { VantaBackground } from "@/components/vanta/VantaBackground";

/**
 * Permanent homepage hero background — Vanta Birds only.
 * Destroyed on unmount; skipped for reduced motion / no WebGL.
 */
export function VantaBirds({
  className = "",
  soft = false,
}: {
  className?: string;
  /** Softer flock density / speed for the homepage hero. */
  soft?: boolean;
}) {
  return (
    <VantaBackground effect="birds" className={className} soft={soft} />
  );
}
