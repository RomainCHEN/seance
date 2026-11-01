#!/usr/bin/env node
// Upload the recorded demo to YouTube Studio over CDP.
//
//   node scripts/youtube-upload.mjs <video.mp4> [--publish] [--wait]
//
// Without --publish it stops on the details step so a human can review.
// With --publish it fills title/description, marks "not made for kids",
// selects Public and clicks Publish.
import puppeteer from 'puppeteer-core';
import { readFile } from 'node:fs/promises';

const BROWSER_URL = process.env.SEANCE_CDP ?? 'http://127.0.0.1:9333';
const videoPath = process.argv[2];
const shouldPublish = process.argv.includes('--publish');
const waitMs = Number(process.env.YT_STEP_WAIT ?? 2500);

if (!videoPath) {
  console.error('usage: node scripts/youtube-upload.mjs <video.mp4> [--publish]');
  process.exit(1);
}

const TITLE = 'Séance — deterministic multi-agent rooms (Kiroween 2026)';

const description = await readFile(new URL('../docs/VIDEO_DESCRIPTION.md', import.meta.url), 'utf8')
  .then((text) => {
    const match = text.match(/```\n#KiroweenHackathon26[\s\S]*?\n```/);
    return match ? match[0].replace(/```/g, '').trim() : '';
  })
  .catch(() => '');

const browser = await puppeteer.connect({ browserURL: BROWSER_URL, defaultViewport: null });
const pages = await browser.pages();
const page = pages[pages.length - 1];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 1. Hand the file to the dialog's file input.
const input = await page.$('input[type="file"]');
if (!input) {
  console.error('no file input on the page — open Studio → Create → Upload video first');
  process.exit(1);
}
await input.uploadFile(videoPath);
console.log('upload started:', videoPath);
await sleep(6000);

// 2. Title + description appear as contenteditable divs on the details step.
async function setEditable(selectorCandidates, value) {
  return page.evaluate(
    ({ candidates, text }) => {
      for (const selector of candidates) {
        const el = document.querySelector(selector);
        if (!el) continue;
        el.focus();
        el.textContent = text;
        el.dispatchEvent(new InputEvent('input', { bubbles: true, data: text }));
        return selector;
      }
      return null;
    },
    { candidates: selectorCandidates, text: value },
  );
}

const titleTarget = await setEditable(
  ['#textbox[contenteditable="true"]', 'ytcp-social-suggestions-textbox #textbox', 'div[contenteditable="true"]'],
  TITLE,
);
console.log('title set via', titleTarget);
await sleep(waitMs);

const descTarget = await page.evaluate((text) => {
  const boxes = [...document.querySelectorAll('#textbox[contenteditable="true"]')];
  const el = boxes[1];
  if (!el) return null;
  el.focus();
  el.textContent = text;
  el.dispatchEvent(new InputEvent('input', { bubbles: true, data: text }));
  return '#textbox[1]';
}, description);
console.log('description set via', descTarget, `(${description.length} chars)`);

await page.screenshot({ path: '/tmp/yt-details.png' });
console.log('details screenshot: /tmp/yt-details.png');

if (!shouldPublish) {
  console.log('stopping before publish (no --publish)');
  await browser.disconnect();
  process.exit(0);
}

// 3. "Not made for kids" radio.
const kids = await page.evaluate(() => {
  const radios = [...document.querySelectorAll('tp-yt-paper-radio-button, ytcp-radio-button')];
  const el = radios.find((r) => /不是为儿童打造|Not made for kids/i.test(r.innerText));
  if (!el) return false;
  el.click();
  return true;
});
console.log('not-made-for-kids:', kids);
await sleep(waitMs);

// 4. Next → Next → Visibility: Public → Publish
async function clickNext() {
  return page.evaluate(() => {
    const btn = [...document.querySelectorAll('ytcp-button')].find(
      (b) => /下一步|Next/i.test(b.innerText) && b.offsetParent !== null && !b.hasAttribute('disabled'),
    );
    if (!btn) return false;
    btn.click();
    return true;
  });
}
for (let i = 0; i < 3; i += 1) {
  console.log('next:', await clickNext());
  await sleep(waitMs);
}

const publicSet = await page.evaluate(() => {
  const radios = [...document.querySelectorAll('tp-yt-paper-radio-button')];
  const el = radios.find((r) => /公开|Public/i.test(r.innerText) && /公开/.test(r.innerText));
  if (!el) return false;
  el.click();
  return true;
});
console.log('public:', publicSet);
await sleep(waitMs);

const published = await page.evaluate(() => {
  const btn = [...document.querySelectorAll('ytcp-button')].find(
    (b) => /^(发布|Publish)$/i.test(b.innerText.trim()) && b.offsetParent !== null,
  );
  if (!btn) return false;
  btn.click();
  return true;
});
console.log('publish clicked:', published);
await sleep(8000);

const result = await page.evaluate(() => ({
  url: location.href,
  text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 300),
}));
console.log(JSON.stringify(result, null, 2));
await page.screenshot({ path: '/tmp/yt-published.png' });
await browser.disconnect();
