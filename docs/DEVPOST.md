# Devpost submission copy — Séance

## Project name

Séance

## Tagline (≤ 120 chars)

A skeleton template for deterministic multi-agent rooms — with two apps built from it.

## Category

**Skeleton Crew** (one template, two applications)

## Bonus categories targeted

| Bonus | Why we qualify | What to paste |
|---|---|---|
| Best Startup Project | Cofounder of MorphMind | LinkedIn `https://www.linkedin.com/in/profjieding`, startup site `https://morphmind.ai` |
| Blog Post | Public post on a third-party platform during the submission period | ⟪blog URL — pending⟫ |
| Social Blitz | Post starting with `#KiroweenHackathon26` | ⟪post URL — pending⟫ |
| Best Demo | Judged on the Presentation score | — |

> Best Student: **not claimed** — no enrolment evidence to provide.
> Ghost of Kiroween Past: **not claimed** — 2025 participation not confirmed.

## Links

| Field | Value |
|---|---|
| Demo (public, no login) | ⟪https://jiegroup.github.io/seance/ — pending deploy⟫ |
| Code repository | ⟪https://github.com/JieGroup/seance — pending push⟫ |
| Video | ⟪YouTube URL — pending upload⟫ |
| Judge testing credentials | none required — the site is public and makes no network calls |

## Short description (for the listing)

Séance is a skeleton template for multi-agent products where several named agents react to one
artifact and return a single verdict. Personas live in YAML, the turn engine is a pure seeded
function, and the room UI renders any transcript. Because the engine is pure, the same input
always produces the same output — so multi-agent flows can be tested in CI and demoed with no API
key, no network call and no tokens. Two apps ship with the template to prove it generalises:
**Code Séance** (three reviewers read a diff) and **Postmortem Séance** (three investigators read
an incident timeline).

## Full description

### Inspiration

Every team building a multi-agent product rebuilds the same three things, and tangles them
together: who the agents are (prompt strings inside components), how a run unfolds (inside a
React effect, next to network calls), and how a run is presented (bespoke per product). The bill
arrives later — you cannot test a conversation, you cannot replay a demo, and you cannot change a
persona without editing TypeScript.

Séance is the skeleton we wanted: personas as data, a pure engine, a reusable room UI.

### What it does

A **room** takes one artifact, three personas and a seed. Each persona takes a turn, scans the
artifact through its own "lenses", and quotes the lines it objects to with a severity. The room
then aggregates every finding into a risk score in `[0, 100]` and a decision: **ship**,
**revise**, or **block**.

Two apps use the same foundation without touching the engine:

- **Code Séance** — the Security Specter (what lets a stranger in), the Perf Poltergeist (wasted
  milliseconds), the Style Wraith (what the next reader inherits). Paste a diff, get a merge
  verdict.
- **Postmortem Séance** — the Timeline Detective (what the record refuses to say), the Blast
  Analyst (who paid), the Process Ghost (the shortcut that made it possible). Paste an incident
  timeline, get a root-cause verdict.

Changing the seed re-voices the room without changing a single finding — which makes for a
particularly good demo: same evidence, different verdict language.

### How we built it

Spec-first, in Kiro:

1. `.kiro/specs/agent-room/requirements.md` — 12 EARS requirements plus six property invariants.
2. `.kiro/specs/agent-room/design.md` — layering, determinism boundary, scoring rationale.
3. `.kiro/specs/agent-room/tasks.md` — 33 tasks, each checked off against a test or an artifact.
4. Three always-on steering files (`product.md`, `tech.md`, `structure.md`) kept the engine pure
   and kept app logic out of the template.
5. Two agent hooks (`test-on-save`, `typecheck-on-save`) ran the suite and `tsc` on every save.

The stack is deliberately boring: TypeScript, React 18, Vite, npm workspaces, Vitest,
fast-check. No backend, no database, no model calls in the demo path.

### Challenges

**Keeping the demo honest was harder than making it impressive.** The obvious build calls an LLM
on every turn, which would have made the public demo dependent on a key and a rate limit, and
made every recording unreproducible. Committing to a deterministic script engine meant the
"intelligence" had to live in the persona definitions and the scoring, not in a prompt — and it
meant the properties could be tested, which is the whole point.

**The scoring bug.** The first formula divided by the number of findings, so adding a `risk`
finding could lower the score. It passed every unit test, because the fixture never produced the
degenerate case. Property P3 ("adding a risk finding never lowers the score") failed on the
second generated input.

### Accomplishments we're proud of

- Two genuinely different products from one template, with zero app-specific engine code.
- 27 tests, including six property-based invariants over generated rooms.
- A demo that is byte-identical on every run — the site cannot drift from the video.
- A public build with no key, no login and no network calls, so judges can test in one click.

### What we learned

Write the invariant before the implementation. The bugs that survived our unit tests were exactly
the ones the spec had described but the code had not.

### What's next

- `Transport` implementations (OpenAI-compatible, Bedrock) behind the same `Finding` type, so a
  room can be replayed offline and run live.
- Shareable rooms via `location.hash` (artifact + seed already fully determine a transcript).
- A persona linter that suggests lenses for a given artifact type.

## Built with

`typescript` `react` `vite` `npm-workspaces` `vitest` `fast-check` `yaml` `github-pages` `kiro`
`kiro-cli` `kiro-steering` `kiro-hooks` `kiro-specs`

## "Try it out" links

- Live demo: ⟪pending⟫
- GitHub repo: ⟪pending⟫
- Video: ⟪pending⟫
