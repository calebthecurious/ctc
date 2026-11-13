/**
 * Decides whether a visitor gets the 3D run or the static journey.
 *
 * `detectRunMode` is also inlined into the page as a script (via toString), so
 * it runs before first paint. It must stay self-contained: no imports, no
 * references to anything outside its own body.
 */

export type RunMode = "run" | "static";
export type RunModeReason = "capable" | "forced" | "reduced-motion" | "no-webgl" | "weak-device";

export function detectRunMode(): void {
  const root = document.documentElement;
  const probe = (strict: boolean): boolean => {
    try {
      const canvas = document.createElement("canvas");
      const options = { failIfMajorPerformanceCaveat: strict };
      return Boolean(canvas.getContext("webgl2", options) || canvas.getContext("webgl", options));
    } catch {
      return false;
    }
  };
  const query = new URLSearchParams(window.location.search);
  const device = navigator as Navigator & { deviceMemory?: number };

  let mode = "run";
  let reason = "capable";
  if (!probe(false)) {
    mode = "static";
    reason = "no-webgl";
  } else if (query.has("run") || query.has("static")) {
    // ?run and ?static override the checks below, for testing and for visitors who ask.
    mode = query.has("run") ? "run" : "static";
    reason = "forced";
  } else if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    mode = "static";
    reason = "reduced-motion";
  } else if (
    // Software rendering, or very little memory or CPU.
    !probe(true) ||
    (device.deviceMemory !== undefined && device.deviceMemory <= 2) ||
    (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 2)
  ) {
    mode = "static";
    reason = "weak-device";
  }
  root.dataset.runMode = mode;
  root.dataset.runReason = reason;
}

/** Inline script source that sets `data-run-mode` on <html> before first paint. */
export const RUN_MODE_SCRIPT = `(${detectRunMode.toString()})()`;
