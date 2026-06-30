"use client";

import { useEffect, useRef, useState } from "react";

import { useScene } from "@/lib/store";
import { chapterIndexAt, chapters } from "@/story/chapters";

const LINKS = [
  { id: "teardown", label: "Teardown" },
  { id: "aero", label: "Aero" },
  { id: "powertrain", label: "Engine" },
  { id: "chassis", label: "Chassis" },
  { id: "order", label: "Order" },
];

/** Slim navigation with a glass backdrop on scroll and an active-section mark. */
export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const links = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let prev = "";
    const apply = (p: number) => {
      const id = chapters[chapterIndexAt(p)].id;
      if (id === prev) return;
      prev = id;
      links.current.forEach((el, i) =>
        el?.classList.toggle("is-active", LINKS[i].id === id),
      );
    };
    apply(useScene.getState().progress);
    return useScene.subscribe((s) => apply(s.progress));
  }, []);

  return (
    <header className={`nav${scrolled ? " is-scrolled" : ""}`}>
      <a className="nav__brand" href="#hero">
        <span className="nav__sq" />
        GT3 RS
      </a>

      <nav className="nav__links" aria-label="Sections">
        {LINKS.map((l, i) => (
          <a
            key={l.id}
            ref={(el) => {
              links.current[i] = el;
            }}
            className="nav__link"
            href={`#${l.id}`}
          >
            {l.label}
          </a>
        ))}
      </nav>

      <div className="nav__right">
        <a className="pill pill--sm pill--primary" href="#order">
          Configure <span className="pill__arrow">→</span>
        </a>
      </div>
    </header>
  );
}
