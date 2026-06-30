"use client";

import { useEffect, useRef } from "react";

import { useScene } from "@/lib/store";

/** "Scroll to disassemble" cue that fades away once the user starts scrolling. */
export default function ScrollHint() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const apply = (p: number) => {
      if (ref.current) ref.current.style.opacity = p > 0.015 ? "0" : "1";
    };
    apply(useScene.getState().progress);
    return useScene.subscribe((s) => apply(s.progress));
  }, []);

  return (
    <div ref={ref} className="scroll-hint">
      <span className="scroll-hint__label">Scroll to disassemble</span>
      <span className="scroll-hint__line" />
    </div>
  );
}
