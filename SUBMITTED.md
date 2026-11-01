# Kiroween 2026 — submission status

**State: IN PROGRESS — not submitted.** Every row is either verified with a link or marked
`PENDING` with the reason. This file becomes the final deliverable once the Devpost form is
submitted.

Last updated: 2026-11-01 22:27 (Asia/Shanghai)

## Project

| Field | Value |
|---|---|
| Name | Séance |
| Category | **Skeleton Crew** |
| Bonus targeted | Startup · Blog · Social Blitz · Best Demo |
| Bonus declined | Student (no enrolment evidence), Ghost of Kiroween Past (2025 participation unconfirmed) |
| License | MIT (`LICENSE`, visible in the repo About panel) |
| `.kiro` at root | ✅ `.kiro/{steering,specs,hooks}`, never gitignored |
| Tests | 42 passing (10 property-based invariants) |

## Deliverables

| # | Deliverable | Status | URL / evidence | Time |
|---|---|---|---|---|
| d1 | Devpost registration | **PENDING** — blocked on Devpost login (H1) | registration page open in Brave | — |
| d2 | Kiro user id | ✅ verified (Web account, see `log/private.md`) | `app.kiro.dev/settings/account` | 21:46 |
| d3 | Credits form submitted | **PENDING** — needs Devpost registration first; needs user CONFIRM + Didit consent | form fields captured | — |
| d4 | Credits redeemed | **PENDING** — code arrives by email after Didit | — | — |
| d5 | `.kiro` artifact | ✅ | [.kiro](.kiro) | 21:5x |
| d6 | GitHub repo URL | **PENDING** — owner decision (JieGroup vs RomainCHEN) + CONFIRM to publish | local repo: 6 commits | — |
| d7 | Working app URL | **PENDING** — GitHub Pages after d6 | local build verified at `:5199` | 22:2x |
| d8 | YouTube video | **PENDING** — needs recording + user upload | script: [docs/VIDEO_SCRIPT.md](docs/VIDEO_SCRIPT.md) | — |
| d9 | `docs/KIRO_USAGE.md` | ✅ | [docs/KIRO_USAGE.md](docs/KIRO_USAGE.md) | 22:0x |
| d10 | Blog URL | **PENDING** — draft ready, platform not chosen | [docs/BLOG_DRAFT.md](docs/BLOG_DRAFT.md) | — |
| d11 | Social post URL | **PENDING** — account not confirmed (@Zaam1035028 vs @ProfJieDing) | [docs/SOCIAL_DRAFT.md](docs/SOCIAL_DRAFT.md) | — |
| d12 | Devpost submission URL | **PENDING** — needs d1, d6, d7, d8 | — | — |
| d13 | Step log | ✅ | [log/steps.md](log/steps.md) | 22:2x |
| d14 | This file | ✅ (live) | `SUBMITTED.md` | — |

## Self-check against the official rules

| Rule | Status |
|---|---|
| Built with Kiro (Web + CLI audit recorded) | ✅ `docs/kiro-cli-audit.log`, `docs/kiro-cli-audit-ui.log` |
| Kiro usage writeup | ✅ `docs/KIRO_USAGE.md` |
| Public GitHub repo with license visible in About | ⏳ after d6 |
| `/.kiro` at repo root, not ignored | ✅ |
| Skeleton Crew: two separate app folders | ✅ `apps/code-seance/`, `apps/postmortem-seance/` |
| Working app URL, no login needed for judges | ⏳ after d7 (build is static, zero network calls) |
| Video < 3 min, public on YouTube | ⏳ after d8 |
| Blog post mentions Kiroween 2026 | ✅ draft contains the exact required sentence |
| Social post starts with `#KiroweenHackathon26` | ✅ drafts do |

## What is blocking, and on whom

| Blocker | Owner | Unblocks |
|---|---|---|
| Devpost account login | **user** (H1) | d1, d3, d12 |
| Confirm which GitHub owner (`JieGroup` or `RomainCHEN`) and allow publishing | **user** (CONFIRM) | d6, d7 |
| Kiro account choice for the credits form (`nov1` Web vs `oct19` CLI) | **user** | d3 |
| Didit identity check consent | **user** only | d4 |
| Record + upload the video | **user** (or bot if screen recording is allowed) | d8 |
| Choose blog platform + X handle | **user** | d10, d11 |
