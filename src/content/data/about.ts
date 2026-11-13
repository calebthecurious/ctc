import type { Decade } from "../types";

/** The decade plan. Not graph nodes: this is the frame the nodes hang on. */
export const DECADES: readonly { key: Decade; age: string; verb: string; text: string; now?: boolean }[] = [
  {
    key: "connect",
    age: "30s",
    verb: "Connect",
    text: "Technology that helps communities connect more seamlessly.",
    now: true,
  },
  {
    key: "preserve",
    age: "40s",
    verb: "Preserve",
    text: "Health-tech. Life preservation and dementia are the problems I care about.",
  },
  {
    key: "grow",
    age: "50s",
    verb: "Grow",
    text: "Ag-tech. Society benefits when people grow some of the food they eat.",
  },
  {
    key: "sail",
    age: "60s",
    verb: "Sail",
    text: "Sea preservation. Sailing and diving around the world with the experts I've met along the way, building projects together.",
  },
];

/** The yearly rotation: three or four bases a year, chasing the sun. */
export const BASES: readonly { name: string; role: string }[] = [
  { name: "Melbourne", role: "Home." },
  { name: "Koh Tao, Thailand", role: "The island base." },
  { name: "San Francisco, Singapore or New York", role: "A city that inspires me." },
  { name: "Chamonix", role: "The mountain base, training for UTMB Mont-Blanc." },
];

// PLACEHOLDER: replace with real contact details.
export const CONTACT: readonly { label: string; value: string; href?: string }[] = [
  { label: "Email", value: "PLACEHOLDER: email address" },
  { label: "GitHub", value: "calebthecurious", href: "https://github.com/calebthecurious" },
  { label: "LinkedIn", value: "PLACEHOLDER: LinkedIn profile" },
];
