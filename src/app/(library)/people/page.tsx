import type { Metadata } from "next";
import { Facts, Marker, PageHeader, Trail } from "@/components/Trail";
import { getPublic } from "@/content";
import type { Person } from "@/content/types";
import { slugOf } from "@/lib/routes";

export const metadata: Metadata = { title: "People" };

/**
 * Privacy: only `public: true` people reach this page (`getPublic`), and only
 * first name, where we met and a note are rendered. Never render `title`,
 * `summary` or `links` for a person.
 */
function PersonMarker({ person }: { person: Person }) {
  return (
    <Marker anchor={slugOf(person)}>
      <h3 className="text-lg font-medium">{person.firstName}</h3>
      <Facts
        rows={[
          [person.status === "met" ? "Met" : "Where", person.metAt],
          ["Note", person.note],
        ]}
      />
    </Marker>
  );
}

export default function PeoplePage() {
  const people = getPublic("person");
  const groups = [
    { heading: "People I've met", list: people.filter((person) => person.status === "met") },
    { heading: "People I still want to meet", list: people.filter((person) => person.status === "want-to-meet") },
  ];
  return (
    <>
      <PageHeader
        kicker="People"
        title="People along the way"
        intro="A few of the people I've met and want to remember, and some I still want to meet. Shared with their first name only."
      />
      {groups.map(({ heading, list }) =>
        list.length > 0 ? (
          <section key={heading} className="mb-14 last:mb-0">
            <h2 className="mb-6 font-mono text-xs uppercase tracking-widest text-muted">{heading}</h2>
            <Trail label={heading}>
              {list.map((person) => (
                <PersonMarker key={person.id} person={person} />
              ))}
            </Trail>
          </section>
        ) : null,
      )}
    </>
  );
}
