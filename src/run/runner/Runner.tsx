"use client";

import { lazy, Suspense } from "react";
import { COLORS, DRUM_RADIUS } from "../config";
import PlaceholderRunner from "./PlaceholderRunner";

// Loaded only when a model exists, so the GLTF loader stays out of the bundle otherwise.
const GlbRunner = lazy(() => import("./GlbRunner"));

/**
 * The runner, standing on top of the drum. Swappable: with `hasModel` it loads
 * the GLB, showing the placeholder while it downloads; without, the placeholder.
 */
export function Runner({ hasModel }: { hasModel: boolean }) {
  return (
    <group position={[0, DRUM_RADIUS, 0]}>
      {/* The headlamp's pool of light on the trail ahead. Kept here so any runner model has it. */}
      <pointLight position={[0, 1.5, -1.6]} color={COLORS.accent} intensity={14} distance={9} decay={2} />
      {hasModel ? (
        <Suspense fallback={<PlaceholderRunner />}>
          <GlbRunner />
        </Suspense>
      ) : (
        <PlaceholderRunner />
      )}
    </group>
  );
}
