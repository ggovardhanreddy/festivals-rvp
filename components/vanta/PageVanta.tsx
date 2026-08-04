"use client";

import dynamic from "next/dynamic";
import { useAllowHeavyEffects } from "@/lib/mobile-shell";
import type { VantaEffectName } from "./VantaBackground";

const VantaBackground = dynamic(
  () => import("./VantaBackground").then((m) => m.VantaBackground),
  { ssr: false },
);

/**
 * Fixed full-page Vanta backdrop + readability veil for content pages.
 * Identity backgrounds are permanent — do not swap for festival imagery.
 * Mobile shell: CSS veil only (no three.js / Vanta download).
 */
export function PageVanta({ effect }: { effect: VantaEffectName }) {
  const allowVanta = useAllowHeavyEffects();
  return (
    <div className="page-vanta" data-vanta-page={effect} aria-hidden>
      {allowVanta ? (
        <VantaBackground effect={effect} className="page-vanta-canvas" />
      ) : null}
      <div className="page-vanta-veil" />
    </div>
  );
}
