#!/usr/bin/env node
// Copies the static landing page into dist/ and verifies every app build is present.
import { cp, readdir, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');

const REQUIRED = [
  'apps/code-seance/index.html',
  'apps/postmortem-seance/index.html',
  'template/index.html',
];

async function main() {
  await cp(join(root, 'site'), dist, { recursive: true });

  const missing = [];
  for (const relative of REQUIRED) {
    try {
      await access(join(dist, relative), constants.R_OK);
    } catch {
      missing.push(relative);
    }
  }

  if (missing.length > 0) {
    console.error('build:site — missing built entry points:');
    for (const file of missing) console.error(`  - ${file}`);
    console.error('Run the app builds first (npm run build).');
    process.exit(1);
  }

  const entries = await readdir(dist);
  console.log(`build:site — dist contains: ${entries.sort().join(', ')}`);
  console.log(`build:site — landing page: file://${join(dist, 'index.html')}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
