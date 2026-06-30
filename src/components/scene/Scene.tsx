"use client";

import { Suspense } from "react";

import CameraRig from "./CameraRig";
import CarModel from "./CarModel";
import Lighting from "./Lighting";
import Road from "./Road";
import Wind from "./Wind";

/**
 * Everything inside the WebGL canvas. The canvas is transparent — there is no
 * in-scene background or floor — so the car composites directly onto the page's
 * CSS background and reads as part of the layout. Fog (matched to the page
 * colour) lets far-flung exploded panels dissolve into the background.
 */
export default function Scene() {
  return (
    <>
      <fog attach="fog" args={["#0c0e13", 13, 40]} />

      <Lighting />

      <Suspense fallback={null}>
        <CarModel />
        <Road />
        <Wind />
      </Suspense>

      <CameraRig />
    </>
  );
}
