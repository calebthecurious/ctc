import type { ContentItem, ContentType } from "@/content/types";

export interface LibraryRoute {
  href: string;
  label: string;
  /** One line shown in indexes and, later, on aid-station cards. */
  line: string;
}

/** Every plain route in the library, in the order they appear along the run. */
export const LIBRARY_ROUTES: readonly LibraryRoute[] = [
  { href: "/work", label: "Work", line: "Projects and case studies: what I built and how." },
  { href: "/stories", label: "Stories", line: "Spoken stories as text, audio or video." },
  { href: "/thoughts", label: "Thoughts", line: "Short and long writing." },
  { href: "/library", label: "Library", line: "The resources that formed my opinions." },
  { href: "/people", label: "People", line: "People I've met, and people I still want to meet." },
  { href: "/seasons", label: "Seasons", line: "The best place to be in any given month." },
  { href: "/about", label: "About", line: "The decade plan, the yearly rotation, how to reach me." },
];

const ROUTE_FOR_TYPE: Partial<Record<ContentType, string>> = {
  project: "/work",
  story: "/stories",
  thought: "/thoughts",
  resource: "/library",
  person: "/people",
  "place-month": "/seasons",
  // throughline: no route until /graph exists.
};

/** The part of an id after `<type>/`. Used as the in-page anchor. */
export function slugOf(item: ContentItem): string {
  return item.id.slice(item.type.length + 1);
}

/** Where an item lives, or undefined if its type has no route yet. */
export function hrefFor(item: ContentItem): string | undefined {
  const route = ROUTE_FOR_TYPE[item.type];
  return route ? `${route}#${slugOf(item)}` : undefined;
}
