/**
 * The run, as data. This is the only file to edit to add, remove, reorder or
 * retune a stage or an aid station: every component reads from here.
 *
 * Stage lengths are relative weights; start and end progress are derived, so
 * nothing needs renumbering when the list changes.
 */

export interface StagePalette {
  /** Background colour. */
  sky: string;
  /** Fog colour and range, in world units from the camera. */
  fog: string;
  fogNear: number;
  fogFar: number;
  ground: string;
  prop: string;
  /** Sun disc and key light colour. */
  sun: string;
  sunIntensity: number;
  ambientIntensity: number;
  /** Sun height relative to the runner's feet. About -26 is the horizon. */
  sunHeight: number;
  /** 0 keeps the camera on the runner; 1 lifts it up and out. */
  cameraLift: number;
}

/** PLACEHOLDER: recipe for the greybox scenery of a stage. Real environments replace it. */
export interface StageGreybox {
  /** Props per unit of stage length. 0 leaves the stage bare. */
  density: number;
  /** Share of props that are cones instead of boxes, 0 to 1. */
  coneShare: number;
  height: [min: number, max: number];
  width: [min: number, max: number];
}

export interface StageStation {
  /** A route from LIBRARY_ROUTES. Its label and line come from there. */
  href: string;
  /** Position within the stage, 0 (stage start) to 1 (stage end). */
  at: number;
}

export interface StageConfig {
  key: string;
  /** Short name for the stage indicator. */
  label: string;
  /** Small line above the title, for example the decade. */
  kicker: string;
  title: string;
  line: string;
  /** Relative length of the stage along the trail. */
  length: number;
  palette: StagePalette;
  greybox: StageGreybox;
  /** Optional set piece, built by the matching entry in World's LANDMARKS. */
  landmark?: "gate" | "jetty";
  stations: StageStation[];
}

export const STAGE_CONFIG: readonly StageConfig[] = [
  {
    key: "start",
    label: "Start",
    kicker: "Start line · pre-dawn",
    title: "Caleb the Curious",
    line: "A self-taught developer, ultra trail runner and storyteller, chasing the sun one decade at a time. Scroll to run.",
    length: 0.6,
    palette: {
      sky: "#0a0a0f", fog: "#0a0a0f", fogNear: 14, fogFar: 44,
      ground: "#1b1b25", prop: "#2b2b39",
      sun: "#3a4a7a", sunIntensity: 0.15, ambientIntensity: 0.6, sunHeight: -45, cameraLift: 0,
    },
    greybox: { density: 60, coneShare: 0.8, height: [0.6, 2.6], width: [0.6, 1.6] },
    landmark: "gate",
    stations: [{ href: "/about", at: 0.6 }],
  },
  {
    key: "connect",
    label: "Connect",
    kicker: "Stage 1 · 30s",
    title: "Connect",
    line: "Technology that helps communities connect more seamlessly. Run clubs, events, and what I'm building now.",
    length: 1,
    palette: {
      sky: "#141b36", fog: "#141b36", fogNear: 16, fogFar: 50,
      ground: "#262b45", prop: "#3f4873",
      sun: "#8f9be0", sunIntensity: 0.7, ambientIntensity: 0.75, sunHeight: -24, cameraLift: 0,
    },
    greybox: { density: 130, coneShare: 0.05, height: [1.2, 5], width: [0.8, 1.8] },
    stations: [
      { href: "/work", at: 0.3 },
      { href: "/people", at: 0.75 },
    ],
  },
  {
    key: "preserve",
    label: "Preserve",
    kicker: "Stage 2 · 40s",
    title: "Preserve",
    line: "Health-tech. Life preservation and dementia are the problems I care about.",
    length: 1,
    palette: {
      sky: "#4d7f82", fog: "#4d7f82", fogNear: 20, fogFar: 60,
      ground: "#5f9186", prop: "#d3e6df",
      sun: "#ffe3c4", sunIntensity: 1.1, ambientIntensity: 0.9, sunHeight: -14, cameraLift: 0,
    },
    greybox: { density: 70, coneShare: 0.45, height: [0.5, 2.2], width: [0.8, 2.4] },
    stations: [
      { href: "/thoughts", at: 0.3 },
      { href: "/library", at: 0.75 },
    ],
  },
  {
    key: "grow",
    label: "Grow",
    kicker: "Stage 3 · 50s",
    title: "Grow",
    line: "Ag-tech. Society benefits when people grow some of the food they eat.",
    length: 1,
    palette: {
      sky: "#a5cfa8", fog: "#a5cfa8", fogNear: 22, fogFar: 66,
      ground: "#6f9a4e", prop: "#c98f4f",
      sun: "#fff1cc", sunIntensity: 1.5, ambientIntensity: 1, sunHeight: -4, cameraLift: 0,
    },
    greybox: { density: 110, coneShare: 0.25, height: [0.3, 1.4], width: [1.4, 3.2] },
    stations: [{ href: "/seasons", at: 0.5 }],
  },
  {
    key: "sail",
    label: "Sail",
    kicker: "Stage 4 · 60s",
    title: "Sail",
    line: "Sea preservation. Sailing and diving around the world with the experts I've met along the way.",
    length: 1,
    palette: {
      sky: "#f2bb66", fog: "#f2bb66", fogNear: 24, fogFar: 70,
      ground: "#d8b077", prop: "#f4e3c0",
      sun: "#ffd98a", sunIntensity: 1.8, ambientIntensity: 1.05, sunHeight: 6, cameraLift: 0,
    },
    greybox: { density: 40, coneShare: 0.6, height: [0.3, 1.8], width: [0.6, 1.8] },
    stations: [{ href: "/stories", at: 0.5 }],
  },
  {
    key: "jetty",
    label: "Jetty",
    kicker: "The jetty · golden hour",
    title: "Open sea",
    line: "The trail ends here. The run doesn't.",
    length: 0.6,
    palette: {
      sky: "#ffc873", fog: "#ffc873", fogNear: 26, fogFar: 80,
      ground: "#3b8fa0", prop: "#8a5a3a",
      sun: "#ffe6a8", sunIntensity: 2, ambientIntensity: 1.1, sunHeight: 10, cameraLift: 1,
    },
    greybox: { density: 0, coneShare: 0, height: [0, 0], width: [0, 0] },
    landmark: "jetty",
    stations: [],
  },
];
