/** Derived stage data and blending. Pure functions: no three.js, safe on the server. */
import { LIBRARY_ROUTES, type LibraryRoute } from "@/lib/routes";
import { STAGE_CONFIG, type StageConfig, type StagePalette } from "./stages";

export interface Stage extends StageConfig {
  index: number;
  /** Progress at which the stage starts and ends, 0 to 1. */
  start: number;
  end: number;
}

export interface Station extends LibraryRoute {
  index: number;
  stage: Stage;
  /** Progress at which the runner reaches the station, 0 to 1. */
  at: number;
}

/** How close, in progress, the runner must be for a station's card to show. */
export const STATION_REACH = 0.028;

export function buildStages(config: readonly StageConfig[]): Stage[] {
  const total = config.reduce((sum, stage) => sum + stage.length, 0);
  let cursor = 0;
  return config.map((stage, index) => {
    const start = cursor / total;
    cursor += stage.length;
    return { ...stage, index, start, end: index === config.length - 1 ? 1 : cursor / total };
  });
}

export function buildStations(stages: readonly Stage[]): Station[] {
  return stages
    .flatMap((stage) =>
      stage.stations.map((station) => {
        const route = LIBRARY_ROUTES.find((candidate) => candidate.href === station.href);
        if (!route) throw new Error(`Stage "${stage.key}" has a station for unknown route ${station.href}`);
        return { ...route, stage, at: stage.start + station.at * (stage.end - stage.start) };
      }),
    )
    .sort((a, b) => a.at - b.at)
    .map((station, index) => ({ ...station, index }));
}

export const STAGES: readonly Stage[] = buildStages(STAGE_CONFIG);
export const STATIONS: readonly Station[] = buildStations(STAGES);

/** Index of the stage that contains `progress`. */
export function stageIndexAt(progress: number, stages: readonly Stage[] = STAGES): number {
  const index = stages.findIndex((stage) => progress < stage.end);
  return index === -1 ? stages.length - 1 : index;
}

/** Index of the station within reach of `progress`, or -1. */
export function stationIndexAt(progress: number, stations: readonly Station[] = STATIONS): number {
  return stations.findIndex((station) => Math.abs(progress - station.at) <= STATION_REACH);
}

export type Rgb = [red: number, green: number, blue: number];

/** A palette with colours as sRGB triples (0 to 1), ready to interpolate. */
export type BlendedPalette = {
  [K in keyof StagePalette]: StagePalette[K] extends string ? Rgb : number;
};

function parseHex(hex: string): Rgb {
  const value = Number.parseInt(hex.slice(1), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

function parsePalette(palette: StagePalette): BlendedPalette {
  return Object.fromEntries(
    Object.entries(palette).map(([key, value]) => [key, typeof value === "string" ? parseHex(value) : value]),
  ) as BlendedPalette;
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * The palette at `progress`. Each stage's palette is exact at the middle of the
 * stage and blends linearly toward its neighbours, so light changes continuously.
 */
export function createPaletteBlender(stages: readonly Stage[] = STAGES) {
  const stops = stages.map((stage) => ({
    at: (stage.start + stage.end) / 2,
    palette: parsePalette(stage.palette),
  }));

  return function paletteAt(progress: number): BlendedPalette {
    const next = stops.findIndex((stop) => progress < stop.at);
    if (next === 0) return stops[0].palette;
    if (next === -1) return stops[stops.length - 1].palette;
    const from = stops[next - 1];
    const to = stops[next];
    const t = (progress - from.at) / (to.at - from.at);
    const result = {} as Record<string, number | Rgb>;
    for (const key of Object.keys(from.palette) as (keyof BlendedPalette)[]) {
      const a = from.palette[key];
      const b = to.palette[key];
      result[key] =
        typeof a === "number"
          ? mix(a, b as number, t)
          : [mix(a[0], (b as Rgb)[0], t), mix(a[1], (b as Rgb)[1], t), mix(a[2], (b as Rgb)[2], t)];
    }
    return result as BlendedPalette;
  };
}
