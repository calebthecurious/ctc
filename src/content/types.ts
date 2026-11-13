/**
 * Content model. Every item is a graph node: it has an id, a type and links to
 * other nodes. The 3D graph and throughline reader come later; this file only
 * keeps the model graph-ready.
 */

export const CONTENT_TYPES = [
  "project",
  "story",
  "thought",
  "resource",
  "person",
  "place-month",
  "throughline",
] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

/** The four decades of the plan. Lets an item be pinned to a stage of the run. */
export type Decade = "connect" | "preserve" | "grow" | "sail";

/** Calendar month, 1 (January) to 12 (December). */
export type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

interface BaseItem<T extends ContentType> {
  /** Globally unique, in the form `<type>/<slug>`. */
  id: `${T}/${string}`;
  type: T;
  title: string;
  summary: string;
  /** Ids of related items. Checked by `npm run check:content`. */
  links: string[];
  /** Only public items are ever rendered or shipped to the client. */
  public: boolean;
  decade?: Decade;
  /** True for seed content that must be replaced. Search for PLACEHOLDER. */
  placeholder?: boolean;
}

export interface Project extends BaseItem<"project"> {
  role: string;
  stack: string[];
  outcome: string;
  year: number;
  url?: string;
  body?: string;
}

export interface Story extends BaseItem<"story"> {
  format: "text" | "audio" | "video";
  /** Where it was told, for example a Toastmasters club or a Moth-style night. */
  toldAt?: string;
  mediaUrl?: string;
  body?: string;
}

export interface Thought extends BaseItem<"thought"> {
  length: "short" | "long";
  /** ISO date, YYYY-MM-DD. */
  date: string;
  body: string;
}

export interface Resource extends BaseItem<"resource"> {
  kind: "book" | "talk" | "paper" | "person";
  author: string;
  url?: string;
  /** How this shaped my thinking. */
  note: string;
}

/**
 * Private by default: set `public: true` explicitly to publish an entry.
 * Public entries show only `firstName`, `metAt` and `note`. Never render
 * `title` or `summary` for a person: they may hold private detail.
 */
export interface Person extends BaseItem<"person"> {
  firstName: string;
  metAt: string;
  note: string;
  status: "met" | "want-to-meet";
}

export interface PlaceMonth extends BaseItem<"place-month"> {
  place: string;
  /** Months this place is at its best. A month may be claimed by several places. */
  months: Month[];
  reason: string;
}

export interface Throughline extends BaseItem<"throughline"> {
  /** Ordered ids: the curated path, read first to last. */
  nodes: string[];
}

export type ContentItem =
  | Project
  | Story
  | Thought
  | Resource
  | Person
  | PlaceMonth
  | Throughline;

export type ItemOfType<T extends ContentType> = Extract<ContentItem, { type: T }>;
