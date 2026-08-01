"use client";

import { VillageDepthMap } from "@/components/VillageDepthMap";

/** Fallback / reduced-motion map uses the real aerial with depth parallax. */
export function VillageMap() {
  return <VillageDepthMap />;
}
