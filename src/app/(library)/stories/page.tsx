import type { Metadata } from "next";
import { ItemMarker, PageHeader, Trail } from "@/components/Trail";
import { getPublic } from "@/content";

export const metadata: Metadata = { title: "Stories" };

export default function StoriesPage() {
  const stories = getPublic("story");
  return (
    <>
      <PageHeader
        kicker="Stories"
        title="Stories, told out loud first"
        intro="From Toastmasters and Moth-style nights, kept here as text, audio or video."
      />
      <Trail label="Stories">
        {stories.map((story) => (
          <ItemMarker
            key={story.id}
            item={story}
            meta={[story.format, story.toldAt].filter(Boolean).join(" · ")}
          >
            {story.body ? (
              <p className="mt-4 max-w-prose whitespace-pre-line text-sm leading-relaxed">{story.body}</p>
            ) : null}
            {story.mediaUrl ? (
              <p className="mt-4 text-sm">
                <a href={story.mediaUrl} className="link">
                  {story.format === "audio" ? "Listen" : "Watch"}
                </a>
              </p>
            ) : story.format !== "text" ? (
              // PLACEHOLDER: audio and video players arrive with real recordings.
              <p className="mt-4 font-mono text-xs text-muted">PLACEHOLDER: recording to come</p>
            ) : null}
          </ItemMarker>
        ))}
      </Trail>
    </>
  );
}
