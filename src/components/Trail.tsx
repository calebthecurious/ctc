import Link from "next/link";
import type { ReactNode } from "react";
import { getPublicLinks } from "@/content";
import type { ContentItem } from "@/content/types";
import { hrefFor, slugOf } from "@/lib/routes";

/** Page title block shared by every library route. */
export function PageHeader({ kicker, title, intro }: { kicker: string; title: string; intro: string }) {
  return (
    <header className="mb-14">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">{kicker}</p>
      <h1 className="mt-3 text-3xl font-medium tracking-tight">{title}</h1>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">{intro}</p>
    </header>
  );
}

/** A list drawn as a stretch of trail: one line, one marker per entry. */
export function Trail({ children, label }: { children: ReactNode; label: string }) {
  return (
    <ol aria-label={label} className="border-l border-line">
      {children}
    </ol>
  );
}

/** One marker on the trail. `anchor` makes it linkable as `/route#anchor`. */
export function Marker({ anchor, children }: { anchor?: string; children: ReactNode }) {
  return (
    <li id={anchor} className="relative scroll-mt-24 pb-12 pl-6 last:pb-0">
      <span aria-hidden className="absolute -left-[4.5px] top-1.5 size-2 rounded-full bg-accent" />
      {children}
    </li>
  );
}

/** A content item as a trail marker, with its meta line, extra detail and related links. */
export function ItemMarker({ item, meta, children }: { item: ContentItem; meta?: string; children?: ReactNode }) {
  return (
    <Marker anchor={slugOf(item)}>
      {meta ? <p className="font-mono text-xs text-muted">{meta}</p> : null}
      <h2 className="mt-1 text-lg font-medium">{item.title}</h2>
      <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted">{item.summary}</p>
      {children}
      <Related item={item} />
    </Marker>
  );
}

/** Labelled facts under an item, for example role, stack and outcome. */
export function Facts({ rows }: { rows: [label: string, value: string][] }) {
  return (
    <dl className="mt-4 grid max-w-prose grid-cols-[5.5rem_1fr] gap-x-4 gap-y-1.5 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="font-mono text-xs leading-5 text-muted">{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Links to the public items this one points at. Private targets never appear. */
function Related({ item }: { item: ContentItem }) {
  const related = getPublicLinks(item).flatMap((target) => {
    const href = hrefFor(target);
    return href ? [{ href, target }] : [];
  });
  if (related.length === 0) return null;
  return (
    <p className="mt-4 text-sm">
      <span className="font-mono text-xs text-muted">Related </span>
      {related.map(({ href, target }, index) => (
        <span key={target.id}>
          {index > 0 ? <span className="text-muted">, </span> : null}
          <Link href={href} className="link">
            {target.title}
          </Link>
        </span>
      ))}
    </p>
  );
}
