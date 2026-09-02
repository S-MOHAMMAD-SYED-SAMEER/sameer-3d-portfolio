# sameer-3d-portfolio

Interactive portfolio for S Mohammad Syed Sameer — AI Automation Engineer.

The site has two modes that share one data layer and one design system:

- **Normal** (`/normal`) — fast, traditional, recruiter-friendly.
- **3D Experience** (`/3d`) — an immersive WebGL environment.

A mode switch sits on every page except the landing page, which is itself
the choice between them.

## Stack

Vite · React · TypeScript · Tailwind CSS · React Three Fiber · Three.js · drei · React Router

## Routes

| Route | What it is |
| --- | --- |
| `/` | Landing page — the entry point and mode choice. |
| `/normal` | The full portfolio as a document: selected work, capabilities, projects, about, contact. |
| `/3d` | The 3D experience. |
| `/projects/:id` | Per-project case study (`p1`, `p2`, `p3`). |
| `/projects/:id/demo` | A project's interactive demo. Only `p3` has one today; any other id renders the not-found page. |

Routes are declared once in `src/lib/routes.ts` and mounted in `src/App.tsx`,
so links never drift from the router.

### `/normal`

A single scrolling document built from the same data as everything else:
selected work, capabilities, projects, about, and contact. It never downloads
Three.js — the 3D route is lazy-loaded.

### `/3d`

A cinematic arrival followed by an explorable space. The arrival runs through
an ordered set of stages (`intro → entrance → approachDoor → knock → knocking
→ doorOpen → welcome → workshop`) defined in `src/systems/experienceStage.ts`.
The final stage is the workshop, where five areas — projects, skills,
services, about, contact — are reachable as a layer beside the journey rather
than as further stages.

The scene respects `prefers-reduced-motion`, and the `Canvas` is mounted only
by the 3D route so leaving it releases the WebGL context. A WebGL boundary
handles contexts that fail to acquire.

### Project pages

Three projects live in `src/data/projects.ts`. Each case study renders from
that file alone — problem, approach, architecture, engineering, result — along
with screenshots of the project actually running, stored in `public/projects/`.
Deployment state is a field on the project (`live` or `demo-pending`), not
prose, so a page can never claim a demo that does not exist.

## The Explainable ATS demo (`/projects/p3/demo`)

Project 3, the Explainable ATS, is an applicant tracking system that scores
candidates with logic you can read back and audit. It has no public
deployment, so the portfolio runs its pipeline in the browser instead.

`src/demo/p3/vendored/` is that project's own source, copied byte for byte from
[`ai-business-automation/explainable-ats`](https://github.com/S-MOHAMMAD-SYED-SAMEER/ai-business-automation/tree/main/explainable-ats).
Every judgement — redaction, evidence verification, requirement matching,
scoring, ranking — is made by a vendored function. `src/demo/p3/run.ts`
composes them and owns nothing but ids, timestamps and the audit events the
server's repository would have written.

The demo is **deterministic, offline and browser-safe**:

- No network calls. Nothing is fetched, and no API key exists to leak.
- No `Math.random()`, no `Date.now()` in the pipeline — the same input always
  produces the same run, stage for stage.
- The LLM step is the project's own mock provider with a deterministic
  extractor, not a live model.
- `src/demo/p3/dataset.gen.ts` is generated, not hand-written. Every person,
  employer, address, email and phone number in it is invented; emails use the
  `.invalid` TLD and phone numbers come from the range reserved for fiction.

Two guards keep the copy honest, both in the source repository: the exporter's
`--check` mode proves the copied *files* match, and `demo-parity.test.ts`
proves the copied *system* matches — the real pipeline, seeded into a database,
must reach identical decisions to the browser runner.

The demo is its own lazy-loaded chunk, so a visitor reading `/normal` never
downloads an ATS.

## Local development

```bash
npm install
npm run dev        # dev server
npm run typecheck  # tsc -b
npm run lint       # oxlint
npm run build      # tsc -b && vite build
npm run preview    # serve the production build
```

There is no test runner in this repository. The Explainable ATS tests,
including the parity test that covers the vendored demo, live in the
`ai-business-automation` repository and run there with `npm test`.

## Structure

```
public/
  favicon.svg
  projects/           project screenshots, root-relative
src/
  components/         shared UI (ActionButton, ActionLink)
  components/3d/      everything inside the WebGL boundary
    camera/           the cinematic rig
    character/        the host figure
    entrance/         the hall, portal, door and name board
    workshop/         the space beyond the door
  components/experience/   overlay, panels, dialogue, WebGL boundary
  components/navigation/   mode switch
  components/normal/       the Normal portfolio's project surfaces
  data/               single source of truth — projects, profile, copy,
                      scene dimensions, camera poses, pacing
  demo/p3/            the Explainable ATS demo
    vendored/         the project's own source, copied verbatim
  demo/ui/            demo chrome shared across demos
  hooks/
  lib/                routes, small utilities
  pages/              one file per route
  systems/            cross-cutting app systems (mode, stage, workshop area)
```

`@/` resolves to `src/` (see `vite.config.ts` and `tsconfig.app.json`).

## Conventions

- `src/data/projects.ts` is the only place project facts live. Never restate
  a project's tests, evaluation, or links inside a component.
- Only `src/components/3d/` imports Three.js. The `Canvas` is mounted solely
  by the 3D route so leaving it releases the WebGL context.
- Never call `setState` from `useFrame`.
- The 3D route, case studies and the demo are each lazy-loaded.
- Scene dimensions, palette, camera poses and pacing live in `src/data/`,
  not in the components that draw them.
- Nothing in `src/demo/p3/vendored/` is edited by hand. It is regenerated from
  the source project, and the exporter's `--check` mode verifies it.

## Deployment

Live at <https://sameer-3d-portfolio-amber.vercel.app>, deployed from `main`
on Vercel.

`npm run build` produces the static bundle in `dist/` that is served.
`vercel.json` rewrites paths with no file behind them to `index.html`, so a
client-side route opened directly — `/projects/p3/demo` being the one that
matters — reaches the router instead of the host's 404. Vercel checks the
filesystem first, so built assets still serve themselves.
