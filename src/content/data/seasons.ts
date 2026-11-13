import type { PlaceMonth } from "../types";

/**
 * The 12-month wheel. Only three entries are seeded; April to August are
 * intentionally empty.
 */
export const seasons: PlaceMonth[] = [
  {
    id: "place-month/japan-march",
    type: "place-month",
    title: "Japan in March",
    summary: "Snowboarding.",
    links: [],
    public: true,
    place: "Japan",
    months: [3],
    reason: "Snowboarding.",
  },
  {
    id: "place-month/melbourne-spring",
    type: "place-month",
    title: "Melbourne in spring",
    summary: "Spring Carnival.",
    links: ["story/placeholder-leaving-home"],
    public: true,
    place: "Melbourne",
    months: [9, 10, 11],
    reason: "Spring Carnival.",
  },
  {
    id: "place-month/thailand-dry-season",
    type: "place-month",
    title: "Thailand in dry season",
    summary: "Dry season.",
    links: [],
    public: true,
    place: "Thailand",
    // PLACEHOLDER: confirm which months count as dry season for your base.
    months: [12, 1, 2],
    reason: "Dry season.",
    placeholder: true,
  },
];
