"use client";

import { useSyncExternalStore } from "react";
import { detectRunMode, type RunMode } from "./mode";

const listeners = new Set<() => void>();

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  const redetect = () => {
    detectRunMode();
    onChange();
  };
  media.addEventListener("change", redetect);
  listeners.add(onChange);
  return () => {
    media.removeEventListener("change", redetect);
    listeners.delete(onChange);
  };
}

function snapshot(): RunMode {
  // The inline script has normally set this already. After a client-side
  // navigation to the home page it may not have run, so detect here.
  if (!document.documentElement.dataset.runMode) detectRunMode();
  return document.documentElement.dataset.runMode === "run" ? "run" : "static";
}

/** "static" on the server and until hydration; then whatever the device supports. */
export function useRunMode(): RunMode {
  return useSyncExternalStore(subscribe, snapshot, () => "static");
}

/** Switches to the 3D run at the visitor's request, overriding the automatic choice. */
export function startRun(): void {
  document.documentElement.dataset.runMode = "run";
  document.documentElement.dataset.runReason = "forced";
  window.scrollTo(0, 0);
  listeners.forEach((notify) => notify());
}
