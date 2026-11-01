# Tasks — Agent Room

Status legend: `[x]` done and verified · `[~]` done, needs polish · `[ ]` open.

## 1. Engine (`packages/seance-core`)

- [x] 1.1 Define domain types (`Persona`, `Lens`, `Finding`, `Turn`, `Verdict`, `Transcript`, `Scoring`)
- [x] 1.2 `ValidationError` with a field path
- [x] 1.3 `parsePersona` — validate id/name/role/order/voice/lenses/phrases, name the first bad field
- [x] 1.4 `orderPersonas` — explicit order, tie by id, reject duplicate ids, never mutate input
- [x] 1.5 `scanLens` — case-insensitive keyword scan, ≤2 hits per lens, one hit per line
- [x] 1.6 `runRoom` — one turn per persona, narrative chosen by seeded phrase variants
- [x] 1.7 `scoreFindings` / `decide` — weights → 0..100 → ship/revise/block
- [x] 1.8 `hashString` / `createRng` / `jitter` / `pickIndex` (no `Math.random` anywhere)

## 2. Tests

- [x] 2.1 Unit: persona validation, ordering, duplicate ids
- [x] 2.2 Unit: determinism, per-lens cap, evidence line numbers, blank artifact, empty personas
- [x] 2.3 Unit: verdict boundaries 29/30 and 69/70
- [x] 2.4 Property P1 determinism (fast-check)
- [x] 2.5 Property P2 score bounds
- [x] 2.6 Property P3 monotonicity — **caught a real bug** in the first scoring draft
- [x] 2.7 Property P4 verdict totality
- [x] 2.8 Property P5 turn count 1..8 personas
- [x] 2.9 Property P6 no input mutation
- [x] 2.10 Property P7 ordering independent of input order
- [x] 2.11 Integration: every shipped room's YAML parses and runs

## 3. UI (`packages/seance-ui`)

- [x] 3.1 `Room` — editor, seed control, error state, transcript, verdict
- [x] 3.2 `AgentCard` — persona, voice, narrative, findings with severity + evidence
- [x] 3.3 `VerdictCard` — score, decision, counts, meter, `aria-live`
- [x] 3.4 Stylesheet: dark theme, AA-contrast text, reduced-motion support
- [x] 3.5 Offline-engine label in the header (R12)
- [x] 3.6 Responsive layout under 34rem

## 4. Apps

- [x] 4.1 `template/` — one persona, one page, zero app code
- [x] 4.2 `apps/code-seance` — three reviewers, code sample with deliberate issues
- [x] 4.3 `apps/postmortem-seance` — detective / analyst / process ghost, incident timeline
- [x] 4.4 Each app loads personas and scoring from YAML at build time (`?raw` + `parse`)
- [x] 4.5 Landing page linking template + both apps

## 5. Build & deploy

- [x] 5.1 npm workspaces, `npm run build` → `dist/` with three entry points
- [x] 5.2 `scripts/build-site.mjs` verifies every entry point exists
- [x] 5.3 GitHub Actions workflow: typecheck → test → build → Pages
- [x] 5.4 `npm run typecheck` passes with `strict` + `noUncheckedIndexedAccess`

## 6. Docs

- [x] 6.1 README with architecture, quickstart, properties table, screenshots
- [x] 6.2 `.kiro/specs/agent-room/{requirements,design,tasks}.md`
- [ ] 6.3 `docs/KIRO_USAGE.md` — what was actually used, with evidence
- [ ] 6.4 `docs/VIDEO_SCRIPT.md` — 170s shot list
- [ ] 6.5 `docs/BLOG_DRAFT.md` + `docs/SOCIAL_DRAFT.md`
- [ ] 6.6 `docs/DEVPOST.md` — submission copy

## 7. Follow-ups (not blocking submission)

- [~] 7.1 Hooks are declarative only; verify the commands work against the built workspace
- [ ] 7.2 Optional live-LLM transport behind the same `Finding` type
- [ ] 7.3 Persist the last artifact + seed in `location.hash` for shareable rooms
