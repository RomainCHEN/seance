# Path C — a new, eligible project (proposal + build plan)

Written after establishing that PaperCraft cannot be submitted: it is a Final Year Project whose
development period is **May–October 2026** and whose final report was submitted **24 October 2026**
— before the Kiroween submission period opened on 30 October 2026. The rules require a project
"newly created … after the start of the Submission Period".

The *idea* behind PaperCraft is still usable. The *work* is not. So: build something small, new,
and honest — during the period, with Kiro, in the open.

## Rulewright — the rule distiller

**One line:** turn a pile of "before → after" teacher corrections into a small set of reviewable,
machine-checkable rules — and prove each rule with counterexamples before anyone accepts it.

PaperCraft's most interesting claim was that recurring corrections become rules a teacher accepts.
Rulewright is that claim, extracted into a standalone tool that needs no dataset, no login and no
model: it operates on edit pairs you paste in.

### Why this is a good hackathon entry

- **Real audience**: anyone maintaining a style guide, a prompt, a rubric or a house style — they
  all have "corrections that keep recurring" and no way to turn them into checkable rules.
- **Honest technical core**: diff normalisation, clustering, rule induction and a counterexample
  search are all deterministic, so they can be property-tested — and the demo needs no API key.
- **It shows Kiro properly**: the spec can be written before the code, the invariants are testable,
  and the CLI gives Kiro something to iterate against.

### Scope (v1, deliberately small)

```
packages/rule-core        pure TypeScript, no I/O
  diff.ts                 word-level diff of (before, after) → ops[insert|delete|replace]
  cluster.ts              group ops by context signature, rank by frequency
  induce.ts               op cluster → candidate rule {pattern, scope, action, confidence}
  refute.ts               deterministic counterexample search over the provided corpus
  apply.ts                run accepted rules over a new draft → findings
apps/studio               one page: paste pairs → see clusters → accept rules → check a draft
cli/                      `rulewright distill corpus.json` → rules.yaml
.kiro/                    steering, specs (EARS + invariants), hooks
```

**Non-goals:** no LLM in the demo path, no accounts, no database. (An optional model-based
refuter can sit behind the same interface later — same trick as Séance's `Transport`.)

### Kiro usage plan (all of it recordable, none of it invented)

| Kiro surface | How it will actually be used |
|---|---|
| `.kiro/specs/rulewright/` | requirements (EARS) → design → tasks, written before the code |
| `.kiro/steering/` | product / tech / structure, always-on; the tech file pins determinism again |
| `.kiro/hooks/` | test-on-save + typecheck-on-save |
| Kiro CLI audit | `--trust-tools=fs_read` review of each module against the spec, logged verbatim |
| Custom agent | `rule-refuter`: read-only agent that argues each induced rule is wrong, with counterexamples |
| PBT | invariants: rule application is idempotent, no rule can fire on its own anchor, cluster count ≤ op count, accepted-rule set is order-independent |

The custom agent is the interesting part: an adversarial reviewer with a narrow job is exactly
what a rule-inducing system needs, and it produces a demo beat ("here is the rule the auditor
killed").

### Build order (each step ends with something runnable)

1. repo skeleton + `.kiro` spec files + LICENSE + README (half a day)
2. `diff.ts` + `cluster.ts` with property tests
3. `induce.ts` + `refute.ts`, then the CLI
4. `apps/studio` reusing the visual language already built for Séance
5. Kiro CLI audit + `rule-refactor` agent run, logs captured
6. video (headless frame capture — the pipeline already exists), blog, social, Devpost

### What I need from you to start

Nothing but a **yes**. Everything above runs without credentials.

### What it costs

The design, spec, core and tests are ~1–2 days of agent work; the studio build is the same again.
Deadline is 2026-12-04, so the schedule has slack.

### Alternative if you would rather not build

Submit Séance now (it is complete and eligible) and keep the option to edit until 2026-12-04.
