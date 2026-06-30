"use client";

import { useEffect, useRef } from "react";

import { useScene } from "@/lib/store";
import { chapterRanges, chapters } from "@/story/chapters";

const RANGES = ["powertrain", "proof"]
  .map((id) => chapters.findIndex((c) => c.id === id))
  .filter((i) => i >= 0)
  .map((i) => chapterRanges[i]);

/** Motion streaks that fade in over the driving / track chapters. */
export default function SpeedStreaks() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const apply = (p: number) => {
      const el = ref.current;
      if (!el) return;
      let a = 0;
      for (const [start, end] of RANGES) {
        if (p > start && p < end) {
          const t = (p - start) / (end - start);
          a = Math.max(a, Math.min(1, Math.min(t, 1 - t) * 4));
        }
      }
      el.style.opacity = String(a);
    };
    apply(useScene.getState().progress);
    return useScene.subscribe((s) => apply(s.progress));
  }, []);

  return (
    <div ref={ref} className="streaks" aria-hidden>
      {Array.from({ length: 16 }).map((_, i) => (
        <span
          key={i}
          className="streaks__line"
          style={{
            top: `${5 + i * 6}%`,
            animationDelay: `${(i % 6) * 0.16}s`,
            animationDuration: `${0.85 + (i % 4) * 0.12}s`,
          }}
        />
      ))}
    </div>
  );
}
