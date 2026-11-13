"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { LIBRARY_ROUTES } from "@/lib/routes";
import { STAGES, STATIONS, stageIndexAt, stationIndexAt } from "./stage-math";
import { useRunStore } from "./store";

// The quiet HTML layer over the canvas. No three.js here: it works before the
// canvas chunk arrives, and without it.

const PANEL = "pointer-events-auto border border-line bg-base/85";
const FADE = "transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none";

/** Scrolls the page so the run arrives at `at`. The rig eases the runner there. */
function runTo(at: number): void {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo({ top: Math.round(at * max) });
}

/** Opens a plain index of every route, for visitors who want the content now. */
function SkipTheRun() {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className={`${PANEL} px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-accent hover:border-accent`}
      >
        Skip the run
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="index-title"
        className="m-auto w-[min(34rem,calc(100vw-2rem))] border border-line bg-base p-6 text-ink backdrop:bg-base/80"
      >
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="index-title" className="font-mono text-xs uppercase tracking-widest text-accent">
            Everything, without the run
          </h2>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="font-mono text-xs uppercase tracking-widest text-muted hover:text-ink"
          >
            Close
          </button>
        </div>
        <ul className="mt-5 border-t border-line">
          {LIBRARY_ROUTES.map((route) => (
            <li key={route.href} className="border-b border-line">
              <Link href={route.href} className="group grid gap-x-4 py-3 text-sm sm:grid-cols-[6.5rem_1fr]">
                <span className="group-hover:text-accent">{route.label}</span>
                <span className="text-muted">{route.line}</span>
              </Link>
            </li>
          ))}
        </ul>
      </dialog>
    </>
  );
}

/** Where we are in the run. Each stage name jumps to the start of that stage. */
function StageIndicator({ current }: { current: number }) {
  const bar = useRef<HTMLDivElement>(null);

  // Updated outside React: progress changes every frame.
  useEffect(() => {
    const apply = (progress: number) => {
      if (bar.current) bar.current.style.transform = `scaleX(${progress})`;
    };
    apply(useRunStore.getState().progress);
    return useRunStore.subscribe((state) => apply(state.progress));
  }, []);

  return (
    <nav aria-label="Stages of the run" className={`${PANEL} relative`}>
      <ol className="flex">
        {STAGES.map((stage) => (
          <li key={stage.key}>
            <button
              type="button"
              aria-current={stage.index === current ? "step" : undefined}
              onClick={() => runTo(stage.start)}
              className="px-2 py-1.5 font-mono text-[0.6875rem] uppercase tracking-wider text-muted hover:text-ink aria-[current]:text-accent sm:px-3"
            >
              {stage.label}
            </button>
          </li>
        ))}
      </ol>
      <div aria-hidden ref={bar} className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent" />
    </nav>
  );
}

/** The current stage's title and line. All are stacked; only the current one shows. */
function StageCaption({ current, stationShown }: { current: number; stationShown: boolean }) {
  return (
    <div
      className={`${FADE} col-start-1 row-start-1 grid w-full self-end sm:max-w-sm ${
        // On phones the station card takes the caption's place instead of stacking on it.
        stationShown ? "max-sm:pointer-events-none max-sm:opacity-0" : ""
      }`}
    >
      {STAGES.map((stage) => {
        const shown = stage.index === current;
        const Heading = stage.index === 0 ? "h1" : "h2";
        return (
          <section
            key={stage.key}
            aria-hidden={!shown}
            className={`${PANEL} ${FADE} col-start-1 row-start-1 self-end p-4 ${
              shown ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0"
            }`}
          >
            <p className="font-mono text-xs uppercase tracking-widest text-accent">{stage.kicker}</p>
            <Heading className="mt-2 text-xl font-medium tracking-tight">{stage.title}</Heading>
            <p className="mt-1 text-sm leading-relaxed text-muted">{stage.line}</p>
          </section>
        );
      })}
    </div>
  );
}

/**
 * One card per aid station, stacked. A card shows when the runner reaches its
 * station. Every link stays in the tab order: focusing one runs to its station.
 */
function StationCards({ active }: { active: number }) {
  return (
    <div className="col-start-1 row-start-1 grid w-full self-end sm:col-start-2 sm:w-80 sm:justify-self-end">
      {STATIONS.map((station) => {
        const shown = station.index === active;
        return (
          <article
            key={station.href}
            data-station={station.href}
            data-at={station.at}
            className={`${PANEL} ${FADE} relative col-start-1 row-start-1 self-end p-4 focus-within:translate-y-0 focus-within:opacity-100 hover:border-accent ${
              shown ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0"
            }`}
          >
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              Aid station · {station.stage.label}
            </p>
            <h2 className="mt-2 text-lg font-medium">{station.label}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">{station.line}</p>
            <Link
              href={station.href}
              onFocus={() => runTo(station.at)}
              className="mt-3 inline-block font-mono text-xs uppercase tracking-widest text-accent after:absolute after:inset-0"
            >
              Open {station.label} <span aria-hidden>→</span>
            </Link>
          </article>
        );
      })}
    </div>
  );
}

export function RunOverlay() {
  // These selectors return small integers, so React re-renders only on a change of stage or station.
  const stage = useRunStore((state) => stageIndexAt(state.progress));
  const station = useRunStore((state) => stationIndexAt(state.progress));

  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-4 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col items-start gap-3">
          <p className={`${PANEL} px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-accent`}>The Long Run</p>
          <StageIndicator current={stage} />
        </div>
        <SkipTheRun />
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        <StageCaption current={stage} stationShown={station !== -1} />
        <StationCards active={station} />
      </div>
    </div>
  );
}
