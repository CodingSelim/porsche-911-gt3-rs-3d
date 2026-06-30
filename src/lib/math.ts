/**
 * Small, dependency-free math helpers used by the scroll-driven scene.
 */

export const clamp = (v: number, min = 0, max = 1): number =>
  v < min ? min : v > max ? max : v;

export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

/** Inverse lerp — where does `v` sit between `a` and `b` (0..1). */
export const invLerp = (a: number, b: number, v: number): number =>
  a === b ? 0 : clamp((v - a) / (b - a));

/** Remap `v` from one range to another. */
export const mapRange = (
  v: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number => lerp(outMin, outMax, invLerp(inMin, inMax, v));

export const smoothstep = (t: number): number => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

export const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const easeOutExpo = (t: number): number =>
  t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);

/**
 * Frame-rate independent damping toward a target. `lambda` is the smoothing
 * rate (higher = snappier). Mirrors three.js MathUtils.damp.
 */
export const damp = (
  current: number,
  target: number,
  lambda: number,
  dt: number,
): number => lerp(current, target, 1 - Math.exp(-lambda * dt));
