"use client";

import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";

type Point = { name: string; pos: [number, number, number] };

const points: Point[] = [
  { name: "Ramalayam", pos: [-1.2, 0.08, -0.3] },
  { name: "Mathamma Temple", pos: [0.95, 0.08, 0.2] },
  { name: "Devapatlamma", pos: [1.75, 0.08, -0.95] },
  { name: "Shiva Temple Site", pos: [-0.15, 0.08, 1.05] },
  { name: "Panchayat Office", pos: [-1.9, 0.08, 0.85] },
];

function Marker({ name, pos }: Point) {
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#d4b270" emissive="#7a5724" emissiveIntensity={0.28} />
      </mesh>
      <Html distanceFactor={8}>
        <span className="map-3d-label">{name}</span>
      </Html>
    </group>
  );
}

export function VillageMapScene() {
  return (
    <Canvas className="village-map-3d" camera={{ position: [0, 3.7, 4.6], fov: 46 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 2]} intensity={1} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.8, 5.2]} />
        <meshStandardMaterial color="#2e5b45" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0.22, 0]} position={[0.2, 0.01, -0.35]}>
        <planeGeometry args={[3.2, 0.26]} />
        <meshStandardMaterial color="#8f6a3d" />
      </mesh>
      {points.map((point) => (
        <Marker key={point.name} {...point} />
      ))}
      <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={0.72} maxPolarAngle={1.22} />
    </Canvas>
  );
}
