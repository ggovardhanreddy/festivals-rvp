"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { CameraPose } from "@/lib/experience";

export function CameraRig({
  pose,
  reduced,
  cinematicDrift = true,
}: {
  pose: CameraPose;
  reduced: boolean;
  cinematicDrift?: boolean;
}) {
  const { camera } = useThree();
  const currentPos = useRef(new THREE.Vector3(...pose.position));
  const currentTarget = useRef(new THREE.Vector3(...pose.target));
  const desiredPos = useRef(new THREE.Vector3(...pose.position));
  const desiredTarget = useRef(new THREE.Vector3(...pose.target));

  useEffect(() => {
    desiredPos.current.set(...pose.position);
    desiredTarget.current.set(...pose.target);
    if (reduced) {
      currentPos.current.copy(desiredPos.current);
      currentTarget.current.copy(desiredTarget.current);
      camera.position.copy(currentPos.current);
      camera.lookAt(currentTarget.current);
    }
  }, [pose, reduced, camera]);

  useFrame(({ clock }) => {
    const ease = reduced ? 1 : 0.035;
    currentPos.current.lerp(desiredPos.current, ease);
    currentTarget.current.lerp(desiredTarget.current, ease);

    if (!reduced && cinematicDrift) {
      const t = clock.elapsedTime;
      camera.position.set(
        currentPos.current.x + Math.sin(t * 0.12) * 0.25,
        currentPos.current.y + Math.sin(t * 0.08) * 0.12,
        currentPos.current.z + Math.cos(t * 0.1) * 0.2,
      );
    } else {
      camera.position.copy(currentPos.current);
    }
    camera.lookAt(currentTarget.current);
  });

  return null;
}
