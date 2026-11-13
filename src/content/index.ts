/**
 * Typed content loader. Server-side only by convention: never import this from
 * a client component, because it holds private items.
 */
import { people } from "./data/people";
import { projects } from "./data/projects";
import { resources } from "./data/resources";
import { seasons } from "./data/seasons";
import { stories } from "./data/stories";
import { thoughts } from "./data/thoughts";
import { throughlines } from "./data/throughlines";
import type { ContentItem, ContentType, ItemOfType } from "./types";

export * from "./types";

/** Every item, including private ones. Use for validation and tooling only. */
export const allItems: readonly ContentItem[] = [
  ...projects,
  ...stories,
  ...thoughts,
  ...resources,
  ...people,
  ...seasons,
  ...throughlines,
];

const publicItems = allItems.filter((item) => item.public);
const publicById = new Map<string, ContentItem>(publicItems.map((item) => [item.id, item]));

/** Public items of one type. This is what pages should use. */
export function getPublic<T extends ContentType>(type: T): ItemOfType<T>[] {
  return publicItems.filter((item): item is ItemOfType<T> => item.type === type);
}

/** A public item by id, or undefined if it is missing or private. */
export function getPublicById(id: string): ContentItem | undefined {
  return publicById.get(id);
}

/** The public items an item links to. Private and missing targets are dropped. */
export function getPublicLinks(item: ContentItem): ContentItem[] {
  return item.links.flatMap((id) => publicById.get(id) ?? []);
}

/** The part of an id after `<type>/`, for use in URLs. */
export function slugOf(item: ContentItem): string {
  return item.id.slice(item.type.length + 1);
}
