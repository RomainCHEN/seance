# Credits request form — prepared answers

Form: <https://forms.gle/ykuadfNyNdWdbJfH9> → `docs.google.com/forms/d/e/1FAIpQLSftsMe…/viewform`
Deadline: **2026-12-01 12:00 PT**. Codes arrive within 48 business hours, redeem by 12-04.

Every field is required. Fields are filled from this file once Devpost registration exists,
because the form asks for the Devpost profile URL and Devpost email.

| # | Field (exact label on the page) | Value to enter | Source / status |
|---|---|---|---|
| 1 | `First Name` | ⟪confirm⟫ | GitHub shows “Jay JieGroup” — needs the legal first name |
| 2 | `Last Name` | ⟪confirm⟫ | as above |
| 3 | `Devpost Email` | ⟪from the Devpost account that registers⟫ | must match the registered account |
| 4 | `Devpost Profile URL` | ⟪after registration⟫ | `https://devpost.com/<handle>` |
| 5 | `Country of Residence` | ⟪confirm⟫ — likely `United States` | GitHub profile says Cambridge, MA; the rules exclude a list of countries, US is fine |
| 6 | `Do you have a Kiro User ID or an AWS User ID?` | **Only Kiro ID** | account decision: `nov1@z-chen.dev` |
| 7 | `Provide your Kiro user ID or AWS account ID …` | `d-9067642ac7.****` (full value in `log/private.md`) | copied from `app.kiro.dev/settings/account` |
| 8 | `Tell us which CATEGORY and a little about what you're planning to build.` | see below | must name the category or the request is declined |
| 9 | Didit identity-verification consent | **user decides** | reads the consent text below verbatim |

## Field 8 — exact text to paste

```
Skeleton Crew — Séance is a deterministic multi-agent "room" template: personas live in YAML,
a pure seeded engine turns an artifact into a transcript, and one reusable React shell renders
it. Two apps are built from the same foundation without touching the engine (Code Séance reviews
a diff with three reviewers; Postmortem Séance reads an incident timeline with three
investigators). The demo runs offline with no API key, so judges see exactly the same transcript
every time. Built with Kiro specs, steering, hooks, a custom agent and the Kiro CLI.
```

## Field 9 — the consent text, verbatim from the form

> I agree to completing an identity verification check if my request meets all other eligibility
> requirements. I will receive instructions by email. Identity verification requires photos of my
> government-issued ID and of my face, and is performed by Didit on Devpost's behalf to prevent
> fraud. My information will be handled according to the Devpost Privacy Policy and the Didit
> Privacy Notice. I understand that I am only eligible to receive a credit code if my identity
> verification is approved, and that submitting this form does not guarantee a credit code.

**This checkbox is the user's decision, not the bot's.** Checking it starts a process that
requires a photo of a government ID and a face. The bot explains it and stops.

## Blocking sequence

1. **Devpost registration** (user, H1). Cloudflare is currently refusing the automated browser
   (`Just a moment…` loop), so this has to be done by hand at
   <https://kiroween.devpost.com/> → *Join hackathon* → *Sign up with GitHub / Google*.
2. Bot reads the profile URL and the email from the logged-in Devpost page.
3. Bot fills fields 1–8, screenshots the form, waits for **CONFIRM**.
4. User decides on field 9.
5. Bot clicks 提交, screenshots the confirmation.
6. User completes Didit when the email arrives; bot watches for the code, then redeems it on
   <https://app.kiro.dev> **while signed in as nov1**.
