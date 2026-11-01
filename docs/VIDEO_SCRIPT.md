# Video script — Séance (Kiroween 2026)

Target length **2:45** (hard limit: 3:00). No music. Screen recording + voice-over, or on-screen
captions if recorded silent. Every shot is real UI — nothing is mocked.

## Before recording

```bash
npm run build
python3 -m http.server 5199 --directory dist
```

Open `http://127.0.0.1:5199/` at 1440×900, browser zoom 100%, hide the bookmarks bar, and close
every other tab. Record at 1080p.

Set the room seed to **7** so the transcript matches these notes (Code Séance: 84 / Blocked;
Postmortem Séance: 81 / Blocked).

---

## 0:00 – 0:15 · The problem

**Shot:** the landing page, cursor still.

**Voice-over:**
> "Every team building a multi-agent product rebuilds the same three things: the personas, the
> run, and the way a run is presented. The bill comes later — you can't test a conversation, you
> can't replay a demo, and you can't change a persona without editing TypeScript."

## 0:15 – 0:40 · What Séance is

**Shot:** scroll the landing page slowly past the three cards.

**Voice-over:**
> "Séance is a skeleton template for multi-agent rooms. Personas in YAML, a pure seeded engine,
> one reusable room UI. Everything you see runs on the page — no API key, no network call, no
> tokens."

**On screen:** point at the pill "Open source · MIT · deterministic demo mode".

## 0:40 – 1:35 · Code Séance, end to end

**Shot 1 (0:40):** open **Code Séance**.

**Voice-over:**
> "This is one of the two apps built from the template. Paste a diff, and three reviewers read it
> in turn."

**Shot 2 (0:48):** click into the textarea, press `Cmd+A`, `Cmd+V` a broken snippet. Show the
line count change.

**Shot 3 (0:55):** scroll to the Security Specter card.

**Voice-over:**
> "The Security Specter is looking for what lets a stranger in. It found four: an API key in
> source, an `innerHTML` write, a `Bearer` token in a header object, and a request body flowing
> straight into a charge."

**Shot 4 (1:05):** scroll to the Perf Poltergeist and Style Wraith cards, slower.

**Voice-over:**
> "The Poltergeist counts wasted milliseconds — nested loops, a blocking `await` inside a loop.
> The Wraith judges what the next reader inherits: a swallowed `catch`, a `console.log`, and a
> `TODO` that outlived its author."

**Shot 5 (1:18):** scroll to the verdict panel.

**Voice-over:**
> "Then the room does the thing a chat log cannot: it aggregates. Fourteen findings become one
> score — 84 out of 100 — and one decision: blocked."

**Shot 6 (1:28):** click **Re-run with a new seed**.

**Voice-over:**
> "Change the seed and the wording changes — the findings don't. Same evidence, different verdict
> language. That's the deterministic engine, and it's why the demo you're watching can be
> reproduced exactly."

## 1:35 – 1:55 · The second app proves the template

**Shot:** open **Postmortem Séance**, keep the sample timeline, scroll straight to the verdict.

**Voice-over:**
> "Second app, same foundation, zero engine changes — a detective, a blast analyst and a process
> ghost read an incident timeline. Different domain, different personas, same three layers. 81
> out of 100: blocked."

**Shot:** open the **template** app, show the single persona.

**Voice-over:**
> "And this is the skeleton itself: one persona, one page, no app code. Copy the folder, swap the
> YAML, and you have a new room."

## 1:55 – 2:30 · How Kiro built it

**Shot:** terminal running `npm test` — let the 27 tests and the property-based suite print.

**Voice-over:**
> "The build was spec-first in Kiro. Requirements in EARS, then design, then a task list — twelve
> requirements and six property invariants written before the code."

**Shot:** open `.kiro/specs/agent-room/requirements.md`, scroll to the invariants.

**Voice-over:**
> "That paid for itself immediately. The first scoring formula divided by the number of findings,
> so adding a risk could *lower* the score. Every unit test passed. Property three — 'adding a
> risk finding never lowers the score' — failed on the second generated input."

**Shot:** open `.kiro/steering/tech.md`, highlight the determinism paragraph.

**Voice-over:**
> "Three always-on steering files kept the engine pure and kept app logic out of the template.
> The most valuable line in the whole repo is one rule in tech dot md: no `Math.random`, no
> `Date.now`, no UUIDs inside the core. Every reproducible demo follows from it."

**Shot:** open `.kiro/hooks/test-on-save.json`.

**Voice-over:**
> "Two hooks run the suite and the typechecker on every save — which matters when TypeScript is
> in strict mode with `noUncheckedIndexedAccess`."

## 2:30 – 2:45 · Close

**Shot:** back to the verdict panel, then cut to the landing page.

**Voice-over:**
> "Séance. A skeleton you can copy, two apps that prove it generalises, and a demo that runs the
> same way for every judge. MIT licensed, on GitHub, no login required."

**End card (static, 3s):** `github.com/JieGroup/seance` · MIT · Kiroween 2026, Skeleton Crew.

---

## Production notes

- Record the terminal at the same window size; do not scale text below 14px.
- Do not include third-party logos, music, or stock footage — the rules forbid it.
- Cut anything that shows a personal email or account id. Blur the tab strip if needed.
- Upload as **Public**, unlisted is not enough for judging.
- Title: `Séance — deterministic multi-agent rooms (Kiroween 2026)`
- Description: one paragraph + the repo link + `#KiroweenHackathon26` in the first line.
