#!/usr/bin/env node
// Fill the dev.to editor from docs/BLOG_DRAFT.md. Never publishes unless --publish.
//
//   node scripts/devto-post.mjs [--publish]
import puppeteer from 'puppeteer-core';
import { readFile } from 'node:fs/promises';

const BROWSER_URL = process.env.SEANCE_CDP ?? 'http://127.0.0.1:9333';

const TITLE = 'Multi-agent demos you can actually reproduce';
const TAGS = ['ai', 'typescript', 'testing', 'opensource'];

const browser = await puppeteer.connect({ browserURL: BROWSER_URL, defaultViewport: null });
const pages = await browser.pages();
const wanted = await readFile('.cdp-target', 'utf8').catch(() => null);
const id = wanted ? wanted.trim() : null;
const page = (id && pages.find((p) => p.target()._targetId === id)) ?? pages[pages.length - 1];

await page.goto('https://dev.to/new', { waitUntil: 'domcontentloaded', timeout: 60000 });
await new Promise((r) => setTimeout(r, 5000));

const body = await readFile('docs/BLOG_POST.md', 'utf8');

const log = await page.evaluate(
  async ({ title, tags, markdown }) => {
    const out = [];
    const setNative = (el, value) => {
      const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };

    const titleEl = document.getElementById('article-form-title');
    if (!titleEl) return ['no title field'];
    setNative(titleEl, title);
    out.push(`title: ${titleEl.value}`);

    const bodyEl = document.getElementById('article_body_markdown');
    if (!bodyEl) return ['no body field'];
    setNative(bodyEl, markdown);
    out.push(`body: ${bodyEl.value.length} chars`);

    return out;
  },
  { title: TITLE, tags: TAGS, markdown: body },
);

console.log(log.join('\n'));

// Tags: type each one, then click its suggestion in the autocomplete list.
{
  const tagEl = await page.$('#tag-input');
  for (const tag of TAGS) {
    await tagEl.click({ clickCount: 3 });
    await page.keyboard.type(tag, { delay: 40 });
    await new Promise((r) => setTimeout(r, 900));
    const clicked = await page.evaluate(() => {
      const items = [...document.querySelectorAll('[class*="autocomplete"] [role="option"], [class*="autocomplete"] li, .c-autocomplete--multi__item')];
      const visible = items.filter((e) => e.offsetParent !== null);
      if (!visible.length) return null;
      visible[0].click();
      return visible[0].innerText.trim().slice(0, 30);
    });
    console.log('tag', tag, '->', clicked ?? 'no suggestion (pressed Enter instead)');
    if (!clicked) {
      await page.keyboard.press('Enter');
      await new Promise((r) => setTimeout(r, 400));
    }
    await new Promise((r) => setTimeout(r, 400));
  }
}

// Read back tag chips
const chips = await page.evaluate(() =>
  [...document.querySelectorAll('.c-autocomplete--multi__tag, [class*="tag"] button, .crayons-tag')]
    .map((e) => e.innerText.trim())
    .filter(Boolean)
    .slice(0, 8),
);
console.log('tag chips:', JSON.stringify(chips));

await page.screenshot({ path: '/tmp/devto-editor.png' });
console.log('screenshot /tmp/devto-editor.png');

if (process.argv.includes('--publish')) {
  const opened = await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => /^Publish$/i.test(b.innerText.trim()));
    if (!btn) return false;
    btn.click();
    return true;
  });
  console.log('publish panel opened:', opened);
  await new Promise((r) => setTimeout(r, 2500));
  await page.screenshot({ path: '/tmp/devto-publish-panel.png' });

  const confirmed = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')].filter(
      (b) => /publish/i.test(b.innerText.trim()) && b.offsetParent !== null,
    );
    const target = btns[btns.length - 1];
    if (!target) return false;
    target.click();
    return target.innerText.trim();
  });
  console.log('final publish click:', confirmed);
  await new Promise((r) => setTimeout(r, 6000));
  console.log('url:', page.url());
  await page.screenshot({ path: '/tmp/devto-published.png' });
}

await browser.disconnect();
