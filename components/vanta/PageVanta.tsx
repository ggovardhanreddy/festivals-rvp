"use client";

import dynamic from "next/dynamic";
import type { VantaEffectName } from "./VantaBackground";

const VantaBackground = dynamic(
  () => import("./VantaBackground").then((m) => m.VantaBackground),
  { ssr: false },
);

/**
 * Fixed full-page Vanta backdrop + readability veil for content pages.
 * Identity backgrounds are permanent — do not swap for festival imagery.
 */
export function PageVanta({ effect }: { effect: VantaEffectName }) {
  return (
    <div className="page-vanta" data-vanta-page={effect} aria-hidden>
      <VantaBackground effect={effect} className="page-vanta-canvas" />
      <div className="page-vanta-veil" />
    </div>
  );
}
