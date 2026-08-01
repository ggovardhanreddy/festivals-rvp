"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { withBase } from "@/lib/base";

/**
 * Real Kondreddigaripalli aerial textured into a gently living 3D terrain.
 * Ramalayam sits near the visual center of the captured map.
 */
export function RealVillageTerrain({
  night = false,
  reduced = false,
}: {
  night?: boolean;
  reduced?: boolean;
}) {
  const map = useTexture(withBase("/brand/village-aerial.webp"));
  const mesh = useRef<THREE.Mesh>(null);
  const pin = useRef<THREE.Group>(null);

  useMemo(() => {
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;
    map.wrapS = map.wrapT = THREE.ClampToEdgeWrapping;
  }, [map]);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(28, 36, reduced ? 24 : 64, reduced ? 32 : 80);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      // Soft hills from vegetation / terrain read of the aerial
      const edge = Math.min(1, Math.hypot(x / 14, y / 18));
      const swell =
        Math.sin(x * 0.45) * Math.cos(y * 0.35) * 0.35 +
        Math.sin(x * 1.1 + y * 0.7) * 0.12;
      const bowl = (1 - edge) * 0.15;
      pos.setZ(i, swell * (0.55 + bowl) - edge * 0.25);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, [reduced]);

  useFrame(({ clock }) => {
    if (reduced) return;
    if (mesh.current) {
      mesh.current.rotation.z = Math.sin(clock.elapsedTime * 0.05) * 0.01;
    }
    if (pin.current) {
      pin.current.position.y = 1.35 + Math.sin(clock.elapsedTime * 1.6) * 0.12;
    }
  });

  return (
    <group position={[0, 0.02, -1]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh ref={mesh} geometry={geometry} receiveShadow castShadow>
        <meshStandardMaterial
          map={map}
          roughness={0.92}
          metalness={0.04}
          color={night ? "#8a9a90" : "#ffffff"}
          emissive={night ? "#0a1410" : "#000000"}
          emissiveIntensity={night ? 0.15 : 0}
        />
      </mesh>

      {/* Ramalayam pin — near map center of the captured aerial */}
      <group ref={pin} position={[-1.2, 0.8, 0.55]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.28, 18, 18]} />
          <meshStandardMaterial
            color="#d64545"
            emissive="#ff6b6b"
            emissiveIntensity={0.85}
          />
        </mesh>
        <mesh position={[0, -0.55, 0]}>
          <coneGeometry args={[0.12, 0.7, 8]} />
          <meshStandardMaterial color="#b83232" />
        </mesh>
        <mesh position={[0, 0.55, 0]}>
          <ringGeometry args={[0.4, 0.55, 24]} />
          <meshStandardMaterial
            color="#f0c98a"
            transparent
            opacity={0.55}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
}
