# Requirements — Agent Room

## Purpose

Define the behaviour of the Séance room engine and shell so that two different applications
can be produced from one template, and so that a room is reproducible byte-for-byte.

## Glossary

- **Room**: a configured run of the engine over one artifact.
- **Persona**: a declarative agent definition loaded from YAML.
- **Turn**: one persona's reaction to the artifact.
- **Finding**: a single observation with a severity of `info | warn | risk`.
- **Verdict**: the aggregated decision (`ship | revise | block`) plus a 0–100 risk score.
- **Seed**: a 32-bit unsigned integer that fully determines any randomized choice.

## Requirements (EARS)

### Personas

- **R1** — WHEN a persona file is loaded, THE System SHALL validate `id`, `name`, `role`,
  `lenses` (non-empty) and `voice`, and SHALL throw an error naming the first invalid field.
- **R2** — WHEN two persona files share the same `id`, THE System SHALL reject the room with a
  duplicate-id error.
- **R3** — THE System SHALL order turns by the explicit `order` field, and SHALL break ties by
  ascending `id`, so persona ordering never depends on file system order.

### Turns

- **R4** — WHEN a room runs, THE System SHALL produce exactly one turn per persona, in order.
- **R5** — WHEN a turn produces findings, THE System SHALL attach each finding to the emitting
  persona at that turn number.
- **R6** — THE System SHALL be deterministic: for a fixed `(artifact, personas, seed)`, two runs
  SHALL produce deeply equal transcripts.

### Verdict

- **R7** — WHEN all turns complete, THE System SHALL compute a risk score in `[0, 100]`
  from finding severities using the weights in `scoring.yaml`.
- **R8** — THE System SHALL map the score to a decision: `< 30 → ship`, `30–69 → revise`,
  `>= 70 → block`.
- **R9** — WHEN the artifact is empty or whitespace-only, THE System SHALL refuse to run and
  SHALL return a `ValidationError` instead of a room.

### Sharing

- **R13** — WHEN a room is edited, THE System SHALL keep the address bar's fragment in sync with
  `(artifact, seed)` so the page can be shared as a link.
- **R14** — WHEN a page is opened with a fragment produced by R13, THE System SHALL seed the room
  from it, and SHALL fall back to the app's own defaults when the fragment is absent or invalid.

### Shell

- **R10** — WHEN a transcript is rendered, THE System SHALL show every turn, the persona name,
  the severity of each finding, and the final verdict.
- **R11** — WHEN the user changes the seed, THE System SHALL re-run the room and SHALL render the
  new transcript without a page reload.
- **R12** — THE System SHALL label the offline script engine in the UI so a viewer is never
  misled into thinking a live model is running.

## Property-based testing targets

These are the invariants handed to `fast-check` (see `*.property.test.ts`).

- **P1 (determinism)** — `run(room) === run(room)` for identical inputs (deep equality).
- **P2 (score bounds)** — for any generated finding list, `0 <= score <= 100`.
- **P3 (monotonicity)** — adding one `risk` finding never lowers the score.
- **P4 (verdict totality)** — every score maps to exactly one decision; boundaries 29/30 and
  69/70 follow R8 exactly.
- **P5 (turn count)** — `transcript.turns.length === personas.length` for any persona set of
  size 1..8.
- **P6 (no mutation)** — running the engine twice with the same persona array does not mutate
  the input array or its elements.
- **P7 (ordering)** — persona order is identical for any permutation of the input array.
- **P8 (share round-trip)** — `decodeRoomState(encodeRoomState(x)) === x` for any artifact/seed.
- **P9 (unicode)** — the round-trip holds for arbitrary unicode, including control characters.
- **P10 (hostile fragment)** — `decodeRoomState` never throws; unknown input returns `null`.

## Out of scope (v1)

- Live model calls, streaming over network, persistence, auth, i18n.
