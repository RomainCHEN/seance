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
import { writeFile } from 'node:fs/promises';

const BROWSER_URL = process.env.SEANCE_CDP ?? 'http://127.0.0.1:9333';

async function page() {
  const browser = await puppeteer.connect({ browserURL: BROWSER_URL, defaultViewport: null });
  const pages = await browser.pages();
  const target = pages[pages.length - 1];
  if (!target) throw new Error('no page target');
  return { browser, page: target };
}

const [command, ...rest] = process.argv.slice(2);

const run = async () => {
  const { browser, page: target } = await page();

  switch (command) {
    case 'status': {
      console.log(JSON.stringify({ url: target.url(), title: await target.title() }, null, 2));
      break;
    }
    case 'goto': {
      await target.goto(rest[0], { waitUntil: 'domcontentloaded', timeout: 45000 });
      await new Promise((r) => setTimeout(r, 1500));
      console.log(JSON.stringify({ url: target.url(), title: await target.title() }, null, 2));
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
