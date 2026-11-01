#!/usr/bin/env node
// Fill the Kiroween submission "Additional info" step.
//
//   node scripts/fill-submission-additional.mjs [--save]
//
// The final "Submit" click is never performed here.
import puppeteer from 'puppeteer-core';
import { readFile } from 'node:fs/promises';

const BROWSER_URL = process.env.SEANCE_CDP ?? 'http://127.0.0.1:9333';
const P = 'participants_submission_requirements_submission_field_values_attributes_';

const KIRO_TEXT = `Built with Kiro Web and Kiro CLI, plus Kiro specs, steering and hooks.

Surfaces: Kiro Web (app.kiro.dev) for the account and user id. Kiro CLI 2.32.0 as an independent auditor — \`kiro-cli chat --no-interactive --model auto --trust-tools=fs_read\` reads .kiro/specs/agent-room/requirements.md and reports PASS/FAIL per requirement with file:line citations.

Custom agent: .kiro/agents/room-auditor.json is a read-only auditor (tools limited to fs_read/grep/glob/thinking) that forbids inventing findings. It found two "dead lenses" — persona lenses whose keywords appeared nowhere in that room's sample artifact, so a reviewer silently had one fewer lens than the UI implied. Fixing the samples made them live; a second run returned PASS.

Hooks: test-on-save and typecheck-on-save, both PostFileSave on .ts/.tsx.

Spec-driven development: requirements.md holds 12 EARS statements plus six property invariants; design.md records the determinism boundary and the scoring formula; tasks.md carries 33 tasks. Property P3 (from the spec) caught a scoring formula that divided by the finding count, so adding a risk finding could lower the score — every unit test had passed.

Steering: three always-on files. The highest-leverage line was "no Math.random / Date.now / UUID inside seance-core", which kept the engine pure across every file the agent touched.

MCP and powers: not used — there is no external system in the demo path.

PBT: ten property invariants run over generated rooms (determinism, score bounds, monotonicity, verdict totality, ordering, share-link round-trip).`;

const TESTING = `No login or credentials needed. Open https://romain.is-a.dev/seance/, pick a room, and press "Re-run with a new seed" to regenerate the transcript. Everything runs client-side — no network calls, no API key, no upload. The "Copy room link" button puts the full room state in the URL fragment so a transcript can be reproduced exactly.`;

const PREEXISTING = `None beyond standard frameworks and libraries (React, Vite, Vitest, fast-check, the yaml parser, GitHub Pages for hosting). All personas, engine, UI and docs were written during the submission period.`;

const browser = await puppeteer.connect({ browserURL: BROWSER_URL, defaultViewport: null });
const pages = await browser.pages();
const wanted = await readFile('.cdp-target', 'utf8').catch(() => null);
const id = wanted ? wanted.trim() : null;
const page =
  (id && pages.find((p) => p.target()._targetId === id)) ?? pages[pages.length - 1];

const log = await page.evaluate(
  (payload) => {
    const P = payload.P;
    const out = [];
    const $ = window.$;

    const setText = (idx, value) => {
      const el = document.getElementById(P + idx + '_value');
      if (!el) return out.push(`missing text ${idx}`);
      const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      out.push(`text ${idx} = ${value.slice(0, 30)}…`);
    };

    const setSelect = (idx, value) => {
      const el = document.getElementById(P + idx + '_value');
      if (!el) return out.push(`missing select ${idx}`);
      el.value = value;
      if ($) $(el).trigger('change');
      el.dispatchEvent(new Event('change', { bubbles: true }));
      out.push(`select ${idx} = ${value} (now ${el.value})`);
    };

    const check = (idx) => {
      const el = document.getElementById(P + idx + '_value');
      if (!el) return out.push(`missing checkbox ${idx}`);
      if (!el.checked) el.click();
      out.push(`checked ${idx} = ${el.checked}`);
    };

    setSelect(0, 'United States');
    check(1);
    check(2);
    setSelect(3, 'Skeleton Crew');
    setText(4, payload.repo);
    setText(5, payload.demo);
    setText(6, payload.testing);
    setText(7, payload.kiro);
    setText(8, payload.preexisting);
    setSelect(15, 'No');
    setSelect(16, 'Individual');
    setSelect(18, 'No');
    setSelect(19, 'A lot');
    setSelect(20, 'Very likely');

    return out;
  },
  {
    P,
    repo: 'https://github.com/RomainCHEN/seance',
    demo: 'https://romain.is-a.dev/seance/',
    testing: TESTING,
    kiro: KIRO_TEXT,
    preexisting: PREEXISTING,
  },
);

console.log(log.join('\n'));

if (process.argv.includes('--save')) {
  const saved = await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button, input[type=submit]')].find(
      (b) => /^(save|保存)/i.test((b.innerText || b.value || '').trim()) && b.offsetParent !== null,
    );
    if (!btn) return false;
    btn.click();
    return true;
  });
  console.log('save clicked:', saved);
  await new Promise((r) => setTimeout(r, 5000));
  console.log('url:', page.url());
}

await page.screenshot({ path: '/tmp/dp-additional.png' });
console.log('screenshot /tmp/dp-additional.png');
await browser.disconnect();
