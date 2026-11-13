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
- `npm run check:routes` (needs `npm run start` running)
- `npm run check:run` (needs `npm run start` running and Playwright installed)

## The run

- All 3D lives in `src/run/`. `RunCanvas.tsx` is the lazy chunk; nothing outside
  `src/run/` may import three.js.
- One store (`src/run/store.ts`): scroll writes `target`, the rig smooths it into
  `progress`, everything else reads `progress` and `velocity`. Read it with
  `getState()` inside `useFrame`, never through a React subscription.
- The world sits on a drum that turns about X. Place things with `onDrum(at)`
  from `src/run/placement.ts`, where `at` is the progress at which they reach the runner.
- Stages and aid stations are data: edit `src/run/stages.ts` only. Lengths are
  relative weights; positions, palette blending, the indicator, the cards and the
  greybox all derive from it (`src/run/stage-math.ts`).
- `src/run/RunOverlay.tsx` is the HTML layer over the canvas. It must not import three.js.
- `public/models/runner.glb` replaces the placeholder runner at build time.

## Art direction

Dark-first. Base `#0A0A0F`, accent `#00D9C0`. Quiet UI: small type, generous
space, no drop shadows.
