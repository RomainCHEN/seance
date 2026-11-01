---
inclusion: always
---

# Tech

## Stack

- **Language**: TypeScript (strict), ES2022, ESM.
- **Runtime/build**: Node.js 20+, npm workspaces, Vite 5.
- **UI**: React 18 function components + hooks. No CSS framework, plain CSS modules per
  package so the template has no design-system dependency.
- **Tests**: Vitest for unit tests, fast-check for property-based tests.
- **Deploy**: static build per app, published to GitHub Pages.

## Workspace layout

```
packages/seance-core     pure engine: personas, turns, verdict, seeded RNG
packages/seance-ui       shared React shell: Room, AgentCard, Transcript, Verdict
template/                the copyable skeleton (wires core+ui, one page, one persona file)
apps/code-seance/        reference app #1
apps/postmortem-seance/  reference app #2
```

## Commands

```bash
npm install             # install all workspaces
npm test                # vitest run across workspaces
npm run build           # build template + both apps into dist/
npm run dev:code        # dev server for apps/code-seance
npm run dev:postmortem  # dev server for apps/postmortem-seance
npm run typecheck       # tsc --noEmit for every workspace
```

## Determinism rules

- The engine must be a **pure function** of `(artifact, personas, seed, turns)`.
- No `Math.random()`, no `Date.now()`, no `crypto.randomUUID()` inside `seance-core`.
  Use the injected `Rng` and `Clock` interfaces.
- Persona ordering must be stable and explicit; never rely on object key order.

## Code style

- Named exports only; no default exports.
- Every exported function in `seance-core` carries a one-line JSDoc describing its contract.
- Tests live next to the source as `*.test.ts`; property tests as `*.property.test.ts`.
- No `any`; use `unknown` + narrowing. `tsc` runs with `strict` and `noUncheckedIndexedAccess`.

## Data files

- Personas: YAML, one file per persona, under `apps/<app>/personas/*.yaml`.
- Scoring weights: `apps/<app>/scoring.yaml`.
- Parsing is done once at module load and validated by `parsePersona`; invalid data throws a
  descriptive error naming the field.
