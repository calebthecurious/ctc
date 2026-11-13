import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { MathUtils } from "three";
import { FULL_SPEED } from "../config";
import { useRunStore } from "../store";

export interface Gait {
  /** 0 when standing, 1 at a full run. Eased, so he settles into idle. */
  effort: number;
  /** Stride phase in radians. Advances faster the faster the scroll. */
  phase: number;
  /** Direction of travel: 1 forward, -1 back. Eased through 0 as he turns. */
  facing: number;
  /** Seconds since mount, for idle breathing. */
  time: number;
}

/**
 * Turns scroll velocity into a gait. Both the placeholder and the GLB runner
 * read this, so they respond to scroll in the same way.
 */
export function useGait(onFrame: (gait: Gait, delta: number) => void) {
  const gait = useRef<Gait>({ effort: 0, phase: 0, facing: 1, time: 0 });

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const { velocity } = useRunStore.getState();
    const speed = Math.min(1, Math.abs(velocity) / FULL_SPEED);
    const current = gait.current;

    // Rise quickly, settle slowly: he keeps a stride or two after the scroll stops.
    current.effort = MathUtils.damp(current.effort, speed, speed > current.effort ? 9 : 3.5, dt);
    // Cadence from about 1.3 to 3 strides per second.
    const cadence = MathUtils.lerp(1.3, 3, current.effort);
    current.phase += dt * cadence * Math.PI * 2 * Math.min(1, current.effort * 4);
    if (Math.abs(velocity) > FULL_SPEED * 0.04) {
      current.facing = MathUtils.damp(current.facing, Math.sign(velocity), 10, dt);
    }
    current.time += dt;
    onFrame(current, dt);
  });
}
