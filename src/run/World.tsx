"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import {
  BoxGeometry,
  Euler,
  Matrix4,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Quaternion,
  Vector3,
  type InstancedMesh,
} from "three";
import { currentPalette, setRgb } from "./Atmosphere";
import { COLORS, DRUM_RADIUS, DRUM_WIDTH } from "./config";
import { onDrum, seededRandom } from "./placement";
import { STAGES, STATIONS, type Stage } from "./stage-math";

// PLACEHOLDER: greybox world built from each stage's `greybox` recipe.
// Stage environments (GLB) replace this later.

const POST_SPACING = 0.022; // progress between distance posts

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

/** Something placed on the drum at a progress value, standing upright. */
function OnDrum({ at, x = 0, children }: { at: number; x?: number; children: ReactNode }) {
  const { position, rotation } = onDrum(at, x);
  return (
    <group position={position} rotation={rotation}>
      {children}
    </group>
  );
}

// Shared by every set piece, so the scene needs only a handful of materials and one box.
const UNIT_BOX = new BoxGeometry(1, 1, 1);
const ACCENT_MATERIAL = new MeshBasicMaterial({ color: COLORS.accent });
const WOOD_MATERIAL = new MeshLambertMaterial({ color: "#8a5a3a" });

type Block = { position: [number, number, number]; size: [number, number, number] };

function Accent({ position, size }: Block) {
  return <mesh position={position} scale={size} geometry={UNIT_BOX} material={ACCENT_MATERIAL} />;
}

function Wood({ position, size }: Block) {
  return <mesh position={position} scale={size} geometry={UNIT_BOX} material={WOOD_MATERIAL} />;
}

/** PLACEHOLDER set pieces, one per `landmark` value a stage can name. */
const LANDMARKS: Record<NonNullable<Stage["landmark"]>, (stage: Stage) => ReactNode> = {
  // An arch over the trail at the start of the stage.
  gate: (stage) => (
    <OnDrum at={stage.start + 0.004}>
      <Accent position={[-1.1, 1.3, 0]} size={[0.1, 2.6, 0.1]} />
      <Accent position={[1.1, 1.3, 0]} size={[0.1, 2.6, 0.1]} />
      <Accent position={[0, 2.6, 0]} size={[2.3, 0.1, 0.1]} />
    </OnDrum>
  ),
  // Planks along the stage, and a boat waiting at its end.
  jetty: (stage) => {
    const planks = 26;
    return (
      <>
        {Array.from({ length: planks }, (_, index) => (
          <OnDrum key={index} at={stage.start + ((index + 0.5) / planks) * (stage.end - stage.start) * 0.94}>
            <Wood position={[0, 0.06, 0]} size={[1.8, 0.12, 0.62]} />
          </OnDrum>
        ))}
        <OnDrum at={stage.end}>
          <Wood position={[0, 0.02, -0.4]} size={[1.5, 0.3, 4.2]} />
          <Wood position={[0.8, 0.35, -0.4]} size={[0.12, 0.5, 4.2]} />
          <Wood position={[-0.8, 0.35, -0.4]} size={[0.12, 0.5, 4.2]} />
          <Wood position={[0, 2.4, -1.6]} size={[0.1, 4.4, 0.1]} />
          <mesh position={[0, 2.9, -0.75]}>
            <boxGeometry args={[0.04, 3, 1.6]} />
            <meshLambertMaterial color="#f4ead8" />
          </mesh>
        </OnDrum>
      </>
    );
  },
};

/** PLACEHOLDER aid station: a small tent and flag beside the trail. */
function AidStation({ at }: { at: number }) {
  return (
    <OnDrum at={at} x={-1.9}>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[1.5, 1.1, 1.5]} />
        <meshLambertMaterial color="#e8e8ee" />
      </mesh>
      <mesh position={[0, 1.45, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.25, 0.7, 4]} />
        <meshBasicMaterial color={COLORS.accent} />
      </mesh>
      <Accent position={[1.05, 1.4, 0]} size={[0.06, 2.8, 0.06]} />
      <Accent position={[1.05, 2.55, -0.3]} size={[0.04, 0.4, 0.6]} />
    </OnDrum>
  );
}

function scatter(): { boxes: Placed[]; cones: Placed[]; posts: Placed[] } {
  const random = seededRandom(7);
  const between = ([min, max]: [number, number]) => min + random() * (max - min);
  const boxes: Placed[] = [];
  const cones: Placed[] = [];

  for (const stage of STAGES) {
    const span = stage.end - stage.start;
    const count = Math.round(stage.greybox.density * span);
    for (let index = 0; index < count; index += 1) {
      const at = stage.start + random() * span;
      // The camera sits on the +X side, so that side only gets low props:
      // nothing may stand between the camera and the runner.
      const near = random() < 0.3;
      const x = near ? 1.8 + random() * 2.6 : -(3.2 + random() * (DRUM_WIDTH / 2 - 4));
      const width = between(stage.greybox.width) * (near ? 0.35 : 1);
      const height = near ? 0.15 + random() * 0.35 : between(stage.greybox.height);
      const placed = { ...onDrum(at, x, height / 2), scale: [width, height, width] as Placed["scale"] };
      (random() < stage.greybox.coneShare ? cones : boxes).push(placed);
    }
  }

  // Evenly spaced posts beside the trail make the distance readable.
  const posts: Placed[] = [];
  for (let at = POST_SPACING; at < STAGES[STAGES.length - 1].start; at += POST_SPACING) {
    posts.push({ ...onDrum(at, 0.9, 0.25), scale: [0.08, 0.5, 0.08] });
  }
  return { boxes, cones, posts };
}

export function World() {
  const { boxes, cones, posts } = useMemo(() => scatter(), []);
  const boxRef = useInstances(boxes);
  const coneRef = useInstances(cones);
  const postRef = useInstances(posts);
  const ground = useRef<MeshLambertMaterial>(null);
  const boxMaterial = useRef<MeshLambertMaterial>(null);
  const coneMaterial = useRef<MeshLambertMaterial>(null);

  // Only the scenery near the runner is visible, so one tint for all of it is enough.
  useFrame(() => {
    const palette = currentPalette();
    if (ground.current) setRgb(ground.current.color, palette.ground);
    if (boxMaterial.current) setRgb(boxMaterial.current.color, palette.prop);
    if (coneMaterial.current) setRgb(coneMaterial.current.color, palette.prop);
  });

  return (
    <>
      {/* The drum. Its axis is X, so the cylinder is laid on its side. */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[DRUM_RADIUS, DRUM_RADIUS, DRUM_WIDTH, 128, 1]} />
        <meshLambertMaterial ref={ground} />
      </mesh>
      {/* The trail line. */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[DRUM_RADIUS + 0.02, DRUM_RADIUS + 0.02, 0.5, 128, 1, true]} />
        <meshBasicMaterial color={COLORS.accent} transparent opacity={0.55} />
      </mesh>
      <instancedMesh ref={boxRef} args={[undefined, undefined, boxes.length]}>
        <boxGeometry />
        <meshLambertMaterial ref={boxMaterial} />
      </instancedMesh>
      <instancedMesh ref={coneRef} args={[undefined, undefined, cones.length]}>
        <coneGeometry args={[0.5, 1, 6]} />
        <meshLambertMaterial ref={coneMaterial} flatShading />
      </instancedMesh>
      <instancedMesh ref={postRef} args={[undefined, undefined, posts.length]}>
        <boxGeometry />
        <meshBasicMaterial color={COLORS.accent} />
      </instancedMesh>
      {STAGES.map((stage) =>
        stage.landmark ? <group key={stage.key}>{LANDMARKS[stage.landmark](stage)}</group> : null,
      )}
      {STATIONS.map((station) => (
        <AidStation key={station.href} at={station.at} />
      ))}
    </>
  );
}
