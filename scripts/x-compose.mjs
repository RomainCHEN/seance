#!/usr/bin/env node
// Type the Kiroween social post into the X composer WITHOUT posting.
//
//   node scripts/x-compose.mjs [--post]
//
// Without --post it only fills the composer, so a human can review and publish.
import puppeteer from 'puppeteer-core';
import { readFile } from 'node:fs/promises';

const BROWSER_URL = process.env.SEANCE_CDP ?? 'http://127.0.0.1:9333';
const POST_TEXT =
  '#KiroweenHackathon26 Kiro steering turned prompting for a fix into writing the constraint a fix must satisfy: one line — no Math.random in the engine core — kept every agent-written file deterministic. Séance: multi-agent room template + 2 apps romain.is-a.dev/seance';

const browser = await puppeteer.connect({ browserURL: BROWSER_URL, defaultViewport: null });
const pages = await browser.pages();
const wanted = await readFile('.cdp-target', 'utf8').catch(() => null);
const id = wanted ? wanted.trim() : null;
const page = (id && pages.find((p) => p.target()._targetId === id)) ?? pages[pages.length - 1];

await page.goto('https://x.com/compose/post', { waitUntil: 'domcontentloaded', timeout: 60000 });
await new Promise((r) => setTimeout(r, 5000));

const editor = await page.$('div[data-testid="tweetTextarea_0"], div[contenteditable="true"][role="textbox"]');
if (!editor) {
  console.error('composer editor not found');
  process.exit(1);
}
await editor.click();
await new Promise((r) => setTimeout(r, 500));
await page.keyboard.type(POST_TEXT, { delay: 12 });
await new Promise((r) => setTimeout(r, 1500));

const typed = await page.evaluate(() => {
  const el = document.querySelector('div[data-testid="tweetTextarea_0"]');
  return el ? el.innerText : null;
});
console.log('typed chars:', typed ? typed.length : 0);
console.log(typed);

await page.screenshot({ path: '/tmp/x-composer.png' });
console.log('screenshot /tmp/x-composer.png');

if (process.argv.includes('--post')) {
  const clicked = await page.evaluate(() => {
    const btn = document.querySelector('[data-testid="tweetButton"]');
    if (!btn) return false;
    btn.click();
    return true;
  });
  console.log('post clicked:', clicked);
  await new Promise((r) => setTimeout(r, 6000));
  console.log('url:', page.url());
}

await browser.disconnect();
