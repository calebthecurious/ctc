"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { Euler, Matrix4, Quaternion, Vector3, type InstancedMesh } from "three";
import { COLORS, DRUM_RADIUS, DRUM_WIDTH, TRAIL_ARC } from "./config";
import { onDrum, seededRandom } from "./placement";

// PLACEHOLDER: greybox world. Stage environments (GLB) replace this later.

const PROP_COUNT = 140;
const POST_COUNT = 40;

interface Placed {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

/** Writes a list of transforms into an instanced mesh once. */
function useInstances(items: Placed[]) {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const matrix = new Matrix4();
    const quaternion = new Quaternion();
    items.forEach((item, index) => {
      quaternion.setFromEuler(new Euler(...item.rotation));
      matrix.compose(new Vector3(...item.position), quaternion, new Vector3(...item.scale));
      mesh.setMatrixAt(index, matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [items]);
  return ref;
}

export function World() {
  const { boxes, cones, posts } = useMemo(() => {
    const random = seededRandom(7);
    const boxes: Placed[] = [];
    const cones: Placed[] = [];
    // Scatter props over the whole drum, either side of the trail.
    const full = (Math.PI * 2) / TRAIL_ARC;
    for (let index = 0; index < PROP_COUNT; index += 1) {
      const at = random() * full;
      // The camera sits on the +X side, so that side only gets low props:
      // nothing may stand between the camera and the runner.
      const near = random() < 0.3;
      const x = near ? 1.8 + random() * 2.6 : -(2 + random() * (DRUM_WIDTH / 2 - 2.8));
      const width = near ? 0.3 + random() * 0.5 : 0.6 + random() * 1.6;
      const height = near ? 0.15 + random() * 0.35 : 0.6 + random() * 3.2;
      const placed = { ...onDrum(at, x, height / 2), scale: [width, height, width] as Placed["scale"] };
      (random() < 0.6 ? boxes : cones).push(placed);
    }
    // Evenly spaced posts beside the trail make the distance readable.
    const posts: Placed[] = Array.from({ length: POST_COUNT }, (_, index) => ({
      ...onDrum(index / POST_COUNT * full, 0.9, 0.25),
      scale: [0.08, 0.5, 0.08],
    }));
    return { boxes, cones, posts };
  }, []);

  const boxRef = useInstances(boxes);
  const coneRef = useInstances(cones);
  const postRef = useInstances(posts);

  return (
    <>
      {/* The drum. Its axis is X, so the cylinder is laid on its side. */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[DRUM_RADIUS, DRUM_RADIUS, DRUM_WIDTH, 128, 1]} />
        <meshLambertMaterial color={COLORS.ground} />
      </mesh>
      {/* The trail line. */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[DRUM_RADIUS + 0.02, DRUM_RADIUS + 0.02, 0.5, 128, 1, true]} />
        <meshBasicMaterial color={COLORS.accent} transparent opacity={0.55} />
      </mesh>
      <instancedMesh ref={boxRef} args={[undefined, undefined, boxes.length]}>
        <boxGeometry />
        <meshLambertMaterial color={COLORS.prop} />
      </instancedMesh>
      <instancedMesh ref={coneRef} args={[undefined, undefined, cones.length]}>
        <coneGeometry args={[0.5, 1, 6]} />
        <meshLambertMaterial color={COLORS.prop} flatShading />
      </instancedMesh>
      <instancedMesh ref={postRef} args={[undefined, undefined, posts.length]}>
        <boxGeometry />
        <meshBasicMaterial color={COLORS.accent} />
      </instancedMesh>
    </>
  );
}
