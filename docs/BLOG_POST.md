This post was written as part of the Kiroween 2026 hackathon.

I built [Séance](https://github.com/RomainCHEN/seance), a skeleton template for multi-agent "rooms" —
and two apps from it. This is the part that would have been boring to write about: the personas and
the UI. So instead I want to write about the bug that made the whole design worth it.

## The problem with multi-agent demos

Every multi-agent product I have seen rebuilds the same three things, tangled together:

1. **Who the agents are** — a prompt string inside a component.
2. **How a run unfolds** — inside an effect, next to a network call.
3. **How a run is presented** — bespoke, per product.

Tangling them costs more than tidiness. You cannot test a conversation, you cannot replay a demo,
and changing a persona means editing TypeScript. And any demo that calls a model is at the mercy of
the model: the recording and the live site drift apart within a week.

Séance splits them: personas are YAML, the run is a pure function, the UI takes a transcript.

```ts
runRoom({ artifact, personas, seed }) => Transcript
```

No `Math.random`, no `Date.now`, no I/O. The seed chooses the *wording*; the findings come from the
artifact and the lenses. Same input, same transcript, forever.

## The bug

Here is the first scoring formula I wrote:

```ts
const score = 100 * rawPoints / findings.length;
```

It looked reasonable. A room with more findings should have a higher risk, and dividing by the count
normalises for room size. The sample artifact produced 84/100, which felt right, and every unit test
passed.

Then I wrote the property test that the spec had asked for:

```ts
// adding a risk finding never lowers the score
const before = scoreFindings(findings, personaCount);
const after  = scoreFindings([...findings, riskFinding], personaCount);
expect(after).toBeGreaterThanOrEqual(before);
```

It failed on the second generated input. Of course it did: adding a finding raises the numerator and
*also* raises the denominator, so a high but not top finding can be averaged down. The score could
go **down** when you pointed at a new risk.

The fix is one line of algebra — divide by a capacity that does not depend on the findings:

```ts
const capacity = personaCount * capacityPerPersona;   // e.g. 3 × 30
const score = Math.round(Math.min(100, Math.max(0, 100 * raw / capacity)));
```

Now monotonicity is structural rather than incidental.

## Why property-based testing earned its keep

`fast-check` generated personas, artifacts and finding lists, and checked seven invariants. Six of
them are boring until they fail:

| # | Invariant |
|---|---|
| P1 | determinism — equal inputs give deeply equal transcripts |
| P2 | the score is an integer in `[0, 100]` |
| P3 | adding a `risk` finding never lowers the score ← found the bug |
| P4 | every score maps to exactly one decision at 29/30 and 69/70 |
| P5 | one turn per persona, for any set of 1..8 |
| P6 | the engine never mutates its input array |
| P7 | ordering is independent of input order |

PBT is usually sold on parsers and arithmetic. It fits agent code better than it looks, because a
pure agent engine *is* arithmetic over generated data — there is no clock and no network, so a
generated input is as legitimate as a hand-written one.

## What the steering file did

The single most valuable line in the repo is in `.kiro/steering/tech.md`:

> No `Math.random()`, no `Date.now()`, no `crypto.randomUUID()` inside `seance-core`.

Always-on steering means that rule applied to every file the agent touched, not just the one where
determinism happened to come up in conversation. The predictable thing about an agent is that it
will solve the problem in front of it; steering is how you make "in front of it" bigger.

## The template is the product

Two apps ship with the repo, and neither touches the engine:

- **Code Séance** — Security Specter, Perf Poltergeist, Style Wraith read a diff and return a merge
  verdict.
- **Postmortem Séance** — Timeline Detective, Blast Analyst, Process Ghost read an incident timeline
  and return a root-cause verdict.

Different domains, same three layers. If a third use case needs an engine change, that is a template
bug, not a feature request.

Try it: **https://romain.is-a.dev/seance/**. No key, no login, no network calls — press *Re-run with a new seed* and
watch the room change its voice without changing its evidence.

---

*Source, tests and specs: [github.com/RomainCHEN/seance](https://github.com/RomainCHEN/seance). MIT.*
