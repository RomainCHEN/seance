# Design — Agent Room

## Shape of the solution

Three layers, one direction of dependency:

```
artifact + personas + seed
          │
          ▼
   packages/seance-core          pure, no DOM, no React, no I/O
   ┌───────────────────────┐
   │ parsePersona          │  schema validation, throws ValidationError
   │ orderPersonas         │  explicit order, ties by id, no mutation
   │ scanLens              │  case-insensitive keyword scan per lens
   │ runRoom               │  turns → findings → transcript
   │ scoreFindings/decide  │  severity weights → 0..100 → ship|revise|block
   └───────────────────────┘
          │  Transcript (plain data)
          ▼
   packages/seance-ui            React shell, no persona content
   ┌───────────────────────┐
   │ Room                  │  editor + seed + transcript + verdict
   │ AgentCard             │  one turn: narrative + findings with evidence
   │ VerdictCard           │  score, decision, counts, meter
   └───────────────────────┘
          ▲
          │  app.config (title, copy, personas, scoring)
   apps/<app>                     data only
```

## Why the engine is pure

A multi-agent run is normally inseparable from the model call, so it cannot be asserted on.
Séance keeps the *shape* of a run (who speaks, in what order, reacting to which evidence) and
makes that shape a pure function. Live model calls would be a `Transport` implementation that
produces the same `Finding` objects; nothing in the UI or the scoring would change.

Consequences that the design leans on:

- **Replay** — a transcript can be regenerated from `(artifact, personas, seed)` with no storage.
- **Testability** — property tests can assert invariants over thousands of generated rooms.
- **Demo safety** — the public build makes zero network calls, so judges cannot hit a rate limit,
  and a demo recording can never drift from what the site does.

## Determinism boundary

| Allowed | Forbidden inside `seance-core` |
|---|---|
| `hashString`, `createRng`, `jitter`, `pickIndex` | `Math.random()` |
| explicit `order` fields | object key order |
| values passed in arguments | `Date.now()`, `performance.now()` |
| — | network, storage, DOM |

Sorting is a stable explicit sort (`order`, then `id`). The persona array is copied before
sorting, so the caller's data is untouched (property P6).

## Scoring

```
raw      = Σ weight(finding.severity)          # risk 10, warn 4, note 1
capacity = personaCount × capacityPerPersona    # default 30
score    = round(clamp(100 × raw / capacity, 0, 100))
decision = score < 30 ? ship : score < 70 ? revise : block
```

Weights live in `apps/<app>/scoring.yaml` (and `template/scoring.yaml`), never in the engine.

`capacityPerPersona` is deliberately *independent of the finding count*: an earlier draft divided
by the number of findings, which made the score non-monotonic (adding a `risk` finding could
lower the result). Property P3 caught it; the current formula makes the score monotonic by
construction.

## Turn generation

For each persona, in order:

1. For each lens, scan each artifact line for the lens's keywords (case-insensitive).
2. Keep at most `MAX_FINDINGS_PER_LENS = 2` hits per lens, one per line, so a repetitive file
   cannot flood the transcript.
3. Emit a `Finding` carrying the lens severity, the 1-based line number, and ≤120 characters of
   quoted evidence.
4. Choose a phrase from `phrases.{none|some|many}`, split on `|`, indexed by
   `pickIndex(seed, variants.length, persona.id, turnIndex, hitCount)` — so the seed re-voices the
   room without changing a single finding.

## Errors

`ValidationError` carries a `field` path (`persona.lenses[0].severity`) so the UI can show the
message verbatim. A blank artifact refuses to run rather than producing an empty transcript, and
the UI renders that as an inline alert (R9).

## UI decisions

- One screen, no navigation: the editor, the transcript and the verdict are the product.
- The transcript is an ordered list of articles, not a chat log — turns are parallel reviews of
  the same artifact, and the layout should not imply a conversation.
- Severity is colour plus a word (`RISK` / `WARN` / `NOTE`), never colour alone.
- The offline script engine is labelled in the header (R12), because a viewer must never believe
  a model is being called.
- `prefers-reduced-motion` disables the meter transition.

## Template contract

A new room may add: personas, `scoring.yaml`, copy, an artifact. It may not need to touch
`seance-core` or `seance-ui`. The two reference apps are the proof: they share zero
app-specific code and differ only in data and copy.

## Trade-offs accepted

- Keyword lenses are intentionally shallow: the template demonstrates plumbing, and a deeper
  analyser would be app-specific (and would need a model).
- No persistence: shareability comes from the deterministic seed, not from storing rooms.
- No i18n in v1.
