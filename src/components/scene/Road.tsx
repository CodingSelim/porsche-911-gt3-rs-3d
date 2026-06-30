"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { useScene } from "@/lib/store";
import { chapterRanges, chapters } from "@/story/chapters";

const proofIdx = chapters.findIndex((c) => c.id === "proof");
const RANGE = proofIdx >= 0 ? chapterRanges[proofIdx] : ([1, 1] as [number, number]);
const HEADING = -0.86; // ground yaw, aligned to the car's stance in the Proof section
const LENGTH = 70;
const SCROLL = 1.9;

function makeCanvas(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * Race surface for the Proof section — the car drives in place while the road,
 * kerbs and barriers scroll past beneath it (treadmill technique: animated
 * texture .offset). Everything fades in/out with damped opacity and dissolves
 * into the scene fog at distance, so entering and leaving stays smooth.
 */
export default function Road() {
  const group = useRef<THREE.Group>(null);
  const op = useRef(0);

  const tex = useMemo(() => {
    const asphalt = makeCanvas(256, 512, (ctx) => {
      ctx.fillStyle = "#0c0d11";
      ctx.fillRect(0, 0, 256, 512);
      for (let i = 0; i < 5000; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.02})`;
        ctx.fillRect(Math.random() * 256, Math.random() * 512, 1, 1);
      }
      ctx.fillStyle = "rgba(220,225,235,0.4)";
      ctx.fillRect(20, 0, 4, 512);
      ctx.fillRect(232, 0, 4, 512);
      ctx.fillStyle = "rgba(235,240,250,0.65)";
      for (let y = 0; y < 512; y += 110) ctx.fillRect(124, y, 8, 60);
    });
    asphalt.repeat.set(1, 9);

    // Bump relief for the asphalt so the moving light grazes the surface.
    const bump = makeCanvas(128, 128, (ctx) => {
      ctx.fillStyle = "#808080";
      ctx.fillRect(0, 0, 128, 128);
      for (let i = 0; i < 6000; i++) {
        const v = 90 + Math.random() * 90;
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.fillRect(Math.random() * 128, Math.random() * 128, 1, 1);
      }
    });
    bump.repeat.set(4, 24);

    // Red / white racing kerb.
    const kerb = makeCanvas(16, 128, (ctx) => {
      for (let y = 0; y < 128; y += 32) {
        ctx.fillStyle = "#c01018";
        ctx.fillRect(0, y, 16, 16);
        ctx.fillStyle = "#e9edf4";
        ctx.fillRect(0, y + 16, 16, 16);
      }
    });
    kerb.repeat.set(1, 26);

    // Dark barrier wall with posts and a thin accent line up top.
    const barrier = makeCanvas(256, 64, (ctx) => {
      ctx.fillStyle = "#101216";
      ctx.fillRect(0, 0, 256, 64);
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      for (let x = 0; x < 256; x += 32) ctx.fillRect(x, 0, 3, 64);
      ctx.fillStyle = "rgba(213,0,28,0.5)";
      ctx.fillRect(0, 4, 256, 3);
    });
    barrier.repeat.set(26, 1);

    return { asphalt, bump, kerb, barrier };
  }, []);

  const mats = useMemo(() => {
    const asphalt = new THREE.MeshStandardMaterial({
      map: tex.asphalt,
      bumpMap: tex.bump,
      bumpScale: 0.04,
      roughness: 0.92,
      metalness: 0,
      transparent: true,
      opacity: 0,
    });
    const kerb = new THREE.MeshStandardMaterial({
      map: tex.kerb,
      roughness: 0.6,
      metalness: 0,
      transparent: true,
      opacity: 0,
    });
    const barrier = new THREE.MeshStandardMaterial({
      map: tex.barrier,
      roughness: 0.8,
      metalness: 0,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    return { asphalt, kerb, barrier };
  }, [tex]);

  useFrame((_, dt) => {
    const d = Math.min(dt, 1 / 30);
    const off = useScene.getState().progress;

    let target = 0;
    if (off > RANGE[0] && off < RANGE[1]) {
      const t = (off - RANGE[0]) / (RANGE[1] - RANGE[0]);
      target = Math.min(1, Math.min(t, 1 - t) * 4);
    }
    op.current = THREE.MathUtils.damp(op.current, target, 6, d);

    const visible = op.current > 0.01;
    if (group.current) group.current.visible = visible;
    const dw = op.current > 0.6;
    mats.asphalt.opacity = op.current;
    mats.kerb.opacity = op.current;
    mats.barrier.opacity = op.current * 0.9;
    mats.asphalt.depthWrite = dw;

    if (visible) {
      const s = d * SCROLL;
      tex.asphalt.offset.y -= s;
      tex.bump.offset.y -= s * 6;
      tex.kerb.offset.y -= s;
      tex.barrier.offset.x -= s;
    }
  });

  return (
    <group ref={group} rotation={[0, HEADING, 0]} visible={false}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow material={mats.asphalt}>
        <planeGeometry args={[9, LENGTH]} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.25, 0.02, 0]} material={mats.kerb}>
        <planeGeometry args={[0.5, LENGTH]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4.25, 0.02, 0]} material={mats.kerb}>
        <planeGeometry args={[0.5, LENGTH]} />
      </mesh>

      <mesh rotation={[0, Math.PI / 2, 0]} position={[-4.85, 0.27, 0]} material={mats.barrier}>
        <planeGeometry args={[LENGTH, 0.55]} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]} position={[4.85, 0.27, 0]} material={mats.barrier}>
        <planeGeometry args={[LENGTH, 0.55]} />
      </mesh>
    </group>
  );
}
