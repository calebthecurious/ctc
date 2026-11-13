"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { Atmosphere } from "./Atmosphere";
import { AdaptiveResolution, CameraRig, Precompile, Rig } from "./Rig";
import { Runner } from "./runner/Runner";
import { World } from "./World";

/** True while the tab is visible. The render loop stops when it is not. */
function usePageVisible(): boolean {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  return visible;
}

/** The WebGL scene. This module and everything it imports is one lazy chunk. */
export default function RunCanvas({ hasRunnerModel }: { hasRunnerModel: boolean }) {
  const visible = usePageVisible();
  // Cap the pixel ratio: phones have dense screens and small GPUs.
  const [maxDpr] = useState(() => {
    const cap = window.matchMedia("(pointer: coarse)").matches ? 1.5 : 1.75;
    return Math.min(window.devicePixelRatio || 1, cap);
  });

  return (
    <Canvas
      frameloop={visible ? "always" : "never"}
      dpr={maxDpr}
      camera={{ fov: 30, near: 0.5, far: 140 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <Atmosphere />
      <CameraRig />
      <Rig>
        <World />
      </Rig>
      <Runner hasModel={hasRunnerModel} />
      <Precompile />
      <AdaptiveResolution max={maxDpr} />
    </Canvas>
  );
}
