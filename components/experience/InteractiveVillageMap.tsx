"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  OVERVIEW_CAMERA,
  VILLAGE_HOTSPOTS,
  lightingForHour,
  type CameraPose,
  type VillageHotspotId,
} from "@/lib/experience";
import { useIsClient, useLowPowerDevice } from "@/lib/client";
import { VillageMap } from "@/components/VillageMap";

const VillageCanvas = dynamic(
  () => import("./village/VillageCanvas").then((mod) => mod.VillageCanvas),
  { ssr: false, loading: () => <div className="village-canvas map-canvas" /> },
);

export function InteractiveVillageMap({
  accent = "default",
}: {
  accent?: "default" | "sankranthi" | "vinayaka" | "birthday" | "trips";
}) {
  const reduce = useReducedMotion();
  const client = useIsClient();
  const lowPower = useLowPowerDevice();
  const use3d = client && !reduce;
  const [activeId, setActiveId] = useState<VillageHotspotId | null>(null);
  const [hoveredId, setHoveredId] = useState<VillageHotspotId | null>(null);
  const [pose, setPose] = useState<CameraPose>(OVERVIEW_CAMERA);

  if (!use3d) return <VillageMap />;

  const spot = VILLAGE_HOTSPOTS.find((s) => s.id === (activeId || hoveredId));
  const lighting = lightingForHour();

  return (
    <div className="interactive-village-map">
      <VillageCanvas
        pose={pose}
        lighting={lighting}
        weather={lighting === "night" ? "night" : "sunny"}
        reduced={!!reduce}
        lowPower={lowPower}
        activeId={activeId}
        hoveredId={hoveredId}
        onHover={setHoveredId}
        onSelect={(id) => {
          const found = VILLAGE_HOTSPOTS.find((s) => s.id === id);
          if (!found) return;
          setActiveId(id);
          setPose(found.camera);
        }}
        accent={accent}
        className="village-canvas map-canvas"
      />
      <aside className="village-map-panel glass-card">
        <p className="eyebrow">{spot ? "Memory place" : "Explore"}</p>
        <h3>{spot?.label || "Choose a glowing place"}</h3>
        <p className="muted">
          {spot?.blurb ||
            "Hover to glow. Click to fly the camera. Open memories when you arrive."}
        </p>
        <div className="btn-row">
          {spot && (
            <Link className="btn" href={spot.href}>
              Open memories
            </Link>
          )}
          <button
            type="button"
            className="btn ghost"
            onClick={() => {
              setActiveId(null);
              setPose(OVERVIEW_CAMERA);
            }}
          >
            Return
          </button>
        </div>
      </aside>
    </div>
  );
}
