"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AdaptiveDpr, Stars, Sparkles, Float } from "@react-three/drei";
import * as THREE from "three";
import { useReducedMotion } from "framer-motion";
import { useLowPowerDevice } from "@/lib/client";
import { RealVillageTerrain } from "./RealVillageTerrain";
import { FlyCameraRig } from "./FlyCameraRig";

function NightLights({ lowPower }: { lowPower: boolean }) {
  return (
    <>
      <color attach="background" args={["#05080c"]} />
      <fog attach="fog" args={["#070d12", 22, lowPower ? 55 : 75]} />
      <ambientLight intensity={0.18} color="#8aa4c8" />
      <directionalLight
        position={[8, 16, 6]}
        intensity={0.35}
        color="#b8c8e0"
        castShadow={!lowPower}
      />
      <hemisphereLight intensity={0.28} color="#1c2a40" groundColor="#0a1410" />
      {/* Soft temple / festival glow near Ramalayam */}
      <pointLight position={[-1.2, 3, -0.2]} intensity={1.4} distance={18} color="#f0d7a0" />
      <pointLight position={[4, 2.5, 8]} intensity={0.55} distance={14} color="#ff9a5c" />
      {!lowPower && (
        <Stars radius={90} depth={50} count={1200} factor={3.2} fade speed={0.35} />
      )}
    </>
  );
}

function SoftTree({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  const foliage = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!foliage.current) return;
    foliage.current.rotation.z =
      Math.sin(clock.elapsedTime * 0.7 + position[0]) * 0.045;
  });
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.16, 1.3, 6]} />
        <meshStandardMaterial color="#4a3220" />
      </mesh>
      <mesh ref={foliage} position={[0, 1.55, 0]} castShadow>
        <coneGeometry args={[0.85, 1.7, 7]} />
        <meshStandardMaterial color="#1f4a32" />
      </mesh>
    </group>
  );
}

function DriftClouds({ enabled }: { enabled: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current || !enabled) return;
    group.current.position.x = Math.sin(clock.elapsedTime * 0.04) * 3;
  });
  if (!enabled) return null;
  return (
    <group ref={group}>
      {[
        [-14, 14, -20],
        [-4, 16, -24],
        [10, 15, -18],
        [18, 13, -22],
      ].map((p, i) => (
        <Float key={i} speed={0.35} floatIntensity={0.15} rotationIntensity={0}>
          <mesh position={p as [number, number, number]} scale={1.4 + i * 0.15}>
            <sphereGeometry args={[1.6, 10, 10]} />
            <meshStandardMaterial color="#9eb0c4" transparent opacity={0.18} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function BirdFlock({ enabled }: { enabled: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current || !enabled) return;
    const t = clock.elapsedTime;
    group.current.position.set(
      Math.sin(t * 0.22) * 14,
      9 + Math.sin(t * 0.5) * 0.6,
      Math.cos(t * 0.18) * 10 - 4,
    );
  });
  if (!enabled) return null;
  return (
    <group ref={group}>
      {[0, 1.1, 2].map((o) => (
        <mesh key={o} position={[o, 0, o * 0.15]}>
          <sphereGeometry args={[0.07, 6, 6]} />
          <meshStandardMaterial color="#1a2430" />
        </mesh>
      ))}
    </group>
  );
}

function Scene({
  progress,
  reduced,
  lowPower,
}: {
  progress: number;
  reduced: boolean;
  lowPower: boolean;
}) {
  return (
    <>
      <NightLights lowPower={lowPower} />
      <FlyCameraRig progress={progress} reduced={reduced} />
      <RealVillageTerrain night reduced={reduced || lowPower} />

      {/* Stylized framing — not claimed as exact geography */}
      {[
        [-16, 0, 12],
        [14, 0, 10],
        [-18, 0, -4],
        [16, 0, -8],
        [-10, 0, 16],
        [8, 0, 15],
      ].map((p, i) => (
        <SoftTree
          key={i}
          position={p as [number, number, number]}
          scale={0.8 + (i % 3) * 0.2}
        />
      ))}

      <DriftClouds enabled={!reduced} />
      <BirdFlock enabled={!reduced && !lowPower} />

      {!reduced && (
        <Sparkles
          count={lowPower ? 18 : 48}
          scale={[28, 10, 28]}
          position={[0, 8, 0]}
          size={2}
          color="#f5f0d8"
          opacity={0.45}
        />
      )}
    </>
  );
}

/** R3F night fly-through over real aerial terrain + stylized atmosphere. */
export function LandingFlythrough({
  progress,
  active,
  className = "",
}: {
  progress: number;
  active: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const lowPower = useLowPowerDevice();

  useEffect(() => {
    if (reduce || lowPower) return;
    const onMove = (e: PointerEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      (window as Window & { __rvpMx?: number; __rvpMy?: number }).__rvpMx =
        (e.clientX / w - 0.5) * 2;
      (window as Window & { __rvpMx?: number; __rvpMy?: number }).__rvpMy =
        (e.clientY / h - 0.5) * -2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, lowPower]);

  const dpr = useMemo<[number, number]>(
    () => (lowPower || reduce ? [1, 1.15] : [1, 1.6]),
    [lowPower, reduce],
  );

  if (reduce || !active) return null;

  return (
    <div
      className={`landing-flythrough ${className}`.trim()}
      style={{ opacity: Math.min(1, 0.15 + progress * 0.95) }}
      aria-hidden
    >
      <Canvas
        dpr={dpr}
        camera={{ position: [0, 34, 52], fov: 42, near: 0.1, far: 220 }}
        gl={{
          antialias: !lowPower,
          powerPreference: lowPower ? "low-power" : "high-performance",
          alpha: true,
        }}
        shadows={!lowPower}
      >
        <Suspense fallback={null}>
          <AdaptiveDpr pixelated />
          <Scene
            progress={progress}
            reduced={!!reduce || lowPower}
            lowPower={lowPower}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
