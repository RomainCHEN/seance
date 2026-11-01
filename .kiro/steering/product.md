---
inclusion: always
---

# Product: Séance

## What this is

Séance is an **open-source template for building multi-agent "rooms"**: small web apps where
several named agents take turns reacting to one artifact (a code snippet, an incident
timeline, a pitch) and end with a single verdict.

The template ships with a deterministic, offline **script engine** so a room runs with zero
API keys and produces the same transcript for the same input and seed. A real LLM can be
plugged in later through the same `Transport` interface without touching the UI.

Two reference applications are built from the same template, in two separate folders, to
prove the template is generic:

- `apps/code-seance` — three reviewers dissect a code snippet and return a merge verdict.
- `apps/postmortem-seance` — three investigators dissect an incident timeline and return a
  root-cause verdict.

## Who it is for

- **Agent-app builders** who keep re-implementing "N agents talking to each other" UI and
  want a tested starting point.
- **Teams that need to demo and test agent flows in CI** without spending tokens or dealing
  with flaky model output.

## Why it matters

Multi-agent products are everywhere, but the *presentation layer* of multi-agent runs is
rebuilt from scratch every time, and it is nearly impossible to test deterministically.
Séance separates three concerns that are usually tangled:

1. **Personas** — declarative YAML: who the agents are and how they react.
2. **Engine** — a pure, seeded turn loop that turns an artifact + personas into a transcript.
3. **Room UI** — a reusable React shell that renders any transcript.

Because the engine is pure and seeded, the same input always produces the same transcript,
which makes property-based testing and demo recordings reproducible.

## Vocabulary

- **Room** — one run: a set of personas, one artifact, a transcript, a verdict.
- **Persona** — declarative agent definition (id, name, role, lenses, voice).
- **Artifact** — the thing under review (code, timeline, pitch text).
- **Findings** — per-persona observations produced during their turn.
- **Verdict** — the room's final decision text plus an aggregated risk score.

## Non-goals

- Not a general chat UI, not a model gateway, not a prompt marketplace.
- The demo runs **without** any API key or network call. Live-LLM mode is optional and must
  never be required to reproduce the demo.
- No user accounts, no database: a room is client-side and shareable through the URL hash.

## Rules we must never break

- The repo must keep `/.kiro` at the root and must never ignore it.
- Every persona and every scoring rule must be readable from data files, not hard-coded in
  components.
- Nothing in the product may claim capabilities it does not have; the UI must label the
  script engine as offline and deterministic.
