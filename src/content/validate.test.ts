import assert from "node:assert/strict";
import { test } from "node:test";
import { allItems, getPublic } from "./index";
import type { ContentItem } from "./types";
import { validateContent } from "./validate";

const thought = (id: string, links: string[]): ContentItem => ({
  id: id as `thought/${string}`,
  type: "thought",
  title: "t",
  summary: "s",
  links,
  public: true,
  length: "short",
  date: "2026-01-01",
  body: "b",
});

test("seed content is valid", () => {
  assert.deepEqual(validateContent(allItems), []);
});

test("a broken link id is reported", () => {
  const errors = validateContent([thought("thought/a", ["thought/missing"])]);
  assert.deepEqual(errors, ['thought/a: broken link "thought/missing"']);
});

test("a broken throughline node is reported", () => {
  const errors = validateContent([
    {
      id: "throughline/x",
      type: "throughline",
      title: "t",
      summary: "s",
      links: [],
      public: true,
      nodes: ["thought/missing"],
    },
  ]);
  assert.deepEqual(errors, ['throughline/x: broken node "thought/missing"']);
});

test("duplicate ids are reported", () => {
  const errors = validateContent([thought("thought/a", []), thought("thought/a", [])]);
  assert.deepEqual(errors, ["thought/a: duplicate id"]);
});

test("private people are excluded from public queries", () => {
  const people = getPublic("person");
  assert.ok(people.length > 0);
  assert.ok(people.every((person) => person.public));
  assert.ok(allItems.some((item) => item.type === "person" && !item.public));
});
