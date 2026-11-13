import assert from "node:assert/strict";
import { test } from "node:test";
import { LIBRARY_ROUTES } from "../lib/routes";
import {
  buildStages,
  buildStations,
  createPaletteBlender,
  STAGES,
  STATIONS,
  STATION_REACH,
  stageIndexAt,
  stationIndexAt,
} from "./stage-math";
import { STAGE_CONFIG } from "./stages";

test("stages cover the run from 0 to 1 with no gaps", () => {
  assert.equal(STAGES[0].start, 0);
  assert.equal(STAGES.at(-1)?.end, 1);
  for (let index = 1; index < STAGES.length; index += 1) {
    assert.equal(STAGES[index].start, STAGES[index - 1].end);
  }
});

test("the run is start line, four stages and the jetty", () => {
  assert.deepEqual(STAGES.map((stage) => stage.key), ["start", "connect", "preserve", "grow", "sail", "jetty"]);
});

test("every library route has exactly one aid station", () => {
  assert.deepEqual(
    STATIONS.map((station) => station.href).sort(),
    LIBRARY_ROUTES.map((route) => route.href).sort(),
  );
});

test("aid stations never overlap", () => {
  for (let index = 1; index < STATIONS.length; index += 1) {
    assert.ok(STATIONS[index].at - STATIONS[index - 1].at > STATION_REACH * 2);
  }
});

test("each station is found at its own position", () => {
  for (const station of STATIONS) {
    assert.equal(stationIndexAt(station.at), station.index);
    assert.equal(stageIndexAt(station.at), station.stage.index);
  }
  assert.equal(stationIndexAt(0), -1);
});

test("the palette is exact mid-stage and brightens from night to golden hour", () => {
  const paletteAt = createPaletteBlender();
  const heights = STAGES.map((stage) => paletteAt((stage.start + stage.end) / 2).sunHeight);
  assert.deepEqual(heights, STAGES.map((stage) => stage.palette.sunHeight));
  assert.deepEqual(heights, heights.toSorted((a, b) => a - b));
  assert.deepEqual(paletteAt(0).sky, [10 / 255, 10 / 255, 15 / 255]);
});

test("reordering and adding stages needs only data", () => {
  const extra = { ...STAGE_CONFIG[2], key: "extra", stations: [] };
  const reordered = [STAGE_CONFIG[0], STAGE_CONFIG[3], extra, STAGE_CONFIG[1], ...STAGE_CONFIG.slice(4), STAGE_CONFIG[2]];
  const stages = buildStages(reordered);
  const stations = buildStations(stages);
  assert.equal(stages.length, STAGE_CONFIG.length + 1);
  assert.equal(stages.at(-1)?.end, 1);
  assert.equal(stations.length, LIBRARY_ROUTES.length);
  assert.deepEqual(stations.map((station) => station.at), stations.map((station) => station.at).toSorted((a, b) => a - b));
  assert.equal(typeof createPaletteBlender(stages)(0.5).sunHeight, "number");
});
