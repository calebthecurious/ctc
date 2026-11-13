import type { Metadata } from "next";
import { PageHeader } from "@/components/Trail";
import { getPublic } from "@/content";
import type { Month, PlaceMonth } from "@/content/types";
import { slugOf } from "@/lib/routes";

export const metadata: Metadata = { title: "Seasons" };

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const SIZE = 360;
const CENTER = SIZE / 2;
const OUTER = 148;
const INNER = 78;
const LABEL = 160; // radius of the place names outside the ring
const GAP = 1.2; // degrees of space between segments

const f = (n: number) => n.toFixed(2);

function point(radius: number, degrees: number): [number, number] {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return [CENTER + radius * Math.cos(radians), CENTER + radius * Math.sin(radians)];
}

/** SVG path for one month's segment of the ring. January starts at 12 o'clock. */
function segmentPath(index: number): string {
  const start = index * 30 + GAP;
  const end = (index + 1) * 30 - GAP;
  const [ax, ay] = point(OUTER, start);
  const [bx, by] = point(OUTER, end);
  const [cx, cy] = point(INNER, end);
  const [dx, dy] = point(INNER, start);
  return `M${f(ax)} ${f(ay)}A${OUTER} ${OUTER} 0 0 1 ${f(bx)} ${f(by)}L${f(cx)} ${f(cy)}A${INNER} ${INNER} 0 0 0 ${f(dx)} ${f(dy)}Z`;
}

/**
 * Arc outside the ring for a place name to sit on. Assumes `months` is a
 * contiguous run in calendar order (it may wrap the year, for example 12, 1, 2).
 * On the lower half the arc runs anticlockwise so the text stays upright.
 */
function labelArc(season: PlaceMonth): string {
  const start = (season.months[0] - 1) * 30;
  const end = start + season.months.length * 30;
  const middle = (((start + end) / 2) % 360 + 360) % 360;
  const flip = middle > 90 && middle < 270;
  const radius = flip ? LABEL + 8 : LABEL;
  const [ax, ay] = point(radius, flip ? end : start);
  const [bx, by] = point(radius, flip ? start : end);
  return `M${f(ax)} ${f(ay)}A${radius} ${radius} 0 0 ${flip ? 0 : 1} ${f(bx)} ${f(by)}`;
}

/** The wheel is decorative: the month list below carries the same information. */
function Wheel({ seasons, byMonth }: { seasons: PlaceMonth[]; byMonth: PlaceMonth[][] }) {
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden className="mx-auto w-full max-w-sm">
      {MONTHS.map((name, index) => {
        const filled = byMonth[index].length > 0;
        const [x, y] = point((OUTER + INNER) / 2, index * 30 + 15);
        return (
          <g key={name}>
            <path
              d={segmentPath(index)}
              className={filled ? "fill-accent/15 stroke-accent" : "fill-surface stroke-line"}
              strokeWidth={1}
            />
            <text
              x={f(x)}
              y={f(y)}
              textAnchor="middle"
              dominantBaseline="central"
              className={`font-mono text-[9px] uppercase ${filled ? "fill-accent" : "fill-muted"}`}
            >
              {name.slice(0, 3)}
            </text>
          </g>
        );
      })}
      {seasons.map((season) => (
        <g key={season.id}>
          <path id={`arc-${slugOf(season)}`} d={labelArc(season)} fill="none" />
          <text className="fill-ink font-mono text-[9px] uppercase tracking-widest">
            <textPath href={`#arc-${slugOf(season)}`} startOffset="50%" textAnchor="middle">
              {season.place}
            </textPath>
          </text>
        </g>
      ))}
      <text
        x={CENTER}
        y={CENTER}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-muted font-mono text-[8px] uppercase tracking-widest"
      >
        Chasing the sun
      </text>
    </svg>
  );
}

export default function SeasonsPage() {
  const seasons = getPublic("place-month");
  const byMonth = MONTHS.map((_, index) =>
    seasons.filter((season) => season.months.includes((index + 1) as Month)),
  );
  return (
    <>
      <PageHeader
        kicker="Seasons"
        title="The best place to be, month by month"
        intro="A wheel I'm still filling in. Empty months are open questions."
      />
      <Wheel seasons={seasons} byMonth={byMonth} />
      {/* Anchor targets for links from other pages, for example /seasons#japan-march. */}
      {seasons.map((season) => (
        <span key={season.id} id={slugOf(season)} className="block scroll-mt-24" />
      ))}
      <ol className="mt-14 border-t border-line">
        {MONTHS.map((name, index) => (
          <li key={name} className="grid grid-cols-[6.5rem_1fr] gap-x-4 border-b border-line py-3 text-sm">
            <span className="font-mono text-xs leading-5 text-muted">{name}</span>
            {byMonth[index].length > 0 ? (
              <span className="flex flex-col gap-1">
                {byMonth[index].map((season) => (
                  <span key={season.id}>
                    {season.place} <span className="text-muted">· {season.reason}</span>
                  </span>
                ))}
              </span>
            ) : (
              <span className="text-muted">Open</span>
            )}
          </li>
        ))}
      </ol>
    </>
  );
}
