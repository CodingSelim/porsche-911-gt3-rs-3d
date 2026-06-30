"use client";

import { Environment, Lightformer } from "@react-three/drei";

/**
 * Studio lighting for the car. The directional lights carve out shadows and
 * highlights; the Lightformer rig inside <Environment> is what the glossy paint
 * and metals actually reflect — long soft strips like a real photo studio.
 */
export default function Lighting() {
  return (
    <>
      <ambientLight intensity={0.18} />

      {/* Key light — also the shadow caster. */}
      <directionalLight
        position={[6, 9, 6]}
        intensity={2.6}
        color="#fff6ee"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[-6, 6, 6, -6, 0.1, 30]}
        />
      </directionalLight>

      {/* Cool rim light from behind for separation against the black void. */}
      <directionalLight position={[-7, 5, -6]} intensity={1.3} color="#7d93ff" />

      <Environment resolution={512} frames={1}>
        <color attach="background" args={["#070708"]} />
        {/* Big soft top/back panel */}
        <Lightformer
          form="rect"
          intensity={3}
          position={[0, 6, -3]}
          scale={[12, 7, 1]}
          color="#ffffff"
        />
        {/* Side strips that streak across the bodywork */}
        <Lightformer
          form="rect"
          intensity={2.2}
          position={[-6, 2.5, 2]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[9, 4, 1]}
          color="#eef2ff"
        />
        <Lightformer
          form="rect"
          intensity={2.2}
          position={[6, 2.5, 2]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[9, 4, 1]}
          color="#fff4ec"
        />
        {/* Low front fill */}
        <Lightformer
          form="rect"
          intensity={1.1}
          position={[0, 1, 6]}
          scale={[8, 2, 1]}
          color="#ffffff"
        />
        {/* A whisper of guards-red accent in the reflections */}
        <Lightformer
          form="ring"
          intensity={1.5}
          position={[3.5, 3, 4]}
          scale={2.4}
          color="#d5001c"
        />
      </Environment>
    </>
  );
}
