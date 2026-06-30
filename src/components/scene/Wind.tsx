"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { useScene } from "@/lib/store";
import { chapterRanges, chapters } from "@/story/chapters";

const proofIdx = chapters.findIndex((c) => c.id === "proof");
const RANGE = proofIdx >= 0 ? chapterRanges[proofIdx] : ([1, 1] as [number, number]);

const N = 80;
const SPAN_Z = 28;
const SPEED = 30;
const HEADING = -0.86;

export default function Wind() {
  const lines = useRef<THREE.LineSegments>(null);
  const mat = useRef<THREE.LineBasicMaterial>(null);
  const op = useRef(0);
  const t = useRef(0);

  const streaks = useMemo(
    () =>
      Array.from({ length: N }, () => ({
        x: (Math.random() * 2 - 1) * 6.5,
        y: 0.15 + Math.random() * 2.7,
        z: Math.random() * SPAN_Z,
        len: 0.6 + Math.random() * 1.4,
      })),
    [],
  );
  const positions = useMemo(() => new Float32Array(N * 2 * 3), []);
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  useFrame((_, dt) => {
    const d = Math.min(dt, 1 / 30);
    const off = useScene.getState().progress;

    let target = 0;
    if (off > RANGE[0] && off < RANGE[1]) {
      const t2 = (off - RANGE[0]) / (RANGE[1] - RANGE[0]);
      target = Math.min(1, Math.min(t2, 1 - t2) * 4);
    }
    op.current = THREE.MathUtils.damp(op.current, target, 6, d);

    const visible = op.current > 0.01;
    if (lines.current) lines.current.visible = visible;
    if (mat.current) mat.current.opacity = op.current * 0.5;
    if (!visible) return;

    t.current += d * SPEED;
    for (let i = 0; i < N; i++) {
      const s = streaks[i];
      const z = (((s.z - t.current) % SPAN_Z) + SPAN_Z) % SPAN_Z - SPAN_Z / 2;
      const o = i * 6;
      positions[o] = s.x;
      positions[o + 1] = s.y;
      positions[o + 2] = z;
      positions[o + 3] = s.x;
      positions[o + 4] = s.y;
      positions[o + 5] = z + s.len;
    }
    geom.attributes.position.needsUpdate = true;
  });

  return (
    <group rotation={[0, HEADING, 0]}>
      <lineSegments ref={lines} geometry={geom} visible={false}>
        <lineBasicMaterial
          ref={mat}
          color="#d2d9ea"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}
