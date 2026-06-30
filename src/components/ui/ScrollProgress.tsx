"use client";

import { useEffect, useRef } from "react";

import { useScene } from "@/lib/store";

/** Thin scroll-progress bar pinned to the very top of the page. */
export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const apply = (p: number) => {
      if (ref.current) ref.current.style.transform = `scaleX(${p})`;
    };
    apply(useScene.getState().progress);
    return useScene.subscribe((s) => apply(s.progress));
  }, []);

  return (
    <div className="topbar">
      <div ref={ref} className="topbar__fill" />
    </div>
  );
}
