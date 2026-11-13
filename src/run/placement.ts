import { DRUM_RADIUS, TRAIL_ARC } from "./config";

/**
 * The drum's axis is X. The runner stands on top, at (0, DRUM_RADIUS, 0), and
 * runs toward -Z. The drum turns about X by `progress * TRAIL_ARC`, so a point
 * placed with `onDrum(at)` arrives under the runner when progress equals `at`.
 */
export function onDrum(at: number, x = 0, height = 0) {
  const angle = at * TRAIL_ARC;
  const radius = DRUM_RADIUS + height;
  return {
    position: [x, radius * Math.cos(angle), -radius * Math.sin(angle)] as [number, number, number],
    /** Stands the object upright on the surface. */
    rotation: [-angle, 0, 0] as [number, number, number],
  };
}

/** Small deterministic random generator, so the greybox looks the same every load. */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
