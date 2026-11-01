# Social drafts — `#KiroweenHackathon26`

Rules for the Social Blitz bonus, verbatim from the official rules:

- the post **must start with** `#KiroweenHackathon26` (before any other content);
- it must share your favourite thing about Kiro **and** how it changed the way you approached
  development;
- it must be posted **during the submission period**;
- the URL goes into the Devpost submission form.

Platforms that count: X, LinkedIn, Instagram, TikTok, etc. Pick the account that matches the rest
of the submission details — the rules say mismatched social profiles can be disqualified.

---

## Option A — X, English (fits 280 chars)

```
#KiroweenHackathon26 My favourite thing about Kiro is steering: one line in .kiro/steering/tech.md — "no Math.random inside the core" — and every file the agent touched stayed deterministic. It changed me from prompting for a fix to writing the constraint the fix has to satisfy. Built Séance, a deterministic multi-agent room template + two apps. github.com/JieGroup/seance
```

## Option B — X, shorter, punchier

```
#KiroweenHackathon26 Kiro steering turned me from a prompter into an author of constraints. I wrote "no Math.random() inside the core" once, and 27 tests incl. a property suite kept every agent-written file honest. Séance: a deterministic multi-agent room template + 2 apps → github.com/JieGroup/seance
```

## Option C — LinkedIn (longer, professional)

```
#KiroweenHackathon26 What I like most about Kiro is that it makes constraints first-class.

I added three steering files to the repo, all always-on. The most useful line was one sentence in tech.md: no Math.random(), no Date.now(), no UUIDs inside the engine core. That single rule applied to every file the agent touched — not just the one where determinism happened to come up.

It changed how I work: instead of prompting for a fix and reviewing the result, I now write the constraint the fix has to satisfy, and let the spec and the property tests enforce it. The payoff showed up immediately — my first scoring formula could lower the risk score by adding a risk, and a property test caught it on the second generated input. Every unit test had passed.

The project is Séance: a skeleton template for multi-agent rooms, plus two apps built from it without touching the engine (a code review room and an incident postmortem room). Personas in YAML, a pure seeded engine, one room UI. The demo runs with no API key and no network calls, so a judge sees exactly what I saw.

Code: github.com/JieGroup/seance
```

## Option D — Chinese (X / 微信朋友圈 / 即刻)

```
#KiroweenHackathon26 最喜欢 Kiro 的一点是 steering：在 .kiro/steering/tech.md 写一句「核心引擎里禁止 Math.random」，之后 agent 写的每个文件都自动遵守。它把我从「提示词许愿」改成了「先写约束，再让 spec 和属性测试去守」。这次做了 Séance——一个多 agent 评审房间的骨架模板 + 两个应用，零 API key、零网络请求，评委看到的就是我看到的。github.com/JieGroup/seance
```

---

## Posting checklist

- [ ] First character of the post is `#`, and the first token is exactly `#KiroweenHackathon26`
      (**case-sensitive** in appearance — keep the capital K and the 26).
- [ ] Mentions the favourite Kiro feature **and** how it changed the approach.
- [ ] Posted during the submission period, on an account that matches the submission.
- [ ] Post is public (not followers-only).
- [ ] If it has an image, use a screenshot of the verdict panel; no third-party logos.
- [ ] URL copied into `SUBMITTED.md` **and** the Devpost bonus field.
