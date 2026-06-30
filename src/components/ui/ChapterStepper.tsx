"use client";

import { useEffect, useRef } from "react";

import { useScene } from "@/lib/store";
import { chapterIndexAt, chapters } from "@/story/chapters";

/**
 * Minimal vertical chapter rail (right edge). Reflects scroll progress and lets
 * you jump to a section — a progress indicator, not a second navbar.
 */
export default function ChapterStepper() {
  const items = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    let prev = -1;
    const apply = (p: number) => {
      const idx = chapterIndexAt(p);
      if (idx === prev) return;
      prev = idx;
      items.current.forEach((el, i) =>
        el?.classList.toggle("is-active", i === idx),
      );
    };
    apply(useScene.getState().progress);
    return useScene.subscribe((s) => apply(s.progress));
  }, []);

  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="rail" aria-label="Chapters">
      {chapters.map((c, i) => (
        <button
          key={c.id}
          ref={(el) => {
            items.current[i] = el;
          }}
          className="rail__item"
          onClick={() => jump(c.id)}
          type="button"
          aria-label={c.nav}
        >
          <span className="rail__label">{c.nav}</span>
          <span className="rail__dot" />
        </button>
      ))}
    </nav>
  );
}
