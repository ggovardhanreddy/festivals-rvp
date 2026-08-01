"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, Stars } from "@react-three/drei";
import {
  OVERVIEW_CAMERA,
  type CameraPose,
  type LightingMode,
  type VillageHotspotId,
  type WeatherMode,
} from "@/lib/experience";
import { VillageWorld } from "./VillageWorld";
import { CameraRig } from "./CameraRig";

function Lights({ lighting, weather }: { lighting: LightingMode; weather: WeatherMode }) {
  const sunColor =
    lighting === "morning"
      ? "#ffd29a"
      : lighting === "evening"
        ? "#ff9a5c"
        : lighting === "night"
          ? "#8aa4c8"
          : lighting === "festival"
            ? "#ffc978"
            : "#fff4d8";
  const intensity =
    lighting === "night"
      ? 0.35
      : lighting === "morning"
        ? 1.1
        : lighting === "evening"
          ? 0.9
          : 1.25;
  const fogColor =
    weather === "fog" || lighting === "morning"
      ? "#c9d6cc"
      : lighting === "night"
        ? "#0b1410"
        : "#b7c8bb";

  return (
    <>
      <color attach="background" args={[fogColor]} />
      <fog attach="fog" args={[fogColor, 18, weather === "fog" ? 45 : 70]} />
      <ambientLight intensity={lighting === "night" ? 0.2 : 0.45} />
      <directionalLight
        castShadow
        position={lighting === "morning" ? [-8, 14, 6] : [10, 16, 4]}
        intensity={intensity}
        color={sunColor}
        shadow-mapSize={[1024, 1024]}
      />
      <hemisphereLight
        intensity={0.35}
        color={lighting === "night" ? "#1c2a40" : "#e8f0ea"}
        groundColor="#2a4033"
      />
      {(lighting === "night" || weather === "night") && (
        <Stars radius={80} depth={40} count={800} factor={3} fade speed={0.4} />
      )}
    </>
  );
}

export function VillageCanvas({
  pose = OVERVIEW_CAMERA,
  lighting,
  weather,
  reduced,
  lowPower,
  activeId,
  hoveredId,
  onHover,
  onSelect,
  accent = "default",
  className,
}: {
  pose?: CameraPose;
  lighting: LightingMode;
  weather: WeatherMode;
  reduced: boolean;
  lowPower: boolean;
  activeId: VillageHotspotId | null;
  hoveredId: VillageHotspotId | null;
  onHover: (id: VillageHotspotId | null) => void;
  onSelect: (id: VillageHotspotId) => void;
  accent?: "default" | "sankranthi" | "vinayaka" | "birthday" | "trips";
  className?: string;
}) {
  const dpr = useMemo<[number, number]>(
    () => (lowPower || reduced ? [1, 1.25] : [1, 1.75]),
    [lowPower, reduced],
  );

  return (
    <div className={className || "village-canvas"}>
      <Canvas
        shadows={!lowPower}
        dpr={dpr}
        camera={{
          position: pose.position,
          fov: 42,
          near: 0.1,
          far: 200,
        }}
        gl={{
          antialias: !lowPower,
          powerPreference: lowPower ? "low-power" : "high-performance",
          alpha: false,
        }}
      >
        <Suspense fallback={null}>
          <AdaptiveDpr pixelated />
          <Lights lighting={lighting} weather={weather} />
          <CameraRig pose={pose} reduced={reduced} />
          <VillageWorld
            lighting={lighting}
            weather={weather}
            reduced={reduced || lowPower}
            activeId={activeId}
            hoveredId={hoveredId}
            onHover={onHover}
            onSelect={onSelect}
            accent={accent}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
