import type { Metadata } from "next";
import { ItemMarker, PageHeader, Trail } from "@/components/Trail";
import { getPublic } from "@/content";

export const metadata: Metadata = { title: "Thoughts" };

export default function ThoughtsPage() {
  const thoughts = getPublic("thought").toSorted((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <PageHeader kicker="Thoughts" title="Short and long writing" intro="Notes and essays, newest first." />
      <Trail label="Thoughts">
        {thoughts.map((thought) => (
          <ItemMarker key={thought.id} item={thought} meta={`${thought.date} · ${thought.length}`}>
            <p className="mt-4 max-w-prose whitespace-pre-line text-sm leading-relaxed">{thought.body}</p>
          </ItemMarker>
        ))}
      </Trail>
    </>
  );
}
