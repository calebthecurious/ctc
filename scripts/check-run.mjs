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
// ?run forces the 3D run: headless Chromium renders in software, which the site treats as a weak device.
const home = await webglScripts("/?run");
check(home.found.length > 0, `/?run loads three.js lazily (${home.found.map((f) => `${(f.bytes / 1024).toFixed(0)} kB`).join(", ")})`);
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
await page.goto(base + "/?run");
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
const homeUrl = base + "/?run";
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

// --- 5. Fallbacks ------------------------------------------------------------
console.log("Fallbacks");
const ROUTES = ["/work", "/stories", "/thoughts", "/library", "/people", "/seasons", "/about"];
async function fallback(label, expectedReason, contextOptions, initScript) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, ...contextOptions });
  const tab = await ctx.newPage();
  if (initScript) await tab.addInitScript(initScript);
  let three = 0;
  tab.on("response", async (response) => {
    if (!response.url().includes(".js")) return;
    try {
      if ((await response.text()).includes("WebGLRenderer")) three += 1;
    } catch {}
  });
  await tab.goto(base + "/", { waitUntil: "networkidle" });
  const result = await tab.evaluate((routes) => {
    const visible = (element) => element.checkVisibility() && element.getClientRects().length > 0;
    const journey = document.querySelector(".journey-static");
    const links = [...journey.querySelectorAll("a")].filter(visible).map((link) => link.getAttribute("href"));
    return {
      mode: document.documentElement.dataset.runMode ?? "(not set)",
      reason: document.documentElement.dataset.runReason ?? "(not set)",
      canvases: document.querySelectorAll("canvas").length,
      stages: [...journey.querySelectorAll("section h2")].filter(visible).length,
      cards: routes.filter((route) => links.filter((href) => href === route).length >= 2).length,
      offer: visible(journey.querySelector(".run-anyway")),
    };
  }, ROUTES);
  check(
    result.reason === expectedReason && result.canvases === 0 && three === 0 && result.stages === 6 && result.cards === 7,
    `${label}: ${result.mode}/${result.reason}, ${result.stages} stages, all ${result.cards}/7 routes linked from a card and the index, no canvas, no three.js`,
  );
  return { tab, ctx, result };
}

const reduced = await fallback("reduced motion", "reduced-motion", { reducedMotion: "reduce" });
check(reduced.result.offer, "reduced motion: the 3D run is offered as a choice");
await reduced.tab.getByRole("button", { name: "Start the 3D run" }).click();
await reduced.tab.waitForSelector("canvas");
check(true, "reduced motion: choosing it starts the run");
await reduced.ctx.close();

const noWebgl = await fallback("no WebGL", "no-webgl", {}, () => {
  HTMLCanvasElement.prototype.getContext = () => null;
});
check(!noWebgl.result.offer, "no WebGL: the 3D run is not offered");
await noWebgl.ctx.close();

// Headless Chromium does not report its software renderer as a performance caveat, so
// that branch cannot be exercised here; low device memory takes the same path.
const weak = await fallback("weak device (2 GB of memory or less)", "weak-device", {}, () => {
  Object.defineProperty(navigator, "deviceMemory", { get: () => 1 });
});
await weak.ctx.close();

const noJs = await fallback("JavaScript off", "(not set)", { javaScriptEnabled: false });
await noJs.ctx.close();

// Phone: touch scrolling drives the run, and the pixel ratio is capped.
{
  const { devices } = require("playwright");
  const phone = await browser.newContext({ ...devices["iPhone 13"] });
  const tab = await phone.newPage();
  await tab.goto(base + "/?run");
  await tab.waitForSelector("canvas");
  await tab.waitForFunction(() => window.__run?.getState().frames > 5);
  const touch = await phone.newCDPSession(tab);
  await touch.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 195, y: 600 }] });
  for (let y = 580; y >= 200; y -= 20) {
    await touch.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 195, y }] });
    await tab.waitForTimeout(16);
  }
  await touch.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await tab.waitForTimeout(800);
  const moved = await tab.evaluate(() => window.__run.getState().progress);
  check(moved > 0, `phone: a touch swipe moves the run (progress ${moved.toFixed(3)})`);
  const ratio = await tab.evaluate(() => {
    const canvas = document.querySelector("canvas");
    return { used: canvas.width / canvas.clientWidth, device: devicePixelRatio };
  });
  check(ratio.used <= 1.5, `phone: canvas pixel ratio capped at ${ratio.used.toFixed(2)} (device reports ${ratio.device})`);
  check(await tab.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "phone: no horizontal scrolling");
  await phone.close();
}

// --- 6. Measurements ---------------------------------------------------------
console.log("Measurements");
const { gzipSync } = require("node:zlib");
async function jsWeight(route) {
  const tab = await context.newPage();
  const files = [];
  tab.on("response", async (response) => {
    if (!response.url().includes(".js")) return;
    try {
      const body = await response.body();
      files.push({ raw: body.length, gzip: gzipSync(body).length, three: body.includes("WebGLRenderer") });
    } catch {}
  });
  await tab.goto(base + route, { waitUntil: "networkidle" });
  await tab.waitForTimeout(1500);
  const sum = (list, key) => list.reduce((total, file) => total + file[key], 0);
  const kb = (bytes) => `${(bytes / 1024).toFixed(0)} kB`;
  const canvas = files.filter((file) => file.three);
  console.log(
    `  ${route.padEnd(9)} ${files.length} JS files, ${kb(sum(files, "gzip"))} gzip (${kb(sum(files, "raw"))} raw); of which canvas chunks: ${kb(sum(canvas, "gzip"))} gzip (${kb(sum(canvas, "raw"))} raw)`,
  );
  return tab;
}
await (await jsWeight("/?static")).close();
const idleTab = await jsWeight("/?run");
await idleTab.waitForTimeout(5000);
const cdp = await context.newCDPSession(idleTab);
await cdp.send("Performance.enable");
await cdp.send("HeapProfiler.collectGarbage");
const { metrics } = await cdp.send("Performance.getMetrics");
const heap = metrics.find((metric) => metric.name === "JSHeapUsedSize").value;
console.log(`  idle on the run after 5 s: JS heap ${(heap / 1048576).toFixed(1)} MB`);
check(heap < 300 * 1048576, "idle JS heap is under 300 MB");
await idleTab.close();

check(errors.length === 0, `no page errors${errors.length ? `: ${errors.join("; ")}` : ""}`);
await browser.close();

// Process memory, measured in a fresh browser with only the run open.
const solo = await chromium.launch({ args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"] });
const soloPage = await solo.newPage({ viewport: { width: 1280, height: 800 } });
await soloPage.goto(base + "/?run");
await soloPage.waitForSelector("canvas");
await soloPage.waitForTimeout(6000);
const { execSync } = require("node:child_process");
const processes = execSync("ps -eo rss,args | grep -E 'chrom|headless_shell' | grep -v grep").toString().trim().split("\n");
const mb = (pattern) =>
  Math.round(processes.filter((line) => line.includes(pattern)).reduce((sum, line) => sum + Number(line.trim().split(/\s+/)[0]), 0) / 1024);
console.log(`  idle process memory: page (renderer) ${mb("--type=renderer")} MB, graphics process ${mb("--type=gpu-process")} MB (software GL here)`);
check(mb("--type=renderer") < 300, "idle page process is under 300 MB");
await solo.close();

if (failed) process.exit(1);
console.log("\nScroll rig passes.");
