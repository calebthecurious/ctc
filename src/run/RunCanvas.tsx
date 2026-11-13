"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { COLORS } from "./config";
import { CameraRig, Rig } from "./Rig";
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

  return (
    <Canvas
      frameloop={visible ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ fov: 30, near: 0.5, far: 140 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={[COLORS.base]} />
      <fog attach="fog" args={[COLORS.base, 20, 52]} />
      {/* PLACEHOLDER: flat greybox lighting. Stages set light and fog in Step 4. */}
      <ambientLight intensity={0.9} />
      <directionalLight position={[6, 12, 4]} intensity={1.4} />
      <CameraRig />
      <Rig>
        <World />
      </Rig>
      <Runner hasModel={hasRunnerModel} />
    </Canvas>
  );
}
