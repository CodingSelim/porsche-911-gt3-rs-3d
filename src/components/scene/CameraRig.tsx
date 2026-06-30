"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { damp } from "@/lib/math";

/**
 * The camera holds a fixed studio framing — the car is posed by scroll, the shot
 * itself stays still. The only motion is a faint, optional parallax that tracks
 * the pointer; there is no time-based drift, so a stationary page is fully still.
 */
const BASE_POS = new THREE.Vector3(0, 1.18, 9.1);
const LOOK_AT = new THREE.Vector3(0, 0.82, 0);

export default function CameraRig() {
  const camera = useThree((s) => s.camera);
  const pos = useRef(BASE_POS.clone());
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dt) => {
    const d = Math.min(dt, 1 / 30);

    target.set(
      BASE_POS.x + state.pointer.x * 0.28,
      BASE_POS.y + state.pointer.y * 0.16,
      BASE_POS.z,
    );

    pos.current.x = damp(pos.current.x, target.x, 2.4, d);
    pos.current.y = damp(pos.current.y, target.y, 2.4, d);
    pos.current.z = damp(pos.current.z, target.z, 2.4, d);

    camera.position.copy(pos.current);
    camera.lookAt(LOOK_AT);
  });

  return null;
}
