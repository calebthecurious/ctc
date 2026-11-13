import { existsSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { LIBRARY_ROUTES } from "@/lib/routes";
import { RUNNER_MODEL_PATH } from "@/run/config";
import { RunExperience } from "@/run/RunExperience";

export default function Home() {
  // Checked at build time: drop the file in /public/models and rebuild.
  const hasRunnerModel = existsSync(path.join(process.cwd(), "public", RUNNER_MODEL_PATH));

  return (
    <main className="relative flex-1">
      <RunExperience hasRunnerModel={hasRunnerModel} />
      {/* PLACEHOLDER: minimal overlay. Stage cards and "Skip the run" arrive in Step 4. */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-10 flex flex-wrap items-baseline gap-x-5 gap-y-2 px-6 py-5 text-sm">
        <p className="mr-auto font-mono text-xs uppercase tracking-widest text-accent">The Long Run</p>
        <nav aria-label="Library" className="pointer-events-auto flex flex-wrap gap-x-5 gap-y-2">
          {LIBRARY_ROUTES.map((route) => (
            <Link key={route.href} href={route.href} className="text-muted hover:text-ink">
              {route.label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 px-6 py-6">
        <h1 className="text-xl font-medium tracking-tight">Caleb the Curious</h1>
        <p className="mt-1 text-sm text-muted">Scroll to run.</p>
      </div>
    </main>
  );
}
