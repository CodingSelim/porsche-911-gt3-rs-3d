import { lerp, smoothstep } from "@/lib/math";

export type Align = "center" | "bottom-left" | "left" | "right";
export type ChapterKind = "hero" | "feature" | "cta";
/** Special scroll-driven motion for a chapter. */
export type Motion = "showcase" | "drive" | "tub" | "track";

/** Car pose for a chapter — driven entirely by scroll, never by free-running time. */
export interface Stage {
  x: number;
  y: number;
  z: number;
  ry: number;
  s: number;
  rx?: number;
  rz?: number;
}

export interface SpecRow {
  label: string;
  value: string;
}

export interface Metric {
  value: string;
  unit?: string;
  label: string;
}

export interface Chapter {
  id: string;
  nav: string;
  kind: ChapterKind;
  ghost: string;
  /** Section height in viewport units — bigger = more scroll room for motion. */
  span: number;
  motion?: Motion;
  /** Disassembly amount (0 assembled, 1 panels apart). */
  explode: number;
  stage: Stage;
  /** For `showcase` motion — the part lifted out and rotated, by name substring. */
  focus?: { part: string };
  align: Align;
  kicker?: string;
  title: string;
  titleClass?: string;
  body?: string;
  specs?: SpecRow[];
  metrics?: Metric[];
  cta?: boolean;
}

/*
 * Real Porsche 911 GT3 RS (992.1): 4.0 L NA flat-six · 525 PS @ 8 500 rpm ·
 * 465 Nm @ 6 300 · 9 000 redline · 7-spd PDK · 0–100 3.2 s · 296 km/h ·
 * 1 450 kg · 860 kg downforce · active DRS · PCCB 410/390 · centre-lock ·
 * Nürburgring 6:49.328 · from $225,250.
 */
export const chapters: Chapter[] = [
  {
    id: "hero",
    nav: "Overview",
    kind: "hero",
    ghost: "RENNSPORT",
    span: 1,
    explode: 0,
    stage: { x: 0.15, y: 0, z: 0, ry: -0.62, s: 1.0 },
    align: "bottom-left",
    kicker: "Porsche · Motorsport · Type 992",
    title: "911\nGT3 RS",
    titleClass: "display--xl",
    body: "A naturally aspirated 4.0-litre flat-six that climbs to 9,000 rpm, wrapped in bodywork shaped first for the air. The most track-focused 911 Porsche has ever series-produced.",
    metrics: [
      { value: "525", unit: "PS", label: "Power" },
      { value: "9 000", unit: "rpm", label: "Redline" },
      { value: "3.2", unit: "s", label: "0–100 km/h" },
      { value: "296", unit: "km/h", label: "Top speed" },
    ],
    cta: true,
  },
  {
    id: "teardown",
    nav: "Teardown",
    kind: "feature",
    ghost: "COMPONENT",
    span: 1,
    explode: 1,
    stage: { x: 0, y: 0.14, z: 0, ry: -0.72, s: 0.78, rx: -0.18 },
    align: "left",
    kicker: "The Teardown",
    title: "Engineered to\nthe component.",
    titleClass: "display--lg",
    body: "Wing, roof, hood, doors and fenders are carbon-fibre reinforced polymer — every panel drawn apart here so you can see how little of this car is decoration. Keep scrolling; we lift each system into frame.",
  },
  {
    id: "aero",
    nav: "Aero",
    kind: "feature",
    ghost: "DOWNFORCE",
    span: 1.6,
    motion: "showcase",
    explode: 1,
    stage: { x: 0, y: 0.05, z: 0, ry: -0.5, s: 0.85 },
    focus: { part: "carbon_wing" },
    align: "right",
    kicker: "Aerodynamics",
    title: "The swan-neck\nwing.",
    titleClass: "display--md",
    body: "Taller than the roof and mounted from above so airflow meets its efficient underside, the wing works with the front diffuser to give this the first active DRS on a series 911 — trimming drag on the straight, snapping back under braking.",
    specs: [
      { label: "Max downforce", value: "860 kg @ 285 km/h" },
      { label: "Rear wing", value: "Swan-neck · CFRP" },
      { label: "DRS", value: "F1-style, active" },
      { label: "Vs. 992 GT3", value: "≈ 2× downforce" },
    ],
  },
  {
    id: "powertrain",
    nav: "Engine",
    kind: "feature",
    ghost: "FLAT-SIX",
    span: 2.4,
    motion: "drive",
    explode: 0,
    stage: { x: 0, y: -0.04, z: 0.3, ry: -1.62, s: 1.02 },
    align: "left",
    kicker: "Powertrain",
    title: "9,000 rpm,\nand singing.",
    titleClass: "display--md",
    body: "No turbos, no hybrid — a 4.0-litre flat-six with individual throttle bodies, lifted from the 911 RSR race car. It revs to nine thousand and drives a 7-speed PDK. Scroll, and it gets up on the cams.",
    specs: [
      { label: "Engine", value: "4.0 L flat-six · NA" },
      { label: "Power", value: "525 PS @ 8 500 rpm" },
      { label: "Torque", value: "465 Nm @ 6 300 rpm" },
      { label: "Gearbox", value: "7-speed GT PDK" },
    ],
  },
  {
    id: "chassis",
    nav: "Chassis",
    kind: "feature",
    ghost: "FORGED",
    span: 1.6,
    motion: "showcase",
    explode: 1,
    stage: { x: 0, y: 0.05, z: 0, ry: 0.4, s: 0.85 },
    focus: { part: "chrome_wheels_20x9" },
    align: "right",
    kicker: "Chassis & Brakes",
    title: "Centre-lock.\nCarbon-ceramic.",
    titleClass: "display--md",
    body: "Forged centre-lock wheels keep rotating mass low; PCCB ceramic discs shed heat lap after lap. The dampers — even the anti-roll bars — adjust from the wheel on the move.",
    specs: [
      { label: "Front tyre", value: "275 / 35 ZR20" },
      { label: "Rear tyre", value: "335 / 30 ZR21" },
      { label: "Brakes", value: "PCCB 410 / 390 mm" },
      { label: "Adjust", value: "Wheel-mounted rotaries" },
    ],
  },
  {
    id: "cabin",
    nav: "Cabin",
    kind: "feature",
    ghost: "MONOCOQUE",
    span: 1.6,
    motion: "tub",
    explode: 1,
    stage: { x: 0, y: 0.34, z: 0, ry: -0.5, s: 1.62 },
    align: "left",
    kicker: "The Cockpit",
    title: "A cabin with\none job.",
    titleClass: "display--md",
    body: "Strip the car away and the point of it is left in mid-air — carbon bucket seats, Race-Tex where your hands fall, and a wheel ringed with rotaries for the dampers and DRS. Scroll to turn the cockpit through a full revolution.",
    specs: [
      { label: "Seats", value: "CFRP full buckets" },
      { label: "Trim", value: "Race-Tex / Alcantara" },
      { label: "Modes", value: "Wheel drive-mode dial" },
      { label: "Cluster", value: "Track-screen telemetry" },
    ],
  },
  {
    id: "proof",
    nav: "Proof",
    kind: "feature",
    ghost: "NORDSCHLEIFE",
    span: 1.6,
    motion: "track",
    explode: 0,
    stage: { x: 0.1, y: 0, z: 0, ry: -0.86, s: 1.0 },
    align: "bottom-left",
    kicker: "The Proof",
    title: "6:49.328.",
    titleClass: "display--xl",
    body: "More than 250 hours in the wind tunnel and 1,500 simulations resolve into one number — among the fastest laps ever set by a naturally aspirated production car around the Nordschleife.",
    metrics: [
      { value: "6:49", unit: "min", label: "Nürburgring" },
      { value: "860", unit: "kg", label: "Downforce" },
      { value: "1 450", unit: "kg", label: "Kerb weight" },
    ],
  },
  {
    id: "order",
    nav: "Order",
    kind: "cta",
    ghost: "APEX",
    span: 1,
    explode: 0,
    stage: { x: 0, y: -0.04, z: 0, ry: -0.62, s: 1.05 },
    align: "center",
    kicker: "Specification",
    title: "Build the one\nthat's yours.",
    titleClass: "display--lg",
    body: "From $225,250. Add the Weissach Package for magnesium wheels and even less weight — then configure a GT3 RS, or speak with a motorsport specialist.",
    cta: true,
  },
];

// ---- Scroll ranges derived from section spans ----------------------------
const totalSpan = chapters.reduce((a, c) => a + c.span, 0);
const mids: number[] = [];
{
  let cum = 0;
  for (const c of chapters) {
    const m = (cum + c.span / 2 - 0.5) / (totalSpan - 1);
    mids.push(Math.min(1, Math.max(0, m)));
    cum += c.span;
  }
}

/** Progress at which each section is centred in the viewport. */
export const chapterMids = mids;

/** [start, end] scroll range for each chapter (boundaries between midpoints). */
export const chapterRanges: [number, number][] = chapters.map((_, i) => {
  const start = i === 0 ? 0 : (mids[i - 1] + mids[i]) / 2;
  const end = i === chapters.length - 1 ? 1 : (mids[i] + mids[i + 1]) / 2;
  return [start, end];
});

/** Cumulative section offsets in span units — used to size the DOM sections. */
export const chapterSpans = chapters.map((c) => c.span);

export const chapterIndexAt = (off: number): number => {
  for (let i = 0; i < chapters.length; i++) {
    if (off <= chapterRanges[i][1]) return i;
  }
  return chapters.length - 1;
};

/** 0..1 progress within a chapter's own scroll range. */
export const localProgress = (off: number, i: number): number => {
  const [a, b] = chapterRanges[i];
  if (b <= a) return 0;
  return Math.min(1, Math.max(0, (off - a) / (b - a)));
};

const sampleField = (off: number, pick: (c: Chapter) => number): number => {
  if (off <= mids[0]) return pick(chapters[0]);
  const last = chapters.length - 1;
  if (off >= mids[last]) return pick(chapters[last]);
  for (let i = 0; i < last; i++) {
    if (off >= mids[i] && off <= mids[i + 1]) {
      const t = smoothstep((off - mids[i]) / (mids[i + 1] - mids[i]));
      return lerp(pick(chapters[i]), pick(chapters[i + 1]), t);
    }
  }
  return pick(chapters[last]);
};

export const sampleExplode = (off: number): number =>
  sampleField(off, (c) => c.explode);
