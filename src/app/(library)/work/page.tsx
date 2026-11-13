import type { Metadata } from "next";
import { Facts, ItemMarker, PageHeader, Trail } from "@/components/Trail";
import { getPublic } from "@/content";

export const metadata: Metadata = { title: "Work" };

export default function WorkPage() {
  const projects = getPublic("project").toSorted((a, b) => b.year - a.year);
  return (
    <>
      <PageHeader
        kicker="Work"
        title="Projects and case studies"
        intro="What I built, my role, the stack and the outcome."
      />
      <Trail label="Projects">
        {projects.map((project) => (
          <ItemMarker key={project.id} item={project} meta={String(project.year)}>
            <Facts
              rows={[
                ["Role", project.role],
                ["Stack", project.stack.join(", ")],
                ["Outcome", project.outcome],
              ]}
            />
            {project.url ? (
              <p className="mt-4 text-sm">
                <a href={project.url} className="link">
                  Visit the project
                </a>
              </p>
            ) : null}
          </ItemMarker>
        ))}
      </Trail>
    </>
  );
}
