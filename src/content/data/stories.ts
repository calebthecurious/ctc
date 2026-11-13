import type { Story } from "../types";

// PLACEHOLDER: every story below is seed content. Replace with real stories.
export const stories: Story[] = [
  {
    id: "story/placeholder-first-ultra",
    type: "story",
    title: "PLACEHOLDER: The first ultra",
    summary: "PLACEHOLDER: what happened the first time the distance got silly.",
    links: ["project/placeholder-run-club-platform"],
    public: true,
    placeholder: true,
    format: "text",
    toldAt: "PLACEHOLDER: Toastmasters",
    body: "PLACEHOLDER: story text goes here.",
  },
  {
    id: "story/placeholder-backyard-night",
    type: "story",
    title: "PLACEHOLDER: Lap twenty-something",
    summary: "PLACEHOLDER: a night inside a 24-hour backyard ultra.",
    links: ["story/placeholder-first-ultra"],
    public: true,
    placeholder: true,
    format: "audio",
    toldAt: "PLACEHOLDER: a Moth-style night",
  },
  {
    id: "story/placeholder-leaving-home",
    type: "story",
    title: "PLACEHOLDER: Leaving Melbourne",
    summary: "PLACEHOLDER: the decision to live between bases.",
    links: ["place-month/melbourne-spring", "thought/placeholder-decades"],
    public: true,
    placeholder: true,
    format: "video",
  },
];
