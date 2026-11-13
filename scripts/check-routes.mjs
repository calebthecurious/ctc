/**
 * Checks the library routes against a running server (default http://localhost:3000):
 *   - each route returns 200 and contains its expected seed content
 *   - no private person appears in the HTML or in any script the page loads
 *   - no three.js / WebGL code is in any script the page loads
 * Usage: npm run build && npm run start, then: npm run check:routes
 */
const base = process.argv[2] ?? "http://localhost:3000";

const ROUTES = {
  "/work": ["Run club platform", "Community events app", "Health-tech prototype"],
  "/stories": ["The first ultra", "Lap twenty-something", "Leaving Melbourne"],
  "/thoughts": ["Thinking in decades", "Why community first", "Grow some of what you eat"],
  "/library": ["A paper on dementia", "A book about running", "A talk about community"],
  "/people": ["Alex", "Sam"],
  "/seasons": ["Japan", "Snowboarding", "Melbourne", "Spring Carnival", "Thailand"],
  "/about": ["Connect", "Preserve", "Grow", "Sail", "Chamonix"],
};
const PRIVATE_MARKERS = ["PRIVATE-EXAMPLE", "placeholder-private-example"];
const WEBGL_MARKERS = ["WebGLRenderer", "THREE.", "react-three", "getContext(\"webgl"];

let failed = false;
const fail = (message) => {
  failed = true;
  console.log(`  FAIL ${message}`);
};

for (const [route, expected] of Object.entries(ROUTES)) {
  const response = await fetch(base + route);
  const html = await response.text();
  console.log(`${route}  status ${response.status}`);
  if (response.status !== 200) fail(`status ${response.status}`);

  const missing = expected.filter((text) => !html.includes(text));
  if (missing.length) fail(`missing seed content: ${missing.join(", ")}`);
  else console.log(`  ok   seed content rendered (${expected.length} strings)`);

  const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((match) => match[1]);
  let bytes = 0;
  const sources = [html];
  for (const src of scripts) {
    const body = await (await fetch(new URL(src, base))).text();
    bytes += body.length;
    sources.push(body);
  }
  const all = sources.join("\n");

  const leaked = PRIVATE_MARKERS.filter((marker) => all.includes(marker));
  if (leaked.length) fail(`private person leaked: ${leaked.join(", ")}`);
  else console.log("  ok   no private people in HTML or scripts");

  const webgl = WEBGL_MARKERS.filter((marker) => all.includes(marker));
  if (webgl.length) fail(`three.js/WebGL code found: ${webgl.join(", ")}`);
  else console.log(`  ok   no three.js in ${scripts.length} scripts (${(bytes / 1024).toFixed(0)} kB uncompressed)`);
}

if (failed) process.exit(1);
console.log("\nAll library routes pass.");
