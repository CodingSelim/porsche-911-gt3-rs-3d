"use client";

import type { Chapter } from "@/story/chapters";
import { chapters } from "@/story/chapters";
import ShinyText from "@/components/ShinyText";

const SHINE = { color: "#ffffff", shineColor: "#ff0000", speed: 1.6, spread: 100 } as const;

const total = String(chapters.length).padStart(2, "0");

function MetricList({ chapter }: { chapter: Chapter }) {
  if (!chapter.metrics) return null;
  return (
    <div className="metrics">
      {chapter.metrics.map((m) => (
        <div className="metric" key={m.label}>
          <span className="metric__value">
            {m.value}
            {m.unit && <span className="metric__unit">{m.unit}</span>}
          </span>
          <span className="metric__label">{m.label}</span>
        </div>
      ))}
    </div>
  );
}

function SpecPanel({ chapter }: { chapter: Chapter }) {
  if (!chapter.specs) return null;
  return (
    <div className="panel">
      {chapter.specs.map((row) => (
        <div className="spec__row" key={row.label}>
          <span className="spec__label">{row.label}</span>
          <span className="spec__value">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

function Section({
  chapter,
  className,
  children,
}: {
  chapter: Chapter;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={chapter.id}
      className={className}
      style={{ minHeight: `${chapter.span * 100}svh` }}
    >
      <div className="section__sticky">
        <span className="ghost" aria-hidden>
          {chapter.ghost}
        </span>
        {children}
      </div>
    </section>
  );
}

function Hero({ chapter }: { chapter: Chapter }) {
  return (
    <Section chapter={chapter} className="section hero section--bottom-left">
      <div className="hero__content reveal">
        <span className="eyebrow">{chapter.kicker}</span>
        <h1 className="display display--xl">
          <ShinyText text={chapter.title} {...SHINE} />
        </h1>
        <p className="lede">{chapter.body}</p>
        <div className="cta-row">
          <a className="pill pill--primary" href="#order">
            Configure yours <span className="pill__arrow">→</span>
          </a>
          <a className="pill" href="#teardown">
            Explore the car
          </a>
        </div>
        <MetricList chapter={chapter} />
      </div>
    </Section>
  );
}

function Feature({ chapter, index }: { chapter: Chapter; index: number }) {
  const num = String(index + 1).padStart(2, "0");
  return (
    <Section chapter={chapter} className={`section section--${chapter.align}`}>
      <div className="section__inner reveal">
        <div className="index">
          <span className="index__num">{num}</span>
          <span className="index__rule" />
          <span>/ {total}</span>
        </div>
        <span className="eyebrow">{chapter.kicker}</span>
        <h2 className={`display ${chapter.titleClass ?? "display--md"}`}>
          <ShinyText text={chapter.title} {...SHINE} />
        </h2>
        {chapter.body && <p className="lede">{chapter.body}</p>}
        <MetricList chapter={chapter} />
        <SpecPanel chapter={chapter} />
      </div>
    </Section>
  );
}

function CallToAction({ chapter }: { chapter: Chapter }) {
  return (
    <Section chapter={chapter} className="section section--center">
      <div className="section__inner reveal">
        <span className="eyebrow eyebrow--muted">{chapter.kicker}</span>
        <h2 className={`display ${chapter.titleClass ?? "display--lg"}`}>
          <ShinyText text={chapter.title} {...SHINE} />
        </h2>
        {chapter.body && <p className="lede">{chapter.body}</p>}
        <div className="cta-row">
          <a className="pill pill--primary" href="#hero">
            Configure yours <span className="pill__arrow">→</span>
          </a>
          <a className="pill" href="#hero">
            Contact a specialist
          </a>
        </div>
      </div>
    </Section>
  );
}

/** The full vertical story: one real section per chapter, in scroll order. */
export default function StorySections() {
  return (
    <>
      {chapters.map((chapter, index) => {
        if (chapter.kind === "hero") return <Hero key={chapter.id} chapter={chapter} />;
        if (chapter.kind === "cta")
          return <CallToAction key={chapter.id} chapter={chapter} />;
        return <Feature key={chapter.id} chapter={chapter} index={index} />;
      })}
    </>
  );
}
