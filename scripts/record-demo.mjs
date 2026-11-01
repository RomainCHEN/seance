#!/usr/bin/env node
// Record the Séance demo into a frame sequence using a headless browser.
// No screen capture, no permissions, no window stealing.
//
//   node scripts/record-demo.mjs <base-url> <out-dir> [--fps 4] [--pace 1]
//
// Then assemble with scripts/frames-to-video.swift.
import puppeteer from 'puppeteer-core';
import { mkdir, rm, writeFile, appendFile } from 'node:fs/promises';
import { join } from 'node:path';

const BROWSER_URL = process.env.SEANCE_CDP_HEADLESS ?? 'http://127.0.0.1:9334';
const base = (process.argv[2] ?? 'https://romain.is-a.dev/seance').replace(/\/$/, '');
const outDir = process.argv[3] ?? 'frames';
const fpsArg = process.argv.indexOf('--fps');
const fps = fpsArg > 0 ? Number(process.argv[fpsArg + 1]) : 4;
const paceArg = process.argv.indexOf('--pace');
const pace = paceArg > 0 ? Number(process.argv[paceArg + 1]) : 1;

const frameMs = Math.round(1000 / fps);

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const browser = await puppeteer.connect({ browserURL: BROWSER_URL, defaultViewport: null });
const pages = await browser.pages();
const page = pages[pages.length - 1] ?? (await browser.newPage());
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

let frame = 0;
const t0 = Date.now();
let capturing = true;

async function captureLoop() {
  while (capturing) {
    const started = Date.now();
    try {
      const buffer = await page.screenshot({ type: 'png' });
      await writeFile(join(outDir, `frame-${String(frame).padStart(5, '0')}.png`), buffer);
      await appendFile(join(outDir, 'timestamps.jsonl'), `${JSON.stringify({ i: frame, ms: Date.now() - t0 })}\n`);
      frame += 1;
    } catch (error) {
      if (frame === 0 && !global.__loggedError) {
        global.__loggedError = true;
        console.error('capture error:', error.message);
      }
    }
    const elapsed = Date.now() - started;
    if (elapsed < frameMs) await new Promise((r) => setTimeout(r, frameMs - elapsed));
  }
}

const loop = captureLoop();

const wait = (ms) => new Promise((r) => setTimeout(r, Math.round(ms * pace)));

async function smoothScrollTo(y, steps = 16, stepMs = 55) {
  const from = await page.evaluate(() => window.scrollY);
  for (let i = 1; i <= steps; i += 1) {
    await page.evaluate((v) => window.scrollTo(0, v), from + ((y - from) * i) / steps);
    await wait(stepMs);
  }
}

const height = () => page.evaluate(() => document.body.scrollHeight - window.innerHeight);

const beats = [];
const beat = async (label, ms) => {
  beats.push(`${((Date.now() - t0) / 1000).toFixed(1)}s ${label}`);
  await wait(ms);
};

await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => window.scrollTo(0, 0));
await beat('landing', 3500);
await smoothScrollTo(700);
await beat('landing scrolled', 2500);

await page.goto(`${base}/apps/code-seance/`, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => window.scrollTo(0, 0));
await beat('code seance top', 4000);
await smoothScrollTo(await height());
await beat('code seance verdict', 6000);
const seed = await page.$('button.sn-button');
if (seed) {
  await seed.click();
  await beat('seed re-run', 4000);
}

await page.goto(`${base}/apps/postmortem-seance/`, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => window.scrollTo(0, 0));
await beat('postmortem top', 3000);
await smoothScrollTo(await height());
await beat('postmortem verdict', 4500);

await page.goto(`${base}/template/`, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => window.scrollTo(0, 0));
await beat('template', 3500);

await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => window.scrollTo(0, 0));
await beat('outro', 2500);

capturing = false;
await loop;

const seconds = ((Date.now() - t0) / 1000).toFixed(1);
console.log(JSON.stringify({ frames: frame, seconds, fps, beats }, null, 2));
await browser.disconnect();
