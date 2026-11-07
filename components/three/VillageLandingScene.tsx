"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, OrbitControls, Stars } from "@react-three/drei";
import { useMemo } from "react";
import { Vector3 } from "three";

function Huts() {
  return (
    <group>
      {[-2.8, -1.2, 0.4, 2].map((x, i) => (
        <group key={x} position={[x, -0.35, -0.9 + i * 0.35]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.7, 0.48, 0.6]} />
            <meshStandardMaterial color="#c07444" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.37, 0]} castShadow>
            <coneGeometry args={[0.62, 0.4, 4]} />
            <meshStandardMaterial color="#6d3f2b" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function CameraDolly({ entered }: { entered: boolean }) {
  const { camera } = useThree();
  const start = useMemo(() => new Vector3(0, 3.4, 9.4), []);
  const target = useMemo(() => new Vector3(0, 2.1, 6.2), []);
  useFrame(() => {
    const to = entered ? target : start;
    camera.position.lerp(to, 0.028);
    camera.lookAt(0, 0.65, -1.8);
  });
  return null;
}

export function VillageLandingScene({ entered = true }: { entered?: boolean }) {
  return (
    <Canvas className="village-landing-3d" camera={{ position: [0, 3.4, 9.4], fov: 43 }}>
      <color attach="background" args={["#0f2c22"]} />
      <fog attach="fog" args={["#0f2c22", 6, 15]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[6, 8, 3]} intensity={1.15} color="#ffe6b8" castShadow />
      <hemisphereLight intensity={0.35} color="#f4e9cf" groundColor="#1f3d2e" />
      <Stars radius={60} depth={25} count={800} factor={3} saturation={0} fade speed={0.35} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[28, 28]} />
        <meshStandardMaterial color="#264d3c" roughness={1} />
      </mesh>
      <Float speed={1.15} rotationIntensity={0.12} floatIntensity={0.35}>
        <mesh position={[0, 0.2, -2.3]} castShadow>
          <torusGeometry args={[1.35, 0.03, 10, 64]} />
          <meshStandardMaterial color="#d4b270" emissive="#8f6a24" emissiveIntensity={0.3} />
        </mesh>
      </Float>
      <Huts />
      <mesh position={[0, 0.95, -1.8]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 1.1, 18]} />
        <meshStandardMaterial color="#e2c78b" />
      </mesh>
      <CameraDolly entered={entered} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.25} maxPolarAngle={1.35} minPolarAngle={0.95} />
    </Canvas>
  );
}
