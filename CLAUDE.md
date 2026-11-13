@AGENTS.md

# calebthecurious.com: "The Long Run"

Personal site: a scroll-driven 3D run on the home page (Layer A) and plain
server-rendered library routes (Layer B).

## Working rules

- One step at a time, one commit per step. Show command output for every check.
- Ask before destructive operations (deleting files, resetting git, changing a
  dependency's major version).
- Every placeholder in content or code carries the word `PLACEHOLDER`, so one
  search finds them all.
- Library routes (`/work`, `/stories`, `/thoughts`, `/library`, `/people`,
  `/seasons`, `/about`) are server components with no WebGL. All three.js code
  is lazy-loaded and only on the home page.
- 3D uses react-three-fiber and drei, with named imports from `three`.
- In the DOM, animate only `transform` and `opacity`.
- `/people` entries are private by default. Only `public: true` entries may be
  rendered or shipped to the client, and only first name, where we met and a note.

## Content

- Typed content lives in `src/content/` (`types.ts`, `data/*.ts`, loader in `index.ts`).
- Every item has `id`, `type`, `title`, `summary`, `links[]` and `public`.
- `npm run check:content` lists every item and fails on a broken link id.

## Commands

- `npm run dev`, `npm run build`, `npm run lint`
- `npm run typecheck`
- `npm run check:content`
- `npm test`

## Art direction

Dark-first. Base `#0A0A0F`, accent `#00D9C0`. Quiet UI: small type, generous
space, no drop shadows.
