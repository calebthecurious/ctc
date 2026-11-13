import { existsSync } from "node:fs";
import path from "node:path";
import { InlineScript } from "@/components/InlineScript";
import { RUNNER_MODEL_PATH } from "@/run/config";
import { RUN_MODE_SCRIPT } from "@/run/mode";
import { RunRoot } from "@/run/RunRoot";
import { StaticJourney } from "@/run/StaticJourney";

export default function Home() {
  // Checked at build time: drop the file in /public/models and rebuild.
  const hasRunnerModel = existsSync(path.join(process.cwd(), "public", RUNNER_MODEL_PATH));

  return (
    <main className="relative flex-1">
      {/* Picks the 3D run or the static journey before first paint. */}
      <InlineScript html={RUN_MODE_SCRIPT} />
      <StaticJourney className="journey-static" />
      <RunRoot hasRunnerModel={hasRunnerModel} />
    </main>
  );
}
