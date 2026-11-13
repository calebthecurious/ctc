"use client";

import { RunExperience } from "./RunExperience";
import { RunOverlay } from "./RunOverlay";
import { useRunMode } from "./useRunMode";

/** Mounts the 3D run only for visitors who should get it. Otherwise renders nothing. */
export function RunRoot({ hasRunnerModel }: { hasRunnerModel: boolean }) {
  if (useRunMode() !== "run") return null;
  return (
    <>
      <RunOverlay />
      <RunExperience hasRunnerModel={hasRunnerModel} />
    </>
  );
}
