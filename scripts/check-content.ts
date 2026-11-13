/** Lists every content item and exits non-zero on any validation error. */
import { allItems, CONTENT_TYPES } from "../src/content";
import { validateContent } from "../src/content/validate";

for (const type of CONTENT_TYPES) {
  const items = allItems.filter((item) => item.type === type);
  console.log(`\n${type} (${items.length})`);
  for (const item of items) {
    const flags = [item.public ? "public" : "private", item.placeholder ? "placeholder" : ""]
      .filter(Boolean)
      .join(", ");
    console.log(`  ${item.id}  [${flags}]  -> ${item.links.length} link(s)`);
  }
}

const errors = validateContent(allItems);
if (errors.length > 0) {
  console.error(`\n${errors.length} content error(s):`);
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}
console.log(`\n${allItems.length} items, all links resolve.`);
