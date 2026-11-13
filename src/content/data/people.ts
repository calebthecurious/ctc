import type { Person } from "../types";

/**
 * People are private by default. Only `public: true` entries may be rendered,
 * and then only `firstName`, `metAt` and `note`.
 *
 * PLACEHOLDER: every person below is invented seed content.
 */
export const people: Person[] = [
  {
    id: "person/placeholder-alex",
    type: "person",
    title: "PLACEHOLDER: Alex",
    summary: "PLACEHOLDER: public example entry.",
    links: ["place-month/thailand-dry-season"],
    public: true,
    placeholder: true,
    firstName: "Alex",
    metAt: "PLACEHOLDER: a dive boat off Koh Tao",
    note: "PLACEHOLDER: what I want to remember.",
    status: "met",
  },
  {
    id: "person/placeholder-sam",
    type: "person",
    title: "PLACEHOLDER: Sam",
    summary: "PLACEHOLDER: public example of someone I still want to meet.",
    links: ["resource/placeholder-dementia-paper"],
    public: true,
    placeholder: true,
    firstName: "Sam",
    metAt: "PLACEHOLDER: not yet",
    note: "PLACEHOLDER: why I want to meet them.",
    status: "want-to-meet",
  },
  {
    // Private on purpose: used to verify that private people never reach a page.
    id: "person/placeholder-private-example",
    type: "person",
    title: "PLACEHOLDER: PRIVATE-EXAMPLE-FULLNAME",
    summary: "PLACEHOLDER: PRIVATE-EXAMPLE-SUMMARY",
    links: [],
    public: false,
    placeholder: true,
    firstName: "PRIVATE-EXAMPLE-FIRSTNAME",
    metAt: "PLACEHOLDER: PRIVATE-EXAMPLE-METAT",
    note: "PLACEHOLDER: PRIVATE-EXAMPLE-NOTE",
    status: "met",
  },
];
