"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import {
  VILLAGE_HOTSPOTS,
  type LightingMode,
  type VillageHotspotId,
  type WeatherMode,
} from "@/lib/experience";
import { RealVillageTerrain } from "./RealVillageTerrain";

function Tree({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  const foliage = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!foliage.current) return;
    foliage.current.rotation.z = Math.sin(clock.elapsedTime * 0.8 + position[0]) * 0.04;
  });
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 1.4, 6]} />
        <meshStandardMaterial color="#5a3d28" />
      </mesh>
      <mesh ref={foliage} position={[0, 1.7, 0]} castShadow>
        <coneGeometry args={[0.9, 1.8, 7]} />
        <meshStandardMaterial color="#2f6b45" />
      </mesh>
    </group>
  );
}

function Building({
  position,
  size,
  color,
  roof = "#8f6a32",
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  roof?: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, size[1] / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, size[1] + 0.45, 0]} castShadow>
        <coneGeometry args={[Math.max(size[0], size[2]) * 0.72, 0.9, 4]} />
        <meshStandardMaterial color={roof} />
      </mesh>
    </group>
  );
}

function Birds({ enabled }: { enabled: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current || !enabled) return;
    group.current.position.x = Math.sin(clock.elapsedTime * 0.25) * 12;
    group.current.position.z = Math.cos(clock.elapsedTime * 0.2) * 8 - 2;
    group.current.position.y = 8 + Math.sin(clock.elapsedTime * 0.6) * 0.5;
  });
  if (!enabled) return null;
  return (
    <group ref={group}>
      {[0, 1.2, 2.1].map((offset) => (
        <mesh key={offset} position={[offset, 0, offset * 0.2]}>
          <sphereGeometry args={[0.08, 6, 6]} />
          <meshStandardMaterial color="#1a2e24" />
        </mesh>
      ))}
    </group>
  );
}

function Clouds({ dense }: { dense: boolean }) {
  const items = useMemo(
    () =>
      Array.from({ length: dense ? 8 : 5 }, (_, i) => ({
        id: i,
        x: -16 + i * 5,
        y: 10 + (i % 3) * 1.2,
        z: -18 + (i % 4) * 3,
        s: 1.2 + (i % 3) * 0.35,
      })),
    [dense],
  );
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.position.x = Math.sin(clock.elapsedTime * 0.03) * 2;
  });
  return (
    <group ref={group}>
      {items.map((cloud) => (
        <Float key={cloud.id} speed={0.4} floatIntensity={0.2} rotationIntensity={0}>
          <mesh position={[cloud.x, cloud.y, cloud.z]} scale={cloud.s}>
            <sphereGeometry args={[1.4, 10, 10]} />
            <meshStandardMaterial color="#e8efe9" transparent opacity={0.55} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function HotspotMarker({
  id,
  position,
  active,
  hovered,
  onHover,
  onSelect,
}: {
  id: VillageHotspotId;
  position: [number, number, number];
  active: boolean;
  hovered: boolean;
  onHover: (id: VillageHotspotId | null) => void;
  onSelect: (id: VillageHotspotId) => void;
}) {
  const glow = active || hovered;
  return (
    <group position={position}>
      <mesh
        position={[0, 0.9, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(id);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          onHover(null);
          document.body.style.cursor = "auto";
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(id);
        }}
      >
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial
          color={glow ? "#f0c98a" : "#d4a45a"}
          emissive={glow ? "#d4a45a" : "#000000"}
          emissiveIntensity={glow ? 1.4 : 0.2}
        />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.45, 0.7, 24]} />
        <meshStandardMaterial color="#f0c98a" transparent opacity={glow ? 0.55 : 0.2} />
      </mesh>
    </group>
  );
}

function FloatingLeaves({ enabled }: { enabled: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const leaves = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        x: -8 + (i % 7) * 2.4,
        y: 1 + (i % 5) * 0.4,
        z: -4 + Math.floor(i / 7) * 5,
      })),
    [],
  );
  useFrame(({ clock }) => {
    if (!ref.current || !enabled) return;
    ref.current.children.forEach((child, i) => {
      child.position.y = leaves[i]!.y + Math.sin(clock.elapsedTime + i) * 0.35;
      child.rotation.z = clock.elapsedTime * 0.4 + i;
    });
  });
  if (!enabled) return null;
  return (
    <group ref={ref}>
      {leaves.map((leaf) => (
        <mesh key={leaf.id} position={[leaf.x, leaf.y, leaf.z]}>
          <planeGeometry args={[0.18, 0.1]} />
          <meshStandardMaterial color="#6f9b55" side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

export function VillageWorld({
  lighting,
  weather,
  reduced,
  activeId,
  hoveredId,
  onHover,
  onSelect,
  accent = "default",
}: {
  lighting: LightingMode;
  weather: WeatherMode;
  reduced: boolean;
  activeId: VillageHotspotId | null;
  hoveredId: VillageHotspotId | null;
  onHover: (id: VillageHotspotId | null) => void;
  onSelect: (id: VillageHotspotId) => void;
  accent?: "default" | "sankranthi" | "vinayaka" | "birthday" | "trips";
}) {
  const sun = lighting === "morning" || lighting === "afternoon";
  const night = lighting === "night" || weather === "night";

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[48, 48]} />
        <meshStandardMaterial color={night ? "#1a2a22" : "#2f4a38"} />
      </mesh>

      {/* Real village aerial as living 3D terrain */}
      <RealVillageTerrain night={night} reduced={reduced} />

      {/* Landmark markers float above the aerial for fly-to hotspots */}
      <Building
        position={[-6, 0.2, -8]}
        size={[1.6, 1.4, 1.6]}
        color="#efe6d6"
        roof="#9a6b2f"
      />
      <mesh position={[-6, 2.2, -8]} castShadow>
        <coneGeometry args={[0.8, 1.2, 4]} />
        <meshStandardMaterial
          color="#c49855"
          emissive="#8f6a32"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* Soft landmark accents at edges — keep aerial readable */}
      <Building
        position={[7, 0.15, 8]}
        size={[1.8, 1.2, 1.4]}
        color="#d8e2da"
        roof="#5f7466"
      />

      {/* Entrance markers at south edge of aerial */}
      <mesh position={[-4, 1.1, 14]} castShadow>
        <boxGeometry args={[0.28, 2.2, 0.28]} />
        <meshStandardMaterial color="#7a5a35" />
      </mesh>
      <mesh position={[-2.4, 1.1, 14]} castShadow>
        <boxGeometry args={[0.28, 2.2, 0.28]} />
        <meshStandardMaterial color="#7a5a35" />
      </mesh>
      <mesh position={[-3.2, 2.3, 14]} castShadow>
        <boxGeometry args={[2, 0.28, 0.32]} />
        <meshStandardMaterial color="#8f6a32" />
      </mesh>

      {/* Distant hills frame the real village */}
      {[
        [-22, 0, -20],
        [-12, 0, -24],
        [6, 0, -26],
        [18, 0, -20],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <coneGeometry args={[5 + i, 7 + i * 0.6, 5]} />
          <meshStandardMaterial color={night ? "#24352c" : "#4d6558"} />
        </mesh>
      ))}

      {[
        [-14, 0, 12],
        [12, 0, 12],
        [-16, 0, -2],
        [14, 0, -6],
      ].map((pos, i) => (
        <Tree
          key={i}
          position={pos as [number, number, number]}
          scale={0.85 + (i % 3) * 0.15}
        />
      ))}

      {/* Street lights */}
      {[-6, -2, 2, 6].map((x) => (
        <group key={x} position={[x, 0, 8.5]}>
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.05, 0.07, 2.4, 6]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <mesh position={[0, 2.45, 0]}>
            <sphereGeometry args={[0.15, 10, 10]} />
            <meshStandardMaterial
              color="#f0d7a0"
              emissive="#f0d7a0"
              emissiveIntensity={night || lighting === "festival" ? 2 : 0.2}
            />
          </mesh>
        </group>
      ))}

      <Clouds dense={weather === "cloudy" || weather === "fog"} />
      <Birds enabled={!reduced && sun} />
      <FloatingLeaves enabled={!reduced} />

      {accent === "sankranthi" && !reduced && (
        <Float speed={1.2} floatIntensity={1.2}>
          <mesh position={[5, 4, 6]}>
            <planeGeometry args={[0.8, 0.5]} />
            <meshStandardMaterial color="#e85d4c" side={THREE.DoubleSide} />
          </mesh>
        </Float>
      )}
      {accent === "vinayaka" && (
        <Sparkles
          count={28}
          scale={[4, 3, 4]}
          size={2}
          position={[-6, 2, -4]}
          color="#f0c98a"
        />
      )}
      {accent === "birthday" && !reduced && (
        <Sparkles count={40} scale={8} size={3} color="#f7b6c8" />
      )}
      {(night || lighting === "festival") && (
        <Sparkles
          count={reduced ? 12 : 40}
          scale={[30, 12, 30]}
          position={[0, 10, 0]}
          size={2}
          color="#f5f0d8"
        />
      )}

      {VILLAGE_HOTSPOTS.map((spot) => (
        <HotspotMarker
          key={spot.id}
          id={spot.id}
          position={spot.position}
          active={activeId === spot.id}
          hovered={hoveredId === spot.id}
          onHover={onHover}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}
