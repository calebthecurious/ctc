"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { SCROLL_LENGTH_VH } from "./config";
import { syncTargetFromScroll, useRunStore } from "./store";

// Client-only and lazy: three.js is fetched after the page is interactive.
const RunCanvas = dynamic(() => import("./RunCanvas"), { ssr: false });

/**
 * The home page experience: a fixed canvas behind a tall, empty scroll track.
 * Native scrolling (wheel, touch, keyboard) is the only control.
 */
export function RunExperience({ hasRunnerModel }: { hasRunnerModel: boolean }) {
  useEffect(() => {
    syncTargetFromScroll();
    // Start where the page already is (reload, back navigation) instead of running there.
    useRunStore.setState({ progress: useRunStore.getState().target });
    window.addEventListener("scroll", syncTargetFromScroll, { passive: true });
    window.addEventListener("resize", syncTargetFromScroll);
    // Exposed for verification scripts and debugging in the console.
    (window as unknown as { __run?: typeof useRunStore }).__run = useRunStore;
    return () => {
      window.removeEventListener("scroll", syncTargetFromScroll);
      window.removeEventListener("resize", syncTargetFromScroll);
    };
  }, []);

  return (
    <>
      <div aria-hidden className="fixed inset-0">
        <RunCanvas hasRunnerModel={hasRunnerModel} />
      </div>
      {/* The scroll track. Its height is the length of the run. svh keeps it stable when a phone's address bar hides. */}
      <div aria-hidden style={{ height: `${SCROLL_LENGTH_VH}svh` }} />
    </>
  );
}
