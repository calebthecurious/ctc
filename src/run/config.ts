/** Tunable constants for the run. World units are roughly metres. */

/** Height of the scroll track in viewport heights. Scroll is distance. */
export const SCROLL_LENGTH_VH = 900;

/** Radius of the drum the world sits on. Larger means a flatter horizon. */
export const DRUM_RADIUS = 30;
/** Width of the drum, across the trail. */
export const DRUM_WIDTH = 16;
/** How far round the drum the trail runs from progress 0 to 1, in radians. */
export const TRAIL_ARC = Math.PI * 1.8;

/** How quickly the smoothed progress chases the scroll position. Higher is snappier. */
export const PROGRESS_DAMPING = 5;
/** Progress per second that counts as a full-speed run. */
export const FULL_SPEED = 0.07;

/** Path of the optional runner model, relative to /public. */
export const RUNNER_MODEL_PATH = "/models/runner.glb";

export const COLORS = {
  base: "#0a0a0f",
  accent: "#00d9c0",
  // PLACEHOLDER: greybox colours. Stage palettes replace these in Step 4.
  ground: "#2a2a35",
  prop: "#4a4a5a",
  runner: "#c8c8d4",
} as const;
