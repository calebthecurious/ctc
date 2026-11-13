import Link from "next/link";
import { LIBRARY_ROUTES } from "@/lib/routes";
import { seededRandom } from "./placement";
import { STAGES, STATIONS, type Stage } from "./stage-math";
import { StartRunButton } from "./StartRunButton";

// The same journey without WebGL: the stages as stacked sections with the same
// cards and links. Server-rendered, so it is also what no-JS visitors and
// crawlers get. Hidden by CSS when the 3D run takes over (see globals.css).

const WIDTH = 800;
const HEIGHT = 260;
const HORIZON = 190; // y of the top of the hill, at the centre
const HILL_RADIUS = 1300;

/** y of the ground at x: the hill is the top of a very large circle. */
const groundY = (x: number) => HORIZON + (x - WIDTH / 2) ** 2 / (2 * HILL_RADIUS);

/** PLACEHOLDER illustration: a flat drawing of the stage from its palette and greybox recipe. */
function StageIllustration({ stage }: { stage: Stage }) {
  const { palette, greybox } = stage;
  const random = seededRandom(stage.index + 11);
  const props = Array.from({ length: Math.round(greybox.density / 9) }, () => {
    const x = 20 + random() * (WIDTH - 40);
    const height = (greybox.height[0] + random() * (greybox.height[1] - greybox.height[0])) * 22;
    const width = (greybox.width[0] + random() * (greybox.width[1] - greybox.width[0])) * 16;
    return { x, height, width, cone: random() < greybox.coneShare };
  });
  // -45 (far below the horizon) to 10 (high) maps onto the picture.
  const sunY = HORIZON - 12 - (palette.sunHeight + 26) * 3.4;
  const span = stage.end - stage.start;
  const xAt = (at: number) => 60 + ((at - stage.start) / span) * (WIDTH - 120);
  const trail = `M0 ${groundY(0)} Q${WIDTH / 2} ${2 * HORIZON - groundY(0)} ${WIDTH} ${groundY(WIDTH)}`;

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} aria-hidden className="block w-full" preserveAspectRatio="xMidYMid slice">
      <rect width={WIDTH} height={HEIGHT} fill={palette.sky} />
      <circle cx={610} cy={sunY} r={34} fill={palette.sun} />
      {props.map((prop, index) => {
        const base = groundY(prop.x) - 22 + (index % 3) * 4;
        return prop.cone ? (
          <path
            key={index}
            d={`M${prop.x - prop.width / 2} ${base + 30}L${prop.x} ${base - prop.height}L${prop.x + prop.width / 2} ${base + 30}Z`}
            fill={palette.prop}
          />
        ) : (
          <rect key={index} x={prop.x - prop.width / 2} y={base - prop.height} width={prop.width} height={prop.height + 30} fill={palette.prop} />
        );
      })}
      <circle cx={WIDTH / 2} cy={HORIZON + HILL_RADIUS} r={HILL_RADIUS} fill={palette.ground} />
      {stage.landmark === "jetty" ? (
        <>
          <path d={trail} fill="none" stroke="#8a5a3a" strokeWidth={9} strokeDasharray="14 3" />
          <path d={`M${WIDTH - 150} ${groundY(WIDTH - 110) - 4}h90l-14 16h-62z`} fill="#8a5a3a" />
          <path d={`M${WIDTH - 108} ${groundY(WIDTH - 110) - 6}v-70l38 62z`} fill="#f4ead8" />
        </>
      ) : (
        <path d={trail} fill="none" stroke="#00d9c0" strokeWidth={3} />
      )}
      {stage.landmark === "gate" ? (
        <path d={`M70 ${groundY(70) + 4}v-64h44v64`} fill="none" stroke="#00d9c0" strokeWidth={3} />
      ) : null}
      {stage.stations.map((station) => {
        const x = xAt(stage.start + station.at * span);
        const y = groundY(x) - 2;
        return (
          <g key={station.href}>
            <rect x={x - 13} y={y - 18} width={26} height={18} fill="#e8e8ee" />
            <path d={`M${x - 18} ${y - 18}L${x} ${y - 32}L${x + 18} ${y - 18}Z`} fill="#00d9c0" />
          </g>
        );
      })}
    </svg>
  );
}

export function StaticJourney({ className }: { className?: string }) {
  return (
    <div className={className}>
      <header className="mx-auto w-full max-w-3xl px-6 pb-12 pt-16">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">The Long Run</p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight">Caleb the Curious</h1>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
          A self-taught developer, ultra trail runner and storyteller. One continuous run through four
          decades, from a pre-dawn start line to the open sea.
        </p>
        <nav aria-label="Library" className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {LIBRARY_ROUTES.map((route) => (
            <Link key={route.href} href={route.href} className="link">
              {route.label}
            </Link>
          ))}
        </nav>
        <p className="run-anyway mt-6 text-sm text-muted">
          You are seeing the still version of the journey.{" "}
          <StartRunButton />
        </p>
      </header>

      {STAGES.map((stage) => (
        <section key={stage.key} aria-labelledby={`stage-${stage.key}`} className="border-t border-line">
          <StageIllustration stage={stage} />
          <div className="mx-auto w-full max-w-3xl px-6 py-10">
            <p className="font-mono text-xs uppercase tracking-widest text-accent">{stage.kicker}</p>
            <h2 id={`stage-${stage.key}`} className="mt-2 text-2xl font-medium tracking-tight">
              {stage.title}
            </h2>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">{stage.line}</p>
            {stage.stations.length > 0 ? (
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {STATIONS.filter((station) => station.stage.index === stage.index).map((station) => (
                  <li key={station.href} className="relative border border-line p-4 hover:border-accent">
                    <p className="font-mono text-xs uppercase tracking-widest text-muted">Aid station</p>
                    <h3 className="mt-2 text-lg font-medium">{station.label}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{station.line}</p>
                    <Link
                      href={station.href}
                      className="mt-3 inline-block font-mono text-xs uppercase tracking-widest text-accent after:absolute after:inset-0"
                    >
                      Open {station.label} <span aria-hidden>→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      ))}

      <footer className="border-t border-line">
        <p className="mx-auto w-full max-w-3xl px-6 py-6 font-mono text-xs text-muted">
          Caleb the Curious. Chasing the sun.
        </p>
      </footer>
    </div>
  );
}
