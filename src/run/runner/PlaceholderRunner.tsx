"use client";

import { useRef } from "react";
import type { Group } from "three";
import { COLORS } from "../config";
import { useGait } from "./useGait";

// PLACEHOLDER: a figure built from primitives with a procedural run cycle.
// Replaced automatically when /public/models/runner.glb exists.

const HIP_HEIGHT = 0.86;
const LEG = 0.43; // length of each leg segment
const ARM = 0.3; // length of each arm segment

function Limb({ length, thickness }: { length: number; thickness: number }) {
  return (
    <mesh position={[0, -length / 2, 0]}>
      <boxGeometry args={[thickness, length, thickness]} />
      <meshLambertMaterial color={COLORS.runner} />
    </mesh>
  );
}

export default function PlaceholderRunner() {
  const root = useRef<Group>(null);
  const body = useRef<Group>(null);
  const hips = useRef<(Group | null)[]>([]);
  const knees = useRef<(Group | null)[]>([]);
  const shoulders = useRef<(Group | null)[]>([]);
  const elbows = useRef<(Group | null)[]>([]);

  useGait(({ effort, phase, facing, time }) => {
    if (!root.current || !body.current) return;
    // Turn to face the direction of travel. The figure is built facing -Z.
    root.current.rotation.y = (1 - facing) * (Math.PI / 2);

    const breath = Math.sin(time * 1.6) * 0.008 * (1 - effort);
    body.current.position.y = HIP_HEIGHT + Math.abs(Math.sin(phase)) * 0.07 * effort + breath;
    body.current.rotation.x = -0.22 * effort; // lean into the run

    for (const side of [0, 1]) {
      const swing = Math.sin(phase + side * Math.PI);
      const lift = Math.cos(phase + side * Math.PI);
      const hip = hips.current[side];
      const knee = knees.current[side];
      const shoulder = shoulders.current[side];
      const elbow = elbows.current[side];
      // Negative X rotation swings a limb forward (toward -Z).
      if (hip) hip.rotation.x = -swing * 0.95 * effort;
      if (knee) knee.rotation.x = (0.25 + Math.max(0, lift) * 1.5) * effort;
      if (shoulder) shoulder.rotation.x = swing * 0.9 * effort;
      if (elbow) elbow.rotation.x = -(0.15 + 1.25 * effort);
    }
  });

  return (
    <group ref={root}>
      <group ref={body} position={[0, HIP_HEIGHT, 0]}>
        {/* Torso and head */}
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.34, 0.6, 0.2]} />
          <meshLambertMaterial color={COLORS.runner} />
        </mesh>
        <mesh position={[0, 0.76, 0]}>
          <sphereGeometry args={[0.13, 12, 10]} />
          <meshLambertMaterial color={COLORS.runner} />
        </mesh>
        {/* Headlamp: the accent glow that leads the run */}
        <mesh position={[0, 0.8, -0.13]}>
          <sphereGeometry args={[0.035, 8, 6]} />
          <meshBasicMaterial color={COLORS.accent} />
        </mesh>

        {[-1, 1].map((sign, side) => (
          <group key={sign}>
            <group ref={(node) => void (shoulders.current[side] = node)} position={[sign * 0.23, 0.56, 0]}>
              <Limb length={ARM} thickness={0.085} />
              <group ref={(node) => void (elbows.current[side] = node)} position={[0, -ARM, 0]}>
                <Limb length={ARM} thickness={0.075} />
              </group>
            </group>
            <group ref={(node) => void (hips.current[side] = node)} position={[sign * 0.1, 0, 0]}>
              <Limb length={LEG} thickness={0.12} />
              <group ref={(node) => void (knees.current[side] = node)} position={[0, -LEG, 0]}>
                <Limb length={LEG} thickness={0.1} />
              </group>
            </group>
          </group>
        ))}
      </group>
    </group>
  );
}
