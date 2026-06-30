"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";

import Scene from "./scene/Scene";
import ChapterStepper from "./ui/ChapterStepper";
import LoadingScreen from "./ui/LoadingScreen";
import Reveal from "./ui/Reveal";
import ScrollHint from "./ui/ScrollHint";
import ScrollProgress from "./ui/ScrollProgress";
import SiteHeader from "./ui/SiteHeader";
import SmoothScroll from "./ui/SmoothScroll";
import SpeedStreaks from "./ui/SpeedStreaks";
import StorySections from "./ui/StorySections";
import TeardownHUD from "./ui/TeardownHUD";

/**
 * The page is a real, vertically scrolling marketing site. A fixed WebGL layer
 * sits behind the content and the car teardown is driven off native scroll, so
 * the 3D reads as part of the layout rather than a model parked under text.
 */
export default function Experience() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      {/* Fixed 3D layer — pinned behind the page, pointer-events off. */}
      <div className="canvas-layer">
        {mounted && (
          <Canvas
            shadows
            dpr={[1, 2]}
            gl={{
              alpha: true,
              antialias: true,
              powerPreference: "high-performance",
            }}
            camera={{ position: [0, 1.18, 9.1], fov: 34, near: 0.1, far: 100 }}
            eventSource={
              typeof document !== "undefined" ? document.body : undefined
            }
            eventPrefix="client"
          >
            <Scene />
          </Canvas>
        )}
      </div>

      {mounted && <SmoothScroll />}
      {mounted && <Reveal />}
      {mounted && <SpeedStreaks />}

      <ScrollProgress />
      <SiteHeader />

      <div className="page">
        <div id="story">
          <StorySections />
        </div>
      </div>

      {mounted && (
        <>
          <ChapterStepper />
          <TeardownHUD />
          <ScrollHint />
        </>
      )}

      <LoadingScreen />
    </>
  );
}
