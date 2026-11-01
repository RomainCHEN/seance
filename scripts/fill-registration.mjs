#!/usr/bin/env node
// Fill the Kiroween registration form via CDP. Leaves the two consent
// checkboxes unchecked on purpose, and never submits.
//
//   node scripts/fill-registration.mjs "<kiro-user-id>"
import puppeteer from 'puppeteer-core';

const BROWSER_URL = process.env.SEANCE_CDP ?? 'http://127.0.0.1:9333';
const kiroUserId = process.argv[2];

if (!kiroUserId) {
  console.error('usage: node scripts/fill-registration.mjs <kiro-user-id>');
  process.exit(1);
}

const INTERESTS = `Spec-driven development: requirements, design and tasks the agent has to satisfy, plus always-on steering rules. I also like that the CLI can audit a repo against its own spec — that is how I caught a scoring bug and two lenses that could never fire in my project.`;

const browser = await puppeteer.connect({ browserURL: BROWSER_URL, defaultViewport: null });
const pages = await browser.pages();
const page = pages[pages.length - 1];

const result = await page.evaluate(
  async ({ userId, interests }) => {
    const form = document.querySelector('form#registration-form');
    if (!form) return { error: 'registration form not found' };

    const $ = window.$;
    const log = [];

    const setNative = (el, value) => {
      const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      setter?.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };

    const setSelect = (id, value) => {
      const el = document.getElementById(id);
      if (!el) return log.push(`missing ${id}`);
      el.value = value;
      if ($) $(el).trigger('change');
      el.dispatchEvent(new Event('change', { bubbles: true }));
      log.push(`${id} = ${value}`);
    };

    const setMulti = (id, values) => {
      const el = document.getElementById(id);
      if (!el) return log.push(`missing ${id}`);
      for (const option of el.options) option.selected = values.includes(option.value);
      if ($) $(el).trigger('change');
      el.dispatchEvent(new Event('change', { bubbles: true }));
      log.push(`${id} = ${values.join(', ')}`);
    };

    const clickRadio = (id) => {
      const el = document.getElementById(id);
      if (!el) return log.push(`missing ${id}`);
      el.click();
      log.push(`radio ${id}`);
    };

    const last = document.getElementById('registration_last_name');
    if (last) {
      setNative(last, 'Chen');
      log.push('last_name = Chen');
    }

    clickRadio('registration_intending_to_team_up_working_solo');
    clickRadio('registration_source_the_organizer');

    const userIdInput = document.getElementById('registration_registration_field_values_attributes_0_value');
    if (userIdInput) {
      setNative(userIdInput, userId);
      log.push('kiro user id set');
    }

    setSelect('registration_registration_field_values_attributes_1_value', 'Use it regularly');

    const interestsEl = document.getElementById('registration_registration_field_values_attributes_2_value');
    if (interestsEl) {
      setNative(interestsEl, interests);
      log.push('interests set');
    }

    setMulti('registration_registration_field_values_attributes_3_values', ['Kiro CLI', 'Kiro Web']);
    setSelect('registration_registration_field_values_attributes_4_value', 'Kiro CLI');

    // Deliberately untouched:
    //   #registration_agree_to_eligibility
    //   #registration_agree_to_rules

    return { log };
  },
  { userId: kiroUserId, interests: INTERESTS },
);

console.log(JSON.stringify(result, null, 2));
await browser.disconnect();
