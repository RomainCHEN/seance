# Cleanup — everything this session deployed or generated

Recorded 2026-11-01 22:4x (Asia/Shanghai) at the user's request:
> "申请完 kiroween 的积分之后，等积分到账了你记得把今天临时部署的东西都清理干净"

Credit codes arrive **within 48 business hours** of the request form being approved (official
rules), so this cleanup runs **after the code lands in the inbox**, not before.

## What exists right now

| # | What | Where | Kind | Needed for the submission? |
|---|---|---|---|---|
| 1 | Public repo `seance` | https://github.com/RomainCHEN/seance | permanent | **yes** — rules require a public repo with `/.kiro` |
| 2 | Pages site | https://romain.is-a.dev/seance/ | deployed | **yes** — rules require a working app URL |
| 3 | `gh-pages` branch | same repo | deploy artifact | yes, it is the deploy source |
| 4 | `.pages-build/` worktree | workspace | local + gitignored | no |
| 5 | Local preview server | `http://127.0.0.1:5199` (`python3 -m http.server --directory dist`) | temp process | no |
| 6 | `.npm-cache/` | workspace | local, gitignored | no |
| 7 | `log/*.png`, `log/screen-*.png` | workspace | local, gitignored | no |
| 8 | `.headless-profile/` | workspace | removed already | — |
| 9 | Kiro CLI session | `~/.aws/sso` + keychain | account state | only if you want the CLI logged in later |

Items **1–3 are the submission itself**. Deleting them removes the project from the hackathon.
Item 4–8 are scratch space and safe to drop at any time.

## Tear-down commands

### Scratch only (safe, keeps the submission intact)

```bash
cd ~/sideProjects/kiroween
npm run deploy -- --help >/dev/null 2>&1 || true   # no-op, just shows the deploy script exists
git worktree remove .pages-build --force            # item 4
rm -rf .npm-cache                                   # item 6
rm -f log/*.png log/screen-*.png                    # item 7
lsof -ti tcp:5199 | xargs -r kill                   # item 5
```

### Deployed site only (keeps the repo, breaks the demo URL)

```bash
gh api -X DELETE repos/RomainCHEN/seance/pages      # stops Pages (item 2)
git push origin --delete gh-pages                   # drops the deploy branch (item 3)
```

### Everything (abandons the submission)

```bash
gh repo delete RomainCHEN/seance --yes              # items 1–3
cd ~/sideProjects/kiroween && git remote remove origin
```

## Before any of the above: what must still be captured

- `SUBMITTED.md` must record the repo URL, demo URL, video URL, blog URL, social URL **before**
  anything is deleted — otherwise the Devpost form has nothing to point at.
- The Devpost submission itself is a copy of those URLs; deleting the repo after the deadline does
  not un-submit, but it does make the entry untestable for judges and is grounds for removal.

## Decision (user, 2026-11-01 22:4x)

> "今天先清理临时垃圾，等积分到账了，我们在关掉线上部署的东西清理彻底。"

Two phases, in this order:

| Phase | When | Scope | Status |
|---|---|---|---|
| **1. Scratch now** | immediately | items 4–8 | ✅ done 22:4x — `.npm-cache` (220 MB), `.pages-build`, `log/*.png` (19 MB), preview server on :5199 |
| **2. Tear down the public deployment** | after the credit code lands | items 2–3 (Pages + `gh-pages`), then decide on item 1 (the repo) | ⏳ pending credits |

Phase 2 order matters: **capture every URL into `SUBMITTED.md` before deleting anything**, because
the Devpost form and the blog/social posts point at them.

After phase 2 the submission has no working app URL, so phase 2 should either (a) happen after the
Devpost submission is final, or (b) be followed by a replacement deploy.

### Phase 1 result

- `lsof -ti tcp:5199 | xargs kill` → local preview stopped (`curl` now returns 000)
- `git worktree remove .pages-build --force` → worktree gone, `gh-pages` branch untouched
- `rm -rf .npm-cache` → 220 MB reclaimed
- `rm -f log/*.png` → 19 MB → 464 KB
- verified the live site still serves: `/seance/` and `/seance/apps/code-seance/` both **200**


## Phase 3 — what to delete once the credit code arrives (user decision, 2026-11-02)

> "A。做完然后积分到手之后清库。"

After the credits land, tear down everything this session published:

| Target | Command |
|---|---|
| Séance Pages site | `gh api -X DELETE repos/RomainCHEN/seance/pages` then `git push origin --delete gh-pages` |
| Séance repo | `gh repo delete RomainCHEN/seance --yes` (capture every URL first — the Devpost entry points at it) |
| Rulewright repo (built as an alternative, not submitted) | `gh repo delete RomainCHEN/rulewright --yes` |
| Local scratch | `.npm-cache/`, `.pages-build/`, `.headless2/`, `.brave-auto/`, `frames/`, `video/*.mp4` |

**Order matters**: the Devpost submission references the repo and demo URL, so decide whether to
keep the entry (and its links) or delete it before removing the repo. If the repo goes, the entry
stays but is untestable for judges.
