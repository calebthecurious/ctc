"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import { MathUtils, type Group, type PerspectiveCamera } from "three";
import { currentPalette } from "./Atmosphere";
import { DRUM_RADIUS, PROGRESS_DAMPING, TRAIL_ARC } from "./config";
import { useRunStore } from "./store";

/**
 * Advances the store once per frame and turns the drum. Runs before every
 * other frame callback (priority -1) so they all see this frame's values.
 */
export function Rig({ children }: { children: ReactNode }) {
  const drum = useRef<Group>(null);

  useFrame((_, delta) => {
    const state = useRunStore.getState();
    // Clamp delta so a long pause (hidden tab, slow frame) cannot cause a jump.
    const dt = Math.min(delta, 0.1);
    let progress = MathUtils.damp(state.progress, state.target, PROGRESS_DAMPING, dt);
    if (Math.abs(state.target - progress) < 1e-5) progress = state.target;
    const velocity = dt > 0 ? (progress - state.progress) / dt : 0;
    useRunStore.setState({ progress, velocity, frames: state.frames + 1 });
    if (drum.current) drum.current.rotation.x = progress * TRAIL_ARC;
  }, -1);

  return <group ref={drum}>{children}</group>;
}

/**
 * Camera looking at the runner. Pulls back on narrow screens to keep him in
 * frame, and lifts up and out as the stage palette's `cameraLift` rises.
 */
export function CameraRig() {
  const camera = useThree((three) => three.camera as PerspectiveCamera);
  const size = useThree((three) => three.size);

  useFrame(() => {
    const lift = MathUtils.smootherstep(currentPalette().cameraLift, 0, 1);
    const pullBack = (size.width < size.height ? 1.45 : 1) * (1 + lift * 0.5);
    camera.position.set(15 * pullBack, DRUM_RADIUS + 1.2 + 3.4 * pullBack + lift * 7, 6.5 * pullBack);
    camera.lookAt(0, DRUM_RADIUS + 1.1 + lift * 1.5, -2.2 - lift * 7);
  });

  return null;
}
