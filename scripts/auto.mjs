#!/usr/bin/env node
// Drive the debuggable Brave instance (--remote-debugging-port=9333) over CDP.
//
//   node scripts/auto.mjs status
//   node scripts/auto.mjs goto <url>
//   node scripts/auto.mjs eval "<js expression>"
//   node scripts/auto.mjs shot <file>
//   node scripts/auto.mjs text                     # visible text of the page
//
// Uses a cloned profile (./.brave-auto) so the user's own window is untouched.
import puppeteer from 'puppeteer-core';
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const BROWSER_URL = process.env.SEANCE_CDP ?? 'http://127.0.0.1:9333';
const STATE = process.env.SEANCE_CDP_STATE ?? '.cdp-target';

const targetId = (target) => {
  try {
    return target.target()._targetId ?? null;
  } catch {
    return null;
  }
};

async function remember(target) {
  const id = targetId(target);
  if (!id) return;
  await mkdir(dirname(STATE), { recursive: true }).catch(() => {});
  await writeFile(STATE, id).catch(() => {});
}

async function findPage(browser) {
  const pages = await browser.pages();
  let wanted = null;
  try {
    wanted = (await readFile(STATE, 'utf8')).trim();
  } catch {
    wanted = null;
  }
  if (wanted) {
    const match = pages.find((p) => targetId(p) === wanted);
    if (match) return match;
  }
  const fresh = pages.filter((p) => p.url() !== 'about:blank');
  return fresh[fresh.length - 1] ?? pages[pages.length - 1] ?? browser.newPage();
}

const [command, ...rest] = process.argv.slice(2);

const run = async () => {
  const browser = await puppeteer.connect({ browserURL: BROWSER_URL, defaultViewport: null });
  const target = await findPage(browser);

  switch (command) {
    case 'status': {
      console.log(JSON.stringify({ url: target.url(), title: await target.title() }, null, 2));
      break;
    }
    case 'goto': {
      await target.goto(rest[0], { waitUntil: 'domcontentloaded', timeout: 45000 });
      await new Promise((r) => setTimeout(r, 1500));
      await remember(target);
      console.log(JSON.stringify({ url: target.url(), title: await target.title() }, null, 2));
      break;
    }
    case 'new': {
      const fresh = await browser.newPage();
      await fresh.goto(rest[0], { waitUntil: 'domcontentloaded', timeout: 45000 });
      await new Promise((r) => setTimeout(r, 1500));
      await remember(fresh);
      console.log(JSON.stringify({ url: fresh.url(), title: await fresh.title() }, null, 2));
      break;
    }
    case 'eval': {
      const value = await target.evaluate(rest.join(' '));
      console.log(typeof value === 'string' ? value : JSON.stringify(value, null, 2));
      break;
    }
    case 'text': {
      const value = await target.evaluate(() => document.body.innerText.slice(0, 6000));
      console.log(value);
      break;
    }
    case 'click': {
      const handle = await target.$(rest[0]);
      if (!handle) {
        console.error('selector not found:', rest[0]);
        process.exit(1);
      }
      const box = await handle.boundingBox();
      if (!box) {
        console.error('element has no box:', rest[0]);
        process.exit(1);
      }
      await target.mouse.move(box.x + box.width / 2 - 50, box.y + box.height / 2 - 25, { steps: 6 });
      await target.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 10 });
      await new Promise((r) => setTimeout(r, 350));
      await target.mouse.down();
      await new Promise((r) => setTimeout(r, 80));
      await target.mouse.up();
      console.log('trusted click on', rest[0]);
      break;
    }
    case 'shot': {
      await target.screenshot({ path: rest[0], fullPage: false });
      console.log(rest[0]);
      break;
    }
    default:
      console.error('usage: auto.mjs {status|goto|eval|text|shot} ...');
      process.exit(1);
  }

  await browser.disconnect();
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
