import type { Metadata } from "next";
import { Facts, ItemMarker, PageHeader, Trail } from "@/components/Trail";
import { getPublic } from "@/content";

export const metadata: Metadata = { title: "Library" };

export default function LibraryPage() {
  const resources = getPublic("resource");
  return (
    <>
      <PageHeader
        kicker="Library"
        title="What formed my opinions"
        intro="Books, talks, papers and people, each with a note on how it shaped my thinking."
      />
      <Trail label="Resources">
        {resources.map((resource) => (
          <ItemMarker key={resource.id} item={resource} meta={`${resource.kind} · ${resource.author}`}>
            <Facts rows={[["My note", resource.note]]} />
            {resource.url ? (
              <p className="mt-4 text-sm">
                <a href={resource.url} className="link">
                  Go to the source
                </a>
              </p>
            ) : null}
          </ItemMarker>
        ))}
      </Trail>
    </>
  );
}
