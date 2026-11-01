---
inclusion: always
---

# Structure

## Repository map

| Path | Responsibility | May import |
|---|---|---|
| `packages/seance-core/` | Pure engine: persona schema, seeded RNG, turn loop, verdict aggregation. No DOM, no React, no I/O. | nothing but stdlib |
| `packages/seance-ui/` | Reusable React shell that renders a `Room` from `seance-core` types. Styling lives here. | `seance-core` |
| `template/` | Copyable skeleton: `index.html`, `src/main.tsx`, one `personas/` folder, `vite.config.ts`. | `seance-core`, `seance-ui` |
| `apps/code-seance/` | Reference app #1 (code review room). | `seance-core`, `seance-ui` |
| `apps/postmortem-seance/` | Reference app #2 (incident postmortem room). | `seance-core`, `seance-ui` |
| `docs/` | Submission docs: Kiro usage writeup, video script, blog + social drafts. | — |
| `.kiro/` | Kiro steering, specs, hooks. Must stay at the repo root. | — |

## Where things go

- New persona → `apps/<app>/personas/<id>.yaml` (never inline in TSX).
- New scoring rule → `apps/<app>/scoring.yaml`.
- New UI primitive used by ≥1 app → `packages/seance-ui/src/components/`.
- App-specific copy, titles, and headings → `apps/<app>/src/app.config.ts`.
- Anything reusable by a third party → `template/`, not an app.

## Naming

- Packages: `@seance/core`, `@seance/ui`.
- React components: `PascalCase.tsx`; hooks: `useThing.ts`; pure helpers: `kebab-case.ts`.
- Test files mirror the source file name.

## Adding a third app (template contract)

1. `cp -r template apps/my-room`
2. Edit `personas/*.yaml` and `src/app.config.ts`.
3. `npm run build -w apps/my-room`
No edits to `seance-core` or `seance-ui` should be required. If one is required, the template
has a bug — fix the template first.
