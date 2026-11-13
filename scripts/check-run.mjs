/**
 * Verifies the scroll rig against a running production server.
 * Needs Playwright with Chromium available (not a project dependency):
 *   npm run build && npm run start, then: node scripts/check-run.mjs [baseUrl]
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const base = process.argv[2] ?? "http://localhost:3000";
let failed = false;
const check = (ok, message) => {
  if (!ok) failed = true;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${message}`);
};

const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"] });
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });

// --- 1. Where the WebGL code loads -----------------------------------------
console.log("Canvas chunk");
async function webglScripts(route) {
  const page = await context.newPage();
  const found = [];
  page.on("response", async (response) => {
    if (!response.url().includes(".js")) return;
    try {
      const body = await response.text();
      if (body.includes("WebGLRenderer")) found.push({ url: new URL(response.url()).pathname, bytes: body.length });
    } catch {}
  });
  await page.goto(base + route, { waitUntil: "networkidle" });
  const html = await (await fetch(base + route)).text();
  await page.close();
  return { found, html };
}
const home = await webglScripts("/");
check(home.found.length > 0, `/ loads three.js lazily (${home.found.map((f) => `${(f.bytes / 1024).toFixed(0)} kB`).join(", ")})`);
check(
  home.found.every((file) => !home.html.includes(file.url)),
  "three.js chunk is not referenced by the home page HTML (fetched after hydration)",
);
for (const route of ["/work", "/stories", "/thoughts", "/library", "/people", "/seasons", "/about"]) {
  const result = await webglScripts(route);
  check(result.found.length === 0, `${route} loads no three.js (including link prefetches)`);
}

// --- 2. Reversible, smooth scrolling ---------------------------------------
console.log("Scrolling");
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.goto(base + "/");
await page.waitForSelector("canvas");
await page.waitForFunction(() => window.__run?.getState().frames > 5);

const state = () => page.evaluate(() => window.__run.getState());
const settle = () => page.waitForFunction(() => {
  const s = window.__run.getState();
  return s.velocity === 0 && s.progress === s.target;
});
const stops = [0.25, 0.5, 0.75, 1, 0.75, 0.5, 0.25, 0];
const seen = [];
for (const stop of stops) {
  await page.evaluate((at) => {
    const max = document.documentElement.scrollHeight - innerHeight;
    window.scrollTo(0, Math.round(max * at));
  }, stop);
  // Wait for the scroll event to reach the store before waiting for the rig to settle.
  await page.waitForFunction((at) => Math.abs(window.__run.getState().target - at) < 0.001, stop);
  await settle();
  seen.push((await state()).progress);
}
console.log(`  progress at each stop: ${seen.map((value) => value.toFixed(4)).join("  ")}`);
check(
  [0, 1, 2].every((index) => seen[index] === seen[6 - index]) && seen[7] === 0 && seen[3] === 1,
  "progress is identical at the same scroll position, forward and back",
);

// Wheel through part of the run and measure frame pacing.
await page.evaluate(() => {
  window.__frames = [];
  let last = performance.now();
  let lastProgress = window.__run.getState().progress;
  const tick = (now) => {
    const progress = window.__run.getState().progress;
    window.__frames.push({ dt: now - last, step: Math.abs(progress - lastProgress) });
    last = now;
    lastProgress = progress;
    window.__raf = requestAnimationFrame(tick);
  };
  window.__raf = requestAnimationFrame(tick);
});
await page.mouse.move(640, 400);
for (let index = 0; index < 60; index += 1) {
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(50);
}
const during = await state();
check(during.velocity > 0, `runner is moving while scrolling (velocity ${during.velocity.toFixed(4)}/s)`);
await settle();
const frames = await page.evaluate(() => {
  cancelAnimationFrame(window.__raf);
  return window.__frames.slice(2);
});
const times = frames.map((frame) => frame.dt).sort((a, b) => a - b);
const mean = times.reduce((sum, value) => sum + value, 0) / times.length;
const p95 = times[Math.floor(times.length * 0.95)];
const biggestStep = Math.max(...frames.map((frame) => frame.step));
console.log(
  `  ${frames.length} frames, mean ${mean.toFixed(1)} ms (${(1000 / mean).toFixed(0)} fps), p95 ${p95.toFixed(1)} ms, worst ${times.at(-1).toFixed(1)} ms`,
);
check(biggestStep < 0.02, `no jumps: largest progress change in one frame is ${(biggestStep * 100).toFixed(2)}% of the run`);
check((await state()).velocity === 0, "runner returns to idle when scrolling stops (velocity 0)");

// --- 3. Render loop pauses when the tab is hidden ---------------------------
console.log("Hidden tab");
const setHidden = (hidden) =>
  page.evaluate((value) => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => value });
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => (value ? "hidden" : "visible") });
    document.dispatchEvent(new Event("visibilitychange"));
  }, hidden);
const framesIn = async (ms) => {
  const before = (await state()).frames;
  await page.waitForTimeout(ms);
  return (await state()).frames - before;
};
check((await framesIn(1000)) > 5, "frames render while visible");
await setHidden(true);
await page.waitForTimeout(200);
const hiddenFrames = await framesIn(1500);
check(hiddenFrames === 0, `0 frames rendered in 1.5 s while hidden (got ${hiddenFrames})`);
await setHidden(false);
await page.waitForTimeout(200);
check((await framesIn(1000)) > 5, "frames resume when visible again");

// --- 4. Stages, aid stations and the skip control ---------------------------
console.log("Stages and aid stations");
const goTo = async (at) => {
  await page.evaluate((value) => {
    const max = document.documentElement.scrollHeight - innerHeight;
    window.scrollTo(0, Math.round(max * value));
  }, at);
  await page.waitForFunction((value) => Math.abs(window.__run.getState().target - value) < 0.001, at);
  await settle();
  await page.waitForTimeout(650); // card fade
};
const homeUrl = base + "/";
const stations = await page.$$eval("[data-station]", (cards) =>
  cards.map((card) => ({ href: card.dataset.station, at: Number(card.dataset.at) })),
);
check(stations.length === 7, `7 aid stations in the page (${stations.map((s) => s.href).join(" ")})`);

const stageLabels = await page.$$eval('nav[aria-label="Stages of the run"] button', (buttons) =>
  buttons.map((button) => button.textContent),
);
check(stageLabels.length > 1, `stage indicator lists ${stageLabels.join(", ")}`);
await goTo(0);
const firstStage = await page.textContent('button[aria-current="step"]');
await goTo(1);
const lastStage = await page.textContent('button[aria-current="step"]');
check(firstStage === stageLabels[0] && lastStage === stageLabels.at(-1), `indicator follows the run (${firstStage} at 0, ${lastStage} at 1)`);

// Mouse: run to each station, click its card, land on the route.
let mouseOk = 0;
for (const station of stations) {
  await page.goto(homeUrl);
  await page.waitForFunction(() => window.__run?.getState().frames > 5);
  await goTo(station.at);
  const card = page.locator(`[data-station="${station.href}"]`);
  const opacity = await card.evaluate((element) => getComputedStyle(element).opacity);
  await card.click({ timeout: 5000 });
  await page.waitForURL(base + station.href);
  const heading = await page.textContent("h1");
  if (opacity === "1" && heading) mouseOk += 1;
  else console.log(`    ${station.href}: opacity ${opacity}, heading ${heading}`);
}
check(mouseOk === stations.length, `mouse: ${mouseOk}/${stations.length} cards appear at their station and open their route`);

// Keyboard: Tab from the top reaches every card link; focus runs there; Enter opens it.
await page.goto(homeUrl);
await page.waitForFunction(() => window.__run?.getState().frames > 5);
const reached = [];
for (let presses = 0; presses < 30 && reached.length < stations.length; presses += 1) {
  await page.keyboard.press("Tab");
  const href = await page.evaluate(() => document.activeElement?.closest("[data-station]")?.dataset.station ?? null);
  if (!href || reached.some((entry) => entry.href === href)) continue;
  const station = stations.find((entry) => entry.href === href);
  await page.waitForFunction((value) => Math.abs(window.__run.getState().target - value) < 0.001, station.at);
  await settle();
  await page.waitForTimeout(650);
  const progress = (await state()).progress;
  const opacity = await page.locator(`[data-station="${href}"]`).evaluate((element) => getComputedStyle(element).opacity);
  reached.push({ href, arrived: Math.abs(progress - station.at) < 0.001, visible: opacity === "1" });
}
check(
  reached.length === stations.length && reached.every((entry) => entry.arrived && entry.visible),
  `keyboard: Tab reaches ${reached.length}/${stations.length} cards, each runs to its station and shows`,
);
await page.keyboard.press("Enter");
await page.waitForURL(base + reached.at(-1).href);
check(true, `keyboard: Enter on the focused card opens ${reached.at(-1).href}`);

// Skip the run: keyboard only.
await page.goto(homeUrl);
await page.waitForFunction(() => window.__run?.getState().frames > 5);
await page.getByRole("button", { name: "Skip the run" }).focus();
await page.keyboard.press("Enter");
const indexLinks = await page.$$eval("dialog[open] a", (links) => links.map((link) => link.getAttribute("href")));
check(indexLinks.length === 7, `Skip the run opens an index of ${indexLinks.length} routes (${indexLinks.join(" ")})`);
await page.keyboard.press("Escape");
check((await page.$("dialog[open]")) === null, "Escape closes the index");
await page.keyboard.press("Enter");
await page.keyboard.press("Tab");
await page.keyboard.press("Enter");
await page.waitForURL(base + indexLinks[0]);
check(true, `keyboard: index link opens ${indexLinks[0]}`);

check(errors.length === 0, `no page errors${errors.length ? `: ${errors.join("; ")}` : ""}`);
await browser.close();
if (failed) process.exit(1);
console.log("\nScroll rig passes.");
