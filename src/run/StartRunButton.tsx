"use client";

import { startRun } from "./useRunMode";

/** Shown in the static journey to visitors whose browser could draw the run. */
export function StartRunButton() {
  return (
    <button type="button" onClick={startRun} className="link">
      Start the 3D run
    </button>
  );
}
