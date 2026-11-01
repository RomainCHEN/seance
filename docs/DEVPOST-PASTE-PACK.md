# Devpost submission — copy/paste pack

The project-creation and submission screens are protected by an **invisible reCAPTCHA**
(`data-sitekey` on the *Start project* button, `g-recaptcha-response` in the new-project form).
That is a bot check by design, so the last mile is a human click. Everything else is prepared here.

Open: <https://devpost.com/submit-to/31667-kiroween-2026/manage/submissions> → **Start project**
(or <https://devpost.com/software/new>).

---

## 1. Project basics

**Project name**

```
Séance
```

**Tagline** (≤ 120 characters)

```
A skeleton template for deterministic multi-agent rooms — with two apps built from it.
```

**Thumbnail** — upload `docs/images/thumbnail-3x2.png` (3:2, 1500×1000)

**"Built with"** (paste as separate tags)

```
typescript, react, vite, vitest, fast-check, yaml, github-pages, kiro, kiro-cli, kiro-steering, kiro-hooks, kiro-specs
```

## 2. "Try it out" links

| Label | URL |
|---|---|
| Website | `https://romain.is-a.dev/seance/` |
| Source code | `https://github.com/RomainCHEN/seance` |

## 3. Story / description

**Inspiration**

```
Every team building a multi-agent product rebuilds the same three things and tangles them
together: who the agents are (prompt strings inside components), how a run unfolds (inside an
effect, next to network calls), and how a run is presented (bespoke per product). The bill
arrives later — you cannot test a conversation, you cannot replay a demo, and you cannot change
a persona without editing TypeScript. Séance is the skeleton we wanted.
```

**What it does**

```
A room takes one artifact, three personas and a seed. Each persona takes a turn, scans the
artifact through its own lenses, and quotes the lines it objects to with a severity. The room
aggregates every finding into a risk score in [0,100] and a decision: ship, revise or block.

Two apps use the same foundation without touching the engine. Code Séance: the Security Specter
(what lets a stranger in), the Perf Poltergeist (wasted milliseconds), the Style Wraith (what the
next reader inherits) read a diff. Postmortem Séance: the Timeline Detective, the Blast Analyst
and the Process Ghost read an incident timeline.

Changing the seed re-voices the room without changing a single finding — same evidence, different
verdict language.
```

**How we built it**

```
Spec-first, in Kiro. .kiro/specs/agent-room/requirements.md holds 12 EARS requirements plus six
property invariants; design.md records the determinism boundary and the scoring rationale;
tasks.md carries 33 tasks checked off against tests. Three always-on steering files kept the
engine pure and kept app logic out of the template, and two agent hooks ran the suite and tsc on
every save. A custom Kiro CLI agent (room-auditor) audited the rooms against the spec.

Stack: TypeScript, React 18, Vite, npm workspaces, Vitest, fast-check. No backend, no database,
no model calls in the demo path.
```

**Challenges**

```
Keeping the demo honest was harder than making it impressive. The obvious build calls an LLM on
every turn, which would make the public demo depend on a key and a rate limit and make every
recording unreproducible. Committing to a deterministic script engine put the "intelligence" in
the persona definitions and the scoring instead.

The scoring bug: the first formula divided by the number of findings, so adding a risk finding
could lower the score. Every unit test passed. Property P3 ("adding a risk finding never lowers
the score") failed on the second generated input.
```

**Accomplishments**

```
Two genuinely different products from one template, with zero app-specific engine code.
45 tests including ten property-based invariants over generated rooms.
A demo that is byte-identical on every run — the site cannot drift from the video.
A public build with no key, no login and no network calls, so judges can test in one click.
```

**What we learned**

```
Write the invariant before the implementation. The bugs that survived the unit tests were exactly
the ones the spec had described and the code had not.
```

**What's next**

```
Transport implementations (OpenAI-compatible, Bedrock) behind the same Finding type, so a room can
be replayed offline and run live. Shareable rooms via location.hash. A persona linter.
```

## 4. Hackathon submission form fields

| Field | Value |
|---|---|
| Category | **Skeleton Crew** |
| GitHub repository | `https://github.com/RomainCHEN/seance` |
| "Try it out" URL | `https://romain.is-a.dev/seance/` |
| Video | ⟪YouTube URL after upload⟫ |
| Login credentials for judges | none — public, no network calls |
| Best Startup Project | ✅ founder — LinkedIn `https://www.linkedin.com/in/profjieding`, website `https://morphmind.ai` |
| Bonus Blog | ⟪URL after publishing⟫ |
| Social Blitz | ⟪URL after posting⟫ |
| Best Student Project | ✗ not claimed |
| Ghost of Kiroween Past | ✗ not claimed |
| Kiro Crew App | ✗ not claimed |

## 5. The one thing the bot cannot do

The *Start project* button is `type=submit` inside a reCAPTCHA form with `disabled=""` until the
captcha passes. A human has to click it. Everything above is pre-written so the human session is
short.
