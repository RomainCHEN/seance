# How Kiro was used — Séance (Kiroween 2026)



## 1. Which Kiro surfaces were used

| Surface | Used for | Evidence |
|---|---|---|
| **Kiro Web** (`app.kiro.dev`) | Account verification and retrieving the Kiro user ID required by the credits form | `log/state.md` — `Signed in with BuilderId`, user ID copied from `app.kiro.dev/settings/account` |
| **Kiro CLI** (`kiro-cli` 2.32.0) | Requirement-by-requirement review of `packages/seance-core` against `.kiro/specs/agent-room/requirements.md` | `docs/kiro-cli-audit.log` — 12 requirements audited with `file:line` citations, 3 defects reported, 2 fixed |
| **Kiro spec files** (`.kiro/specs/agent-room/`) | Requirements → design → tasks, written before the code | `.kiro/specs/agent-room/{requirements,design,tasks}.md` |
| **Kiro steering** (`.kiro/steering/`) | Always-on project memory for product, tech and structure | three files, `inclusion: always` |
| **Kiro hooks** (`.kiro/hooks/`) | Run tests and typecheck on file save | `test-on-save.json`, `typecheck-on-save.json` |
| **Custom agent** (`.kiro/agents/room-auditor.json`) | Read-only room auditor: checks personas against the spec, finds "dead lenses" that can never fire, verifies scoring.yaml | `docs/kiro-cli-room-auditor.log` — found 2 dead lenses, re-run after the fix returned PASS |
| MCP / powers | not used | — |

The repo keeps `/.kiro` at its root and it is explicitly **not** ignored — see the comment at the
bottom of `.gitignore`.

## 2. Spec-driven development

The spec was written before the implementation, in the order Kiro expects:

1. **`requirements.md`** — 12 EARS statements (`WHEN ... THE System SHALL ...`), plus six
   property-based invariants written as testable claims rather than prose.
2. **`design.md`** — the layering, the determinism boundary table, the scoring formula and its
   rationale, the error model, and the template contract.
3. **`tasks.md`** — 33 checkable tasks across engine, tests, UI, apps, build and docs.

What the spec changed, concretely:

- R3 ("order turns by explicit `order`, ties by `id`, never file-system order") is why
  `orderPersonas` does a stable explicit sort instead of trusting the YAML load order — a bug that
  would only appear when a persona file was renamed.
- R6 ("two runs SHALL produce deeply equal transcripts") forced the RNG out of the engine and
  into `jitter(seed, ...labels)`, which is also what makes property P1 expressible at all.
- R9 ("refuse to run on a blank artifact") exists because the first UI draft happily rendered an
  empty transcript with a 0 score, which reads as "ship it" — the spec turned that into a visible
  validation error.

### Spec-driven vs. vibe coding

Vibe coding produced the first working transcript in one pass — and the first scoring formula
**divided by the number of findings**, so adding a `risk` finding could make the score go *down*.
It looked fine on the sample artifact. The spec had already written the invariant down
("adding one `risk` finding never lowers the score"), so the property test existed before the bug
did, and it failed immediately. That is the difference in practice: vibe coding optimises for the
next screenshot, the spec optimises for the invariant you cannot see.

## 3. Steering strategy

Three files, all `inclusion: always`, each chosen because it removes a specific class of wrong
output:

| File | What it prevents | Where you see it in the code |
|---|---|---|
| `product.md` | scope creep into "a chat app" / "a model gateway"; keeps the demo key-free | `Transport` is not implemented at all in v1; the UI says "offline deterministic script engine" |
| `tech.md` | the engine reaching for `Math.random()`, `Date.now()`, or React | `packages/seance-core` imports nothing but its own files |
| `structure.md` | app-specific logic leaking into the template | the two apps differ only in `personas/*.yaml`, `scoring.yaml`, `sample.ts` and copy |

The single highest-leverage line was in `tech.md`:

> No `Math.random()`, no `Date.now()`, no `crypto.randomUUID()` inside `seance-core`. Use the
> injected `Rng` and `Clock` interfaces.

Every determinism guarantee in this repo follows from that one paragraph. Keeping it always-on
meant it applied to every file the agent touched, not just the one where the conversation
happened to mention determinism.

## 4. Hooks

Both hooks are `PostFileSave` on `\.(ts|tsx)$`:

- `.kiro/hooks/test-on-save.json` → `npm test -- --run`
- `.kiro/hooks/typecheck-on-save.json` → `npm run typecheck`

They matter more than they look: `tsconfig.json` runs with `strict` **and**
`noUncheckedIndexedAccess`, so `lines[index]` is `string | undefined`. Without a typecheck on
save, that class of error surfaces only at build time on CI, after a broken commit.

## 5. Property-based testing — the one thing that paid for itself

Six invariants (P1–P7 in `tasks.md`) are exercised with `fast-check` over generated personas,
artifacts and finding lists. The scoring bug described in §2 was caught by **P3**, on generated
inputs, within seconds of the property being written. A unit test with the sample artifact passed
before and after the fix, because the sample never produced the out-of-order case.

PBT was the right tool here because the domain is a pure function over generated data: there is
no network, no clock, no database — so a generated input is as valid as a hand-written one.

## 5b. The custom agent (`room-auditor`)

Kiro CLI picks up project-local agents from `.kiro/agents/`, so the audit is reproducible by
anyone who clones the repo:

```bash
kiro-cli chat --agent room-auditor --no-interactive --model auto "Audit the repository now."
```

The agent is deliberately constrained: `tools: [fs_read, grep, glob, thinking]` and a prompt that
says **read-only, never invent a file or line, end with PASS or FAIL**. That constraint is what
makes its output usable as evidence rather than as another opinion.

It found something no test could: a **dead lens**. `style-wraith` had a `naming` lens looking for
`tmp`, `data2`, `copy`, `var ` — and the sample artifact contained none of them, so that reviewer
had a lens that could never fire and the demo silently showed two lenses instead of three. The
template had the same problem with its `contradictions` lens.

The fix was not to delete the lens but to make the sample *exercise* it — a real `const tmp =
req.body.items` in the diff, and a `however` in the release notes. A second run returned PASS.
Finding counts went from 14 to 15, and the verdict from 84 to 86 / Blocked.

## 6. What the Kiro CLI audit changed

The audit ran as:

```bash
kiro-cli chat --no-interactive --model auto --trust-tools=fs_read \
  "Read .kiro/specs/agent-room/requirements.md, then engine.ts / persona.ts / verdict.ts.
   For each requirement R1-R12 say PASS or FAIL with file:line evidence.
   Then list concrete defects. Do NOT modify files."
```

`--trust-tools=fs_read` was deliberate: the auditor could read the repo but not edit it, so its
output is evidence rather than a second author. It returned 11 PASS / 1 FAIL and three concrete
defects. Two were real enough to fix immediately:

| Kiro CLI finding | What we did |
|---|---|
| **R7 partial** — nothing inside `seance-core` proves an app actually loads `scoring.yaml`; a misconfigured app silently falls back to `DEFAULT_SCORING` | Added `rooms.test.ts` cases that read each room's `scoring.yaml`, assert the weights, and run the room through them. The wiring is now covered by CI instead of convention. |
| **Silent fallback in `speak()`** — a phrase made only of `|` separators produces zero variants and falls back to the raw string, emitting unreplaced `{hits}` | Added `requirePhrases()` to `parsePersona`: a phrase with no non-empty variant now throws `ValidationError` naming the field, plus two regression tests. |
| `decide()` boundary comment | Confirmed correct against R8 (`<30`, `<70`); added to the review log rather than changing code. |

That is the loop worth reporting: **spec → implementation → an independent audit that reads the
spec**, not "ask the model to write more code". The auditor also caught that R10–R12 are UI
requirements and correctly marked them out of scope for the files it was given — it did not
fabricate PASS lines, which is the failure mode you actually care about in an AI review.

> Note on accounts: Kiro Web was signed in as one Builder ID and Kiro CLI as another
> (`kiro-cli whoami` → `Logged in with Builder ID, Email: oct19@…`). The credits form must name the
> account the project was actually built with, so the submission uses the CLI account's user ID
> and `log/state.md` records both.

## 7. What was not used, and why

- **MCP**: the project has no external system to attach to. Adding an MCP server would have been
  decoration, and the rules judge effective use, not surface count.
- **Kiro powers**: same reasoning.
- **Custom agents**: not used — the stock agent with `--trust-tools=fs_read` was enough for the audit.

## 8. Reproduction

```bash
git clone <repo>
npm install
npm test        # 27 tests, incl. 6 property invariants
npm run build   # both apps + landing page into dist/
```
