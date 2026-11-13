import { CONTENT_TYPES, type ContentItem } from "./types";

/** Returns one message per problem. An empty array means the content is valid. */
export function validateContent(items: readonly ContentItem[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const item of items) {
    if (ids.has(item.id)) errors.push(`${item.id}: duplicate id`);
    ids.add(item.id);

    if (!CONTENT_TYPES.includes(item.type)) {
      errors.push(`${item.id}: unknown type "${item.type}"`);
    }
    if (!item.id.startsWith(`${item.type}/`) || item.id.endsWith("/")) {
      errors.push(`${item.id}: id must be "${item.type}/<slug>"`);
    }
    if (!item.title.trim()) errors.push(`${item.id}: empty title`);
    if (!item.summary.trim()) errors.push(`${item.id}: empty summary`);
  }

  for (const item of items) {
    for (const link of item.links) {
      if (!ids.has(link)) errors.push(`${item.id}: broken link "${link}"`);
      if (link === item.id) errors.push(`${item.id}: links to itself`);
    }
    if (item.type === "throughline") {
      if (item.nodes.length === 0) errors.push(`${item.id}: throughline has no nodes`);
      for (const node of item.nodes) {
        if (!ids.has(node)) errors.push(`${item.id}: broken node "${node}"`);
      }
    }
    if (item.type === "place-month") {
      for (const month of item.months) {
        if (!Number.isInteger(month) || month < 1 || month > 12) {
          errors.push(`${item.id}: invalid month ${month}`);
        }
      }
    }
  }

  return errors;
}
