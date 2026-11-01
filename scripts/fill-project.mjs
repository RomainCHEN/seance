#!/usr/bin/env node
// Fill the Devpost project editor (devpost.com/software/<slug>) from the paste pack.
//
//   node scripts/fill-project.mjs [--save]
//
// Leaves the project unsaved unless --save is passed.
import puppeteer from 'puppeteer-core';

const BROWSER_URL = process.env.SEANCE_CDP ?? 'http://127.0.0.1:9333';
const STATE = '.cdp-target';

const TAGLINE = 'A skeleton template for deterministic multi-agent rooms — with two apps built from it.';
const TAG_LIST = 'typescript, react, vite, vitest, fast-check, yaml, github-pages, kiro';
const DEMO_URL = 'https://romain.is-a.dev/seance/';
const REPO_URL = 'https://github.com/RomainCHEN/seance';
const VIDEO_URL = 'https://youtu.be/JEslV2u7YSw';

const DESCRIPTION = `## Inspiration

Every team building a multi-agent product rebuilds the same three things and tangles them together: who the agents are (prompt strings inside components), how a run unfolds (inside an effect, next to network calls), and how a run is presented (bespoke per product). The bill arrives later — you cannot test a conversation, you cannot replay a demo, and you cannot change a persona without editing TypeScript.

Séance is the skeleton we wanted: personas as data, a pure engine, a reusable room UI.

## What it does

A room takes one artifact, three personas and a seed. Each persona takes a turn, scans the artifact through its own lenses, and quotes the lines it objects to with a severity. The room aggregates every finding into a risk score in [0,100] and a decision: ship, revise or block.

Two apps use the same foundation without touching the engine:

- **Code Séance** — the Security Specter (what lets a stranger in), the Perf Poltergeist (wasted milliseconds) and the Style Wraith (what the next reader inherits) read a diff.
- **Postmortem Séance** — the Timeline Detective, the Blast Analyst and the Process Ghost read an incident timeline.

Changing the seed re-voices the room without changing a single finding — same evidence, different verdict language.

## How we built it

Spec-first, in Kiro. \`.kiro/specs/agent-room/requirements.md\` holds 12 EARS requirements plus six property invariants; \`design.md\` records the determinism boundary and the scoring rationale; \`tasks.md\` carries 33 tasks. Three always-on steering files kept the engine pure and kept app logic out of the template, and two agent hooks ran the suite and \`tsc\` on every save. A custom Kiro CLI agent (\`room-auditor\`) audited the rooms against the spec and found two "dead lenses" — persona lenses whose keywords appeared nowhere in the sample artifact.

Stack: TypeScript, React 18, Vite, npm workspaces, Vitest, fast-check. No backend, no database, no model calls in the demo path.

## Challenges

Keeping the demo honest was harder than making it impressive. The obvious build calls an LLM on every turn, which would make the public demo depend on a key and a rate limit and make every recording unreproducible. Committing to a deterministic script engine put the "intelligence" in the persona definitions and the scoring instead.

The scoring bug: the first formula divided by the number of findings, so adding a risk finding could lower the score. Every unit test passed. Property P3 ("adding a risk finding never lowers the score") failed on the second generated input.

## Accomplishments

- Two genuinely different products from one template, with zero app-specific engine code.
- 45 tests including ten property-based invariants over generated rooms.
- A demo that is byte-identical on every run — the site cannot drift from the video.
- A public build with no key, no login and no network calls, so judges can test in one click.

## What we learned

Write the invariant before the implementation. The bugs that survived the unit tests were exactly the ones the spec had described and the code had not.

## What's next

\`Transport\` implementations (OpenAI-compatible, Bedrock) behind the same \`Finding\` type, shareable rooms via \`location.hash\`, and a persona linter.`;

const browser = await puppeteer.connect({ browserURL: BROWSER_URL, defaultViewport: null });
const pages = await browser.pages();
const wanted = (await import('node:fs/promises')).readFile(STATE, 'utf8').catch(() => null);
const id = wanted ? (await wanted).trim() : null;
const page =
  (id && pages.find((p) => p.target()._targetId === id)) ??
  pages[pages.length - 1];

const result = await page.evaluate(
  ({ tagline, tags, description, demo, repo, video }) => {
    const log = [];
    const setNative = (el, value) => {
      const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };

    const name = document.getElementById('software_name');
    if (name) log.push(`name=${name.value}`);

    const taglineEl = document.getElementById('software_tagline');
    if (taglineEl) {
      setNative(taglineEl, tagline);
      log.push('tagline set');
    }

    const tagList = document.getElementById('software_tag_list');
    if (tagList) {
      setNative(tagList, tags);
      if (window.$) window.$(tagList).trigger('change');
      log.push('tags set');
    }

    const desc = document.getElementById('software_description');
    if (desc) {
      setNative(desc, description);
      log.push(`description ${description.length} chars`);
    }

    const urls = [...document.querySelectorAll('input[name^="software[urls_attributes]"]')];
    if (urls[0]) {
      setNative(urls[0], demo);
      log.push('url[0]=demo');
    }
    if (urls[1]) {
      setNative(urls[1], repo);
      log.push('url[1]=repo');
    } else {
      log.push('only one url field present');
    }

    const videoEl = document.getElementById('software_video_url');
    if (videoEl) {
      setNative(videoEl, video);
      log.push('video url set');
    }

    return log;
  },
  { tagline: TAGLINE, tags: TAG_LIST, description: DESCRIPTION, demo: DEMO_URL, repo: REPO_URL, video: VIDEO_URL },
);

console.log(JSON.stringify(result, null, 2));

// Thumbnail upload
const thumb = await page.$('#software-thumbnail-file-input');
if (thumb) {
  await thumb.uploadFile(new URL('../docs/images/thumbnail-3x2.png', import.meta.url).pathname);
  console.log('thumbnail uploaded');
  await new Promise((r) => setTimeout(r, 4000));
}

await page.screenshot({ path: '/tmp/dp-project.png' });
console.log('screenshot /tmp/dp-project.png');

if (process.argv.includes('--save')) {
  await page.click('#software-save');
  await new Promise((r) => setTimeout(r, 6000));
  console.log(JSON.stringify({ after: page.url() }));
}

await browser.disconnect();
