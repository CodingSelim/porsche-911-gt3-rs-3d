"use client";

import { useEffect, useRef } from "react";

import { useScene } from "@/lib/store";
import { chapterIndexAt, chapters } from "@/story/chapters";

const total = String(chapters.length).padStart(2, "0");

/**
 * Quiet status readout (bottom-left): the section you're in and where it sits
 * in the sequence. A discreet instrument label, not a dashboard.
 */
export default function SectionStatus() {
  const root = useRef<HTMLDivElement | null>(null);
  const num = useRef<HTMLSpanElement | null>(null);
  const name = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    let prev = -1;
    const apply = (p: number) => {
      const idx = chapterIndexAt(p);
      if (root.current) root.current.style.opacity = p > 0.015 && p < 0.985 ? "1" : "0";
      if (idx === prev) return;
      prev = idx;
      const c = chapters[idx];
      if (num.current) num.current.textContent = String(idx + 1).padStart(2, "0");
      if (name.current) name.current.textContent = c.nav;
    };
    apply(useScene.getState().progress);
    return useScene.subscribe((s) => apply(s.progress));
  }, []);

  return (
    <div ref={root} className="status" style={{ opacity: 0 }}>
      <span className="status__dot" />
      <span ref={num} className="status__num">
        01
      </span>
      <span className="status__sep">/ {total}</span>
      <span ref={name} className="status__name">
        Overview
      </span>
    </div>
  );
}
