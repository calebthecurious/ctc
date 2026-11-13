"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import {
  SRGBColorSpace,
  type Color,
  type Fog,
  type AmbientLight,
  type DirectionalLight,
  type Mesh,
  type MeshBasicMaterial,
} from "three";
import { COLORS, DRUM_RADIUS } from "./config";
import { createPaletteBlender, type BlendedPalette, type Rgb } from "./stage-math";
import { useRunStore } from "./store";

const paletteAt = createPaletteBlender();

/** The palette for the current frame. Cheap enough to call from several components. */
export function currentPalette(): BlendedPalette {
  return paletteAt(useRunStore.getState().progress);
}

export function setRgb(color: Color, [red, green, blue]: Rgb): void {
  color.setRGB(red, green, blue, SRGBColorSpace);
}

// The sun sits far ahead of the runner, so he is always running toward it.
const SUN_X = -70;
const SUN_Z = -70;

/** Sky, fog, light and the sun, all driven by the stage palette at the current progress. */
export function Atmosphere() {
  const ambient = useRef<AmbientLight>(null);
  const key = useRef<DirectionalLight>(null);
  const sun = useRef<Mesh>(null);
  const background = useRef<Color>(null);
  const fog = useRef<Fog>(null);

  useFrame(() => {
    const palette = currentPalette();
    if (background.current) setRgb(background.current, palette.sky);
    if (fog.current) {
      setRgb(fog.current.color, palette.fog);
      fog.current.near = palette.fogNear;
      fog.current.far = palette.fogFar;
    }

    const sunY = DRUM_RADIUS + palette.sunHeight;
    if (ambient.current) ambient.current.intensity = palette.ambientIntensity;
    if (key.current) {
      setRgb(key.current.color, palette.sun);
      key.current.intensity = palette.sunIntensity;
      // Keep the key light above the ground even before sunrise, so shapes still read.
      key.current.position.set(SUN_X, Math.max(sunY, DRUM_RADIUS + 12), SUN_Z);
    }
    if (sun.current) {
      sun.current.position.set(SUN_X, sunY, SUN_Z);
      setRgb((sun.current.material as MeshBasicMaterial).color, palette.sun);
    }
  });

  return (
    <>
      <color ref={background} attach="background" args={[COLORS.base]} />
      <fog ref={fog} attach="fog" args={[COLORS.base, 14, 44]} />
      <ambientLight ref={ambient} />
      <directionalLight ref={key} />
      {/* Soft fill from the camera side, so faces turned away from the sun are not black. */}
      <directionalLight position={[10, 8, 6]} intensity={0.35} />
      <mesh ref={sun}>
        <sphereGeometry args={[7, 24, 16]} />
        <meshBasicMaterial fog={false} />
      </mesh>
    </>
  );
}
