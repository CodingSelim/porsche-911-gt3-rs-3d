"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";

import { useScene } from "@/lib/store";

/**
 * Momentum smooth-scroll (Lenis). The page glides to its target instead of
 * snapping, and the same eased scroll position feeds the 3D — so the DOM and the
 * car move with one continuous, spring-like motion (the musée feel). Replaces
 * the raw scroll driver.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.085, // lower = smoother glide
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    const updateProgress = () => {
      const el = document.getElementById("story");
      const top = el ? el.offsetTop : 0;
      const height = el ? el.offsetHeight : document.body.scrollHeight;
      const max = Math.max(1, height - window.innerHeight);
      const p = Math.min(1, Math.max(0, (window.scrollY - top) / max));
      useScene.getState().setProgress(p);
    };

    lenis.on("scroll", updateProgress);

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    updateProgress();

    // Smooth in-page anchor navigation through Lenis.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.('a[href^="#"]');
      const href = a?.getAttribute("href");
      if (!href || href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: 0, duration: 1.1 });
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, []);

  return null;
}
