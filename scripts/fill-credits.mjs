#!/usr/bin/env node
// Fill the Kiroween credits request form (Google Form) via CDP.
// Fills questions 1-8; never touches the Didit consent checkbox and never submits.
//
//   node scripts/fill-credits.mjs <kiro-user-id> [--consent]
import puppeteer from 'puppeteer-core';

const BROWSER_URL = process.env.SEANCE_CDP ?? 'http://127.0.0.1:9333';
const kiroUserId = process.argv[2];
const withConsent = process.argv.includes('--consent');

if (!kiroUserId) {
  console.error('usage: node scripts/fill-credits.mjs <kiro-user-id> [--consent]');
  process.exit(1);
}

const VALUES = {
  first: 'Romain',
  last: 'Chen',
  email: 'zaamingcan@hotmail.com',
  profile: 'https://devpost.com/RomainCHEN',
  country: 'United States',
  dropdown: 'Only Kiro ID',
  category: `Skeleton Crew — Séance is a deterministic multi-agent "room" template: personas live in YAML, a pure seeded engine turns an artifact into a transcript, and one reusable React shell renders it. Two apps are built from the same foundation without touching the engine (Code Séance reviews a diff with three reviewers; Postmortem Séance reads an incident timeline with three investigators). The demo runs offline with no API key, so judges see exactly the same transcript every time. Built with Kiro specs, steering, hooks, a custom agent and the Kiro CLI.`,
};

const browser = await puppeteer.connect({ browserURL: BROWSER_URL, defaultViewport: null });
const pages = await browser.pages();
const page = pages[pages.length - 1];

const question = async (index) => (await page.$$('div[role="listitem"]'))[index];

async function typeInto(index, value) {
  const q = await question(index);
  const field = await q.$('input[type="text"], textarea');
  if (!field) throw new Error(`question ${index}: no text field`);
  await field.click();
  await page.keyboard.type(value, { delay: 8 });
  return `${index}: typed ${value.length} chars`;
}

const log = [];
log.push(await typeInto(0, VALUES.first));
log.push(await typeInto(1, VALUES.last));
log.push(await typeInto(2, VALUES.email));
log.push(await typeInto(3, VALUES.profile));
log.push(await typeInto(4, VALUES.country));

// Q6 (index 5): dropdown -> "Only Kiro ID"
{
  const q = await question(5);
  const trigger = await q.$('div[role="listbox"]');
  await trigger.click();
  await new Promise((r) => setTimeout(r, 800));
  const options = await page.$$('div[role="option"]');
  for (const option of options) {
    const label = (await option.evaluate((el) => el.innerText)).trim();
    if (label === VALUES.dropdown) {
      await option.click();
      log.push(`5: dropdown -> ${label}`);
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 400));
}

log.push(await typeInto(6, kiroUserId));

// Q8 (index 7): paragraph
{
  const q = await question(7);
  const area = await q.$('textarea');
  await area.click();
  await page.keyboard.type(VALUES.category, { delay: 4 });
  log.push('7: category paragraph typed');
}

// Q9 (index 8): Didit consent — only when explicitly asked
if (withConsent) {
  const q = await question(8);
  const box = await q.$('div[role="checkbox"], input[type="checkbox"]');
  await box.click();
  log.push('8: consent checked (explicit --consent)');
} else {
  log.push('8: consent left unchecked');
}

console.log(JSON.stringify({ log }, null, 2));
await browser.disconnect();
