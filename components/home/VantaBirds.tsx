"use client";

import { VantaBackground } from "@/components/vanta/VantaBackground";

/**
 * Permanent homepage hero background — Vanta Birds only.
 * Destroyed on unmount; skipped for reduced motion / no WebGL.
 */
export function VantaBirds({ className = "" }: { className?: string }) {
  return <VantaBackground effect="birds" className={className} />;
}
