"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { useMemo, useRef } from "react";
import {
  CatmullRomCurve3,
  Group,
  Vector3,
} from "three";

function Ground() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.28, 0]} receiveShadow>
        <planeGeometry args={[52, 52, 1, 1]} />
        <meshStandardMaterial color="#244b37" roughness={1} />
      </mesh>
      {[-10, -6.8, 7.2, 10.2].map((z, i) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[-1 + (i % 2) * 2, -0.25 + i * 0.002, z]}>
          <planeGeometry args={[48, 2.2]} />
          <meshStandardMaterial color={i % 2 ? "#355c3e" : "#2e563b"} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function VillageRoad() {
  const road = useMemo(() => {
    const curve = new CatmullRomCurve3([
      new Vector3(-15, -0.18, 8),
      new Vector3(-8, -0.16, 5.5),
      new Vector3(-4, -0.16, 2),
      new Vector3(1, -0.16, 1),
      new Vector3(6, -0.16, -3),
      new Vector3(12, -0.16, -7),
      new Vector3(17, -0.16, -8),
    ]);
    return curve;
  }, []);
  const geometry = useMemo(() => road, [road]);
  return (
    <group>
      <mesh>
        <tubeGeometry args={[geometry, 90, 0.62, 8, false]} />
        <meshStandardMaterial color="#b89a70" roughness={1} />
      </mesh>
      <mesh>
        <tubeGeometry args={[geometry, 90, 0.67, 8, false]} />
        <meshStandardMaterial color="#d7c19a" roughness={1} transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

function House({ position, rotation = 0, scale = 1 }: { position: [number, number, number]; rotation?: number; scale?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.45, 0.78, 1.15]} />
        <meshStandardMaterial color="#d8c6a4" roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.91, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.02, 0.72, 4]} />
        <meshStandardMaterial color="#9b5739" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.28, 0.583]}>
        <planeGeometry args={[0.25, 0.45]} />
        <meshStandardMaterial color="#49352a" roughness={1} />
      </mesh>
      <mesh position={[-0.43, 0.58, 0.584]}>
        <planeGeometry args={[0.2, 0.18]} />
        <meshStandardMaterial color="#779b91" roughness={0.45} />
      </mesh>
    </group>
  );
}

function Homes() {
  const homes: Array<{ p: [number, number, number]; r: number; s: number }> = [
    { p: [-8.2, -0.2, -3.8], r: 0.3, s: 1.05 },
    { p: [-5.4, -0.2, -6.4], r: -0.2, s: 0.88 },
    { p: [-2.6, -0.2, -5.2], r: 0.4, s: 0.92 },
    { p: [4.8, -0.2, -7.1], r: -0.3, s: 1.08 },
    { p: [8.2, -0.2, -4.5], r: 0.2, s: 0.9 },
    { p: [10.5, -0.2, -1.2], r: 0.8, s: 0.85 },
    { p: [-10.5, -0.2, 2.1], r: -0.4, s: 0.85 },
    { p: [-7.2, -0.2, 5.1], r: 0.2, s: 0.9 },
    { p: [8.2, -0.2, 4.2], r: -0.5, s: 1 },
    { p: [11.2, -0.2, 6.3], r: 0.25, s: 0.88 },
  ];
  return <group>{homes.map((h, i) => <House key={i} position={h.p} rotation={h.r} scale={h.s} />)}</group>;
}

function PalmTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.15, 0]} rotation={[0, 0, -0.09]} castShadow>
        <cylinderGeometry args={[0.09, 0.16, 2.3, 7]} />
        <meshStandardMaterial color="#765337" roughness={1} />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[Math.sin((i / 7) * Math.PI * 2) * 0.43, 2.25, Math.cos((i / 7) * Math.PI * 2) * 0.43]} rotation={[0.35, (i / 7) * Math.PI * 2, -0.5]}>
          <coneGeometry args={[0.14, 1.25, 5]} />
          <meshStandardMaterial color={i % 2 ? "#477b4d" : "#5e8b4f"} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Trees() {
  const trees: Array<[number, number, number]> = [
    [-12, -0.2, -7], [-12, -0.2, 7], [-4, -0.2, 9], [3, -0.2, 8],
    [13, -0.2, 2], [14, -0.2, -5], [2, -0.2, -10], [-9, -0.2, -10],
  ];
  return <group>{trees.map((p, i) => <PalmTree key={i} position={p} scale={0.8 + (i % 3) * 0.13} />)}</group>;
}

function Temple() {
  return (
    <group position={[0.6, -0.18, -2.6]}>
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.48, 2.1]} />
        <meshStandardMaterial color="#c8a979" roughness={0.86} />
      </mesh>
      <mesh position={[0, 0.78, 0]} castShadow>
        <boxGeometry args={[1.55, 0.72, 1.4]} />
        <meshStandardMaterial color="#b96f43" roughness={0.88} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 1.28 + i * 0.25, 0]} castShadow>
          <cylinderGeometry args={[0.72 - i * 0.15, 0.9 - i * 0.15, 0.25, 8]} />
          <meshStandardMaterial color={i === 2 ? "#d8b66e" : "#a95f3c"} roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, 2.05, 0]} castShadow>
        <sphereGeometry args={[0.16, 12, 10]} />
        <meshStandardMaterial color="#e5c47a" metalness={0.45} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.55, 0.72]}>
        <planeGeometry args={[0.38, 0.58]} />
        <meshStandardMaterial color="#493329" />
      </mesh>
      <mesh position={[0, 0.52, 1.18]}>
        <boxGeometry args={[1.3, 0.08, 0.75]} />
        <meshStandardMaterial color="#d4b87f" roughness={0.8} />
      </mesh>
    </group>
  );
}

function TemplePond() {
  return (
    <group position={[-5.8, -0.19, 1.4]} rotation={[-Math.PI / 2, 0, -0.2]}>
      <mesh scale={[2.8, 1.8, 1]}>
        <circleGeometry args={[1, 48]} />
        <meshPhysicalMaterial color="#547f79" roughness={0.18} metalness={0.12} clearcoat={0.7} />
      </mesh>
      <mesh scale={[3.05, 2.02, 1]} position={[0, 0, -0.025]}>
        <ringGeometry args={[0.91, 1, 48]} />
        <meshStandardMaterial color="#bda477" roughness={0.95} />
      </mesh>
    </group>
  );
}

function Birds() {
  const flock = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (flock.current) {
      flock.current.position.x = Math.sin(clock.elapsedTime * 0.16) * 1.1;
      flock.current.position.y = 5.5 + Math.sin(clock.elapsedTime * 0.65) * 0.18;
    }
  });
  return (
    <group ref={flock} position={[-3, 5.5, -7]}>
      {[0, 1, 2, 3].map((i) => (
        <group key={i} position={[i * 0.5, Math.sin(i * 2) * 0.25, -i * 0.2]}>
          <mesh rotation={[0, 0, -0.3]}>
            <torusGeometry args={[0.16, 0.025, 5, 12, Math.PI]} />
            <meshBasicMaterial color="#f3dfb2" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function CinematicCamera({ entered }: { entered: boolean }) {
  const { camera, pointer } = useThree();
  const from = useMemo(() => new Vector3(0, 15.5, 21), []);
  const to = useMemo(() => new Vector3(0, 8.2, 13.2), []);
  const lookFrom = useMemo(() => new Vector3(0, 0, -1), []);
  const lookTo = useMemo(() => new Vector3(0, 0, -1.4), []);
  const look = useMemo(() => new Vector3(), []);
  useFrame(({ pointer }, delta) => {
    const base = entered ? to : from;
    const target = new Vector3(base.x + pointer.x * (entered ? 0.42 : 0.18), base.y, base.z);
    const t = 1 - Math.exp(-delta * 1.15);
    camera.position.lerp(target, t);
    look.lerp(entered ? lookTo : lookFrom, t);
    camera.lookAt(look.x, look.y, look.z);
  });
  return null;
}

function SceneContents({ entered }: { entered: boolean }) {
  return (
    <>
      <ambientLight intensity={0.75} color="#f6e6c9" />
      <directionalLight position={[-7, 13, 8]} intensity={2.2} color="#ffdca2" castShadow />
      <pointLight position={[0, 4, -2]} intensity={28} distance={16} color="#f2bd73" />
      <Ground />
      <VillageRoad />
      <Homes />
      <TemplePond />
      <Temple />
      <Trees />
      <Birds />
      <Float speed={0.6} rotationIntensity={0.04} floatIntensity={0.08}>
        <mesh position={[0.6, 2.5, -2.6]}>
          <torusGeometry args={[1.65, 0.025, 6, 64]} />
          <meshBasicMaterial color="#d6b66f" transparent opacity={0.48} />
        </mesh>
      </Float>
      <Sparkles count={42} scale={[25, 7, 25]} size={1.4} speed={0.2} opacity={0.32} color="#f6d99c" />
      <CinematicCamera entered={entered} />
    </>
  );
}

export function VillageLandingScene({ entered = false }: { entered?: boolean }) {
  return (
    <Canvas
      className="village-landing-3d"
      camera={{ position: [0, 15.5, 21], fov: 37, near: 0.1, far: 90 }}
      dpr={[1, 1.5]}
      shadows
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      onCreated={({ scene }) => {
        scene.background = null;
        scene.fog = null;
      }}
    >
      <SceneContents entered={entered} />
    </Canvas>
  );
}
