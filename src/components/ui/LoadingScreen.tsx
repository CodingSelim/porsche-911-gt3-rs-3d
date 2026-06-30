"use client";

import { useProgress } from "@react-three/drei";
import { useEffect, useState } from "react";

/** Full-screen loader gating the reveal until the model + environment are ready. */
export default function LoadingScreen() {
  const { progress, active } = useProgress();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!active && progress >= 100) {
      const t = setTimeout(() => setHidden(true), 800);
      return () => clearTimeout(t);
    }
  }, [active, progress]);

  return (
    <div
      className="loader"
      style={{
        opacity: hidden ? 0 : 1,
        pointerEvents: hidden ? "none" : "auto",
      }}
    >
      <span className="eyebrow">Porsche · Motorsport</span>
      <div className="display display--lg">911 GT3 RS</div>

      <div className="loader__bar">
        <div className="loader__fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="loader__pct">
        {Math.round(progress)}% · Assembling components
      </div>
    </div>
  );
}
