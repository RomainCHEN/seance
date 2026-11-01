#!/usr/bin/env node
// Drive the Séance demo in the CDP browser, beat by beat, so it can be recorded
// in one unattended take (see docs/VIDEO_SCRIPT.md).
//
//   node scripts/demo.mjs <base-url> [--pace 1.0]
//
// It never types into anything: only navigation, scrolling and the two buttons
// the video script calls for.
import puppeteer from 'puppeteer-core';

const BROWSER_URL = process.env.SEANCE_CDP ?? 'http://127.0.0.1:9333';
const base = (process.argv[2] ?? 'https://romain.is-a.dev/seance').replace(/\/$/, '');
const paceArg = process.argv.indexOf('--pace');
const pace = paceArg > 0 ? Number(process.argv[paceArg + 1] ?? 1) : 1;

const browser = await puppeteer.connect({ browserURL: BROWSER_URL, defaultViewport: null });
const pages = await browser.pages();
const page = pages[pages.length - 1];

const wait = (ms) => new Promise((r) => setTimeout(r, Math.round(ms * pace)));
const beat = async (label, ms) => {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${label}`);
  await wait(ms);
};

async function smoothScrollTo(y, steps = 14, stepMs = 42) {
  const from = await page.evaluate(() => window.scrollY);
  for (let i = 1; i <= steps; i += 1) {
    const target = from + ((y - from) * i) / steps;
    await page.evaluate((v) => window.scrollTo(0, v), target);
    await wait(stepMs);
  }
}

async function height() {
  return page.evaluate(() => document.body.scrollHeight - window.innerHeight);
}

await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => window.scrollTo(0, 0));
await beat('0:00 landing page', 3000);
await smoothScrollTo(700);
await beat('0:15 landing page scrolled to the three rooms', 3500);

await page.goto(`${base}/apps/code-seance/`, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => window.scrollTo(0, 0));
await beat('0:40 code seance, top', 4000);
await smoothScrollTo(await height());
await beat('1:05 transcript + verdict', 8000);

const seedButton = await page.$('button.sn-button');
if (seedButton) {
  await seedButton.click();
  await beat('1:28 re-run with a new seed', 4500);
}

await page.goto(`${base}/apps/postmortem-seance/`, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => window.scrollTo(0, 0));
await beat('1:35 postmortem seance, top', 3500);
await smoothScrollTo(await height());
await beat('1:45 postmortem verdict', 5000);

await page.goto(`${base}/template/`, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => window.scrollTo(0, 0));
await beat('1:55 the template', 4000);

await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => window.scrollTo(0, 0));
await beat('2:10 back to the landing page (outro)', 4000);

console.log('demo finished');
await browser.disconnect();
