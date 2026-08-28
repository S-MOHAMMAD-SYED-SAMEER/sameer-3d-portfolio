# sameer-3d-portfolio

Interactive portfolio for Sameer — AI Automation Engineer.

The site has two modes that share one data layer and one design system:

- **Normal** (`/normal`) — fast, traditional, recruiter-friendly.
- **3D Experience** (`/3d`) — immersive interactive environment.

Visitors switch between them from anywhere.

## Status

Phase 1 (foundation) is complete: app shell, routing, mode system, design
tokens, project data layer, and an isolated WebGL boundary with a placeholder
scene. The 3D world itself is not built yet.

## Stack

Vite · React · TypeScript · Tailwind CSS · React Three Fiber · Three.js · drei · React Router

## Commands

```bash
npm install
npm run dev        # dev server
npm run typecheck  # tsc -b
npm run lint       # oxlint
npm run build      # typecheck + production build
npm run preview    # serve the production build
```

## Structure

```
src/
  components/         shared UI
  components/3d/      everything inside the WebGL boundary
  components/navigation/
  components/projects/
  data/               single source of truth (projects, profile)
  hooks/
  lib/                routes, small utilities
  pages/              one file per route
  systems/            cross-cutting app systems (experience mode)
```

## Conventions

- `src/data/projects.ts` is the only place project facts live. Never restate
  a project's tests, evaluation, or links inside a component.
- Only `src/components/3d/` imports Three.js. The `Canvas` is mounted solely
  by the 3D route so leaving it releases the WebGL context.
- Never call `setState` from `useFrame`.
- The 3D route is lazy-loaded so the Normal portfolio never downloads Three.js.
