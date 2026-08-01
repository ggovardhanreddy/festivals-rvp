"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { sampleLandingFlyPose } from "@/lib/experience";

/** Progress-driven cinematic camera with gentle mouse parallax. */
export function FlyCameraRig({
  progress,
  reduced,
}: {
  progress: number;
  reduced: boolean;
}) {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const pos = useRef(new THREE.Vector3());
  const target = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector3());

  useFrame(() => {
    if (typeof window !== "undefined") {
      const mx = (window as Window & { __rvpMx?: number }).__rvpMx ?? 0;
      const my = (window as Window & { __rvpMy?: number }).__rvpMy ?? 0;
      mouse.current.x += (mx - mouse.current.x) * 0.06;
      mouse.current.y += (my - mouse.current.y) * 0.06;
    }

    const pose = sampleLandingFlyPose(progress);
    pos.current.set(...pose.position);
    target.current.set(...pose.target);

    const parallax = reduced ? 0 : 1.1;
    camera.position.set(
      pos.current.x + mouse.current.x * parallax,
      pos.current.y + mouse.current.y * 0.35,
      pos.current.z,
    );
    look.current.copy(target.current);
    look.current.x += mouse.current.x * 0.4;
    look.current.y += mouse.current.y * 0.15;
    camera.lookAt(look.current);
  });

  return null;
}
