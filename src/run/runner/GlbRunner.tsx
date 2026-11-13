"use client";

import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { MathUtils, type AnimationAction, type Group } from "three";
import { RUNNER_MODEL_PATH } from "../config";
import { useGait } from "./useGait";

/**
 * The real runner, loaded from /public/models/runner.glb. Plays the clip named
 * "run" (or the first clip) at a speed that follows scroll velocity, and blends
 * to a clip named "idle" if the model has one.
 */
export default function GlbRunner() {
  const root = useRef<Group>(null);
  const { scene, animations } = useGLTF(RUNNER_MODEL_PATH);
  const { actions, names } = useAnimations(animations, root);
  const run = useRef<AnimationAction | null>(null);
  const idle = useRef<AnimationAction | null>(null);

  // Actions must be looked up after mount: before that the mixer has no root to bind to.
  useEffect(() => {
    const find = (wanted: string) => names.find((name) => name.toLowerCase() === wanted);
    const runName = find("run") ?? names.find((name) => name.toLowerCase() !== "idle") ?? names[0];
    const idleName = find("idle");
    const runAction = (runName && actions[runName]) || null;
    const idleAction = (idleName && idleName !== runName && actions[idleName]) || null;
    runAction?.reset().play();
    idleAction?.reset().play();
    run.current = runAction;
    idle.current = idleAction;
    return () => {
      runAction?.stop();
      idleAction?.stop();
    };
  }, [actions, names]);

  useGait(({ effort, facing }) => {
    // The model faces +Z; the runner travels toward -Z.
    if (root.current) root.current.rotation.y = Math.PI - (1 - facing) * (Math.PI / 2);
    if (!run.current) return;
    if (idle.current) {
      run.current.setEffectiveWeight(effort);
      idle.current.setEffectiveWeight(1 - effort);
      run.current.setEffectiveTimeScale(MathUtils.lerp(0.6, 1.4, effort));
    } else {
      // No idle clip: slow the run clip to a stop instead.
      run.current.setEffectiveTimeScale(MathUtils.lerp(0, 1.4, effort));
    }
  });

  return (
    <group ref={root}>
      <primitive object={scene} />
    </group>
  );
}
