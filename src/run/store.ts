import { create } from "zustand";

/**
 * The single source of truth for the run. Scroll writes `target`; the rig
 * smooths it into `progress` once per frame; everything else reads `progress`
 * and `velocity`.
 *
 * Read with `useRunStore.getState()` inside the render loop: these values
 * change every frame and must not trigger React re-renders.
 */
interface RunState {
  /** Where the scroll position says we are, 0 to 1. Written by the scroll listener. */
  target: number;
  /** Smoothed progress, 0 to 1. This is the one value the world is driven by. */
  progress: number;
  /** Rate of change of `progress`, per second. Negative when running back. */
  velocity: number;
  /** Frames rendered so far. Used to verify that the loop pauses. */
  frames: number;
}

export const useRunStore = create<RunState>(() => ({
  target: 0,
  progress: 0,
  velocity: 0,
  frames: 0,
}));

/** Reads the document scroll position into `target`. */
export function syncTargetFromScroll(): void {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const target = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  useRunStore.setState({ target });
}
