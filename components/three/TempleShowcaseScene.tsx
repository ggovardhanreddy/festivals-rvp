"use client";

import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";

export function TempleShowcaseScene() {
  return (
    <Canvas className="temple-showcase-3d" camera={{ position: [0, 1.8, 4.7], fov: 42 }}>
      <color attach="background" args={["#f6efe0"]} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 6, 4]} intensity={1.05} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[9, 9]} />
        <meshStandardMaterial color="#e6d5b4" roughness={0.95} />
      </mesh>
      <Float speed={1} rotationIntensity={0.12} floatIntensity={0.14}>
        <group>
          <mesh position={[0, 0.22, 0]}>
            <boxGeometry args={[1.65, 0.44, 1.65]} />
            <meshStandardMaterial color="#be7c4b" />
          </mesh>
          <mesh position={[0, 0.65, 0]}>
            <boxGeometry args={[1.1, 0.42, 1.1]} />
            <meshStandardMaterial color="#ca9163" />
          </mesh>
          <mesh position={[0, 1.05, 0]}>
            <coneGeometry args={[0.78, 0.76, 4]} />
            <meshStandardMaterial color="#7d4d32" />
          </mesh>
          <mesh position={[0, 1.5, 0]}>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshStandardMaterial color="#d4b270" emissive="#8d6a27" emissiveIntensity={0.18} />
          </mesh>
        </group>
      </Float>
      <OrbitControls autoRotate autoRotateSpeed={0.45} enablePan={false} enableZoom={false} minPolarAngle={0.95} maxPolarAngle={1.35} />
    </Canvas>
  );
}
