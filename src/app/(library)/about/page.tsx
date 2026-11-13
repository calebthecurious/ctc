import type { Metadata } from "next";
import { Marker, PageHeader, Trail } from "@/components/Trail";
import { BASES, CONTACT, DECADES } from "@/content/data/about";

export const metadata: Metadata = { title: "About" };

function SectionHeading({ children }: { children: string }) {
  return <h2 className="mb-6 font-mono text-xs uppercase tracking-widest text-muted">{children}</h2>;
}

export default function AboutPage() {
  return (
    <>
      <PageHeader
        kicker="About"
        title="Caleb, the curious one"
        intro="A self-taught full-stack developer from Melbourne, an ultra trail runner and a storyteller. I live nomadically and think about my life in decades."
      />

      <section className="mb-16">
        <SectionHeading>The decade plan</SectionHeading>
        <Trail label="The decade plan">
          {DECADES.map((decade) => (
            <Marker key={decade.key} anchor={decade.key}>
              <p className="font-mono text-xs text-muted">
                {decade.age}
                {decade.now ? <span className="text-accent"> · now</span> : null}
              </p>
              <h3 className="mt-1 text-lg font-medium">{decade.verb}</h3>
              <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted">{decade.text}</p>
            </Marker>
          ))}
        </Trail>
      </section>

      <section className="mb-16">
        <SectionHeading>The yearly rotation</SectionHeading>
        <p className="mb-6 max-w-prose text-sm leading-relaxed text-muted">
          Three or four bases a year, chasing the sun.
        </p>
        <ul className="border-t border-line">
          {BASES.map((base) => (
            <li key={base.name} className="grid gap-x-4 border-b border-line py-3 text-sm sm:grid-cols-[16rem_1fr]">
              <span>{base.name}</span>
              <span className="text-muted">{base.role}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionHeading>How to reach me</SectionHeading>
        <dl className="grid max-w-prose grid-cols-[5.5rem_1fr] gap-x-4 gap-y-2 text-sm">
          {CONTACT.map((contact) => (
            <div key={contact.label} className="contents">
              <dt className="font-mono text-xs leading-5 text-muted">{contact.label}</dt>
              <dd>
                {contact.href ? (
                  <a href={contact.href} className="link">
                    {contact.value}
                  </a>
                ) : (
                  contact.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
