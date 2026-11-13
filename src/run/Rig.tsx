"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, type ReactNode } from "react";
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
    const portrait = size.width < size.height;
    const pullBack = (portrait ? 1.45 : 1) * (1 + lift * 0.5);
    camera.position.set(15 * pullBack, DRUM_RADIUS + 1.2 + 3.4 * pullBack + lift * 7, 6.5 * pullBack);
    // In portrait the lower part of the screen holds the cards, so aim lower and
    // further back along the trail: that puts the runner in the clear upper half.
    camera.lookAt(0, DRUM_RADIUS + (portrait ? -1.6 : 1.1) + lift * 1.5, (portrait ? -0.4 : -2.2) - lift * 7);
  });

  return null;
}

/** Compiles every shader up front, so nothing stalls a frame when it first scrolls into view. */
export function Precompile() {
  const gl = useThree((three) => three.gl);
  const scene = useThree((three) => three.scene);
  const camera = useThree((three) => three.camera);
  useEffect(() => {
    gl.compile(scene, camera);
  }, [gl, scene, camera]);
  return null;
}

const SAMPLE_FRAMES = 60;

/**
 * Lowers the pixel ratio a step at a time when frames run slow, and never
 * raises it again: a steady lower resolution beats one that flickers.
 */
export function AdaptiveResolution({ max }: { max: number }) {
  const setDpr = useThree((three) => three.setDpr);
  const sample = useRef({ frames: 0, time: 0, dpr: max });

  useFrame((_, delta) => {
    const current = sample.current;
    current.frames += 1;
    current.time += delta;
    if (current.frames < SAMPLE_FRAMES) return;
    const average = current.time / current.frames;
    current.frames = 0;
    current.time = 0;
    // Slower than about 40 fps over the sample: step down, to a floor of 1.
    if (average > 1 / 40 && current.dpr > 1) {
      current.dpr = Math.max(1, current.dpr - 0.25);
      setDpr(current.dpr);
    }
  });

  return null;
}
