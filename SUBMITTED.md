# Kiroween 2026 — submission status

**State: IN PROGRESS — not submitted.** Every row is either verified with a link or marked
`PENDING` with the reason. This file becomes the final deliverable once the Devpost form is
submitted.

Last updated: 2026-11-02 00:01 (Asia/Shanghai)

## Project

| Field | Value |
|---|---|
| Name | Séance |
| Category | **Skeleton Crew** |
| Bonus targeted | Startup · Blog · Social Blitz · Best Demo |
| Bonus declined | Student (no enrolment evidence), Ghost of Kiroween Past (2025 participation unconfirmed) |
| License | MIT (`LICENSE`, visible in the repo About panel) |
| `.kiro` at root | ✅ `.kiro/{steering,specs,hooks}`, never gitignored |
| Tests | 45 passing (10 property-based invariants) |
| Kiro surfaces | Kiro Web · Kiro CLI (2 spec audits) · custom agent `room-auditor` · steering · specs · hooks |

## Deliverables

| # | Deliverable | Status | URL / evidence | Time |
|---|---|---|---|---|
| d1 | Devpost registration | ✅ registered ("Thanks for registering!") | <https://devpost.com/RomainCHEN> | 23:05 |
| d2 | Kiro user id | ✅ verified (Web account, see `log/private.md`) | `app.kiro.dev/settings/account` | 21:46 |
| d3 | Credits form submitted | ✅ **submitted** — "您的回复已记录。" | [confirmation](docs/images/credits-submitted.png) | 23:15 |
| d4 | Credits redeemed | **PENDING** — user must complete Didit (ID + face), then the code arrives by email | — | — |
| d5 | `.kiro` artifact | ✅ | [.kiro](.kiro) | 21:5x |
| d6 | GitHub repo URL | ✅ public, MIT detected in About | <https://github.com/RomainCHEN/seance> | 22:28 |
| d7 | Working app URL | ✅ live, no login, zero network calls | <https://romain.is-a.dev/seance/> | 22:29 |
| d8 | YouTube video | ✅ **public**, 1:30 (limit 3:00) | <https://youtu.be/JEslV2u7YSw> | 23:55 |
| d9 | `docs/KIRO_USAGE.md` | ✅ (includes the custom agent and both audits) | [docs/KIRO_USAGE.md](docs/KIRO_USAGE.md) | 22:40 |
| d10 | Blog URL | **PENDING** — platform chosen (dev.to); waiting for the user to log in, then the bot publishes | [docs/BLOG_DRAFT.md](docs/BLOG_DRAFT.md) | — |
| d11 | Social post URL | **PENDING** — account not confirmed (@Zaam1035028 vs @ProfJieDing) | [docs/SOCIAL_DRAFT.md](docs/SOCIAL_DRAFT.md) | — |
| d12 | Devpost submission URL | **PENDING** — only reCAPTCHA on *Start project* blocks it (human click); all field values + the video URL are in the paste pack | [paste pack](docs/DEVPOST-PASTE-PACK.md) | — |
| d13 | Step log | ✅ | [log/steps.md](log/steps.md) | 22:2x |
| d14 | This file | ✅ (live) | `SUBMITTED.md` | — |

## Self-check against the official rules

| Rule | Status |
|---|---|
| Built with Kiro (Web + CLI audits + custom agent) | ✅ `docs/kiro-cli-audit.log`, `docs/kiro-cli-audit-ui.log`, `docs/kiro-cli-room-auditor.log` |
| Kiro usage writeup | ✅ `docs/KIRO_USAGE.md` |
| Public GitHub repo with license visible in About | ✅ MIT detected by GitHub |
| `/.kiro` at repo root, not ignored | ✅ |
| Skeleton Crew: two separate app folders | ✅ `apps/code-seance/`, `apps/postmortem-seance/` |
| Working app URL, no login needed for judges | ✅ <https://romain.is-a.dev/seance/> |
| Video < 3 min, public on YouTube | ✅ 1:30, public (https://youtu.be/JEslV2u7YSw) |
| Blog post mentions Kiroween 2026 | ✅ draft contains the exact required sentence |
| Social post starts with `#KiroweenHackathon26` | ✅ drafts do |

## What is blocking, and on whom

| Blocker | Owner | Unblocks |
|---|---|---|
| Kiro account choice for the credits form (`nov1` Web vs `oct19` CLI) | **user** | d3 |
| Didit identity verification (ID + face) | **user** only — starts when the code email arrives | d4 |
| Record + upload the video | **user** decides; bot can generate one from the page itself | d8 |
| Choose blog platform (dev.to/Hashnode are logged out) + confirm X handle | **user** | d10, d11 |
| Click the reCAPTCHA on *Start project* | **user** | d12 |
