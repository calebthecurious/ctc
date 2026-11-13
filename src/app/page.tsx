import { existsSync } from "node:fs";
import path from "node:path";
import { RUNNER_MODEL_PATH } from "@/run/config";
import { RunExperience } from "@/run/RunExperience";
import { RunOverlay } from "@/run/RunOverlay";

export default function Home() {
  // Checked at build time: drop the file in /public/models and rebuild.
  const hasRunnerModel = existsSync(path.join(process.cwd(), "public", RUNNER_MODEL_PATH));

  return (
    <main className="relative flex-1">
      <RunOverlay />
      <RunExperience hasRunnerModel={hasRunnerModel} />
    </main>
  );
}
