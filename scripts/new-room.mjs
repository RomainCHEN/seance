#!/usr/bin/env node
// Scaffold a new Séance room from template/.
//
//   node scripts/new-room.mjs <room-name> [--out <dir>]
//
// Copies the template, renames the package, and prints the three files you
// actually have to edit. It never edits the engine — if a new room needs a core
// change, the template has a bug (see .kiro/steering/structure.md).
import { cp, readFile, writeFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const NAME_PATTERN = /^[a-z][a-z0-9-]{1,30}$/;

function usage(message) {
  if (message) console.error(`error: ${message}`);
  console.error('usage: node scripts/new-room.mjs <room-name> [--out <dir>]');
  process.exit(1);
}

async function main() {
  const args = process.argv.slice(2);
  const name = args.find((arg) => !arg.startsWith('-'));
  const outIndex = args.indexOf('--out');
  const outRoot = outIndex >= 0 ? resolve(args[outIndex + 1] ?? '') : join(ROOT, 'apps');

  if (!name) usage('missing room name');
  if (!NAME_PATTERN.test(name)) usage(`"${name}" must match ${NAME_PATTERN}`);

  const target = join(outRoot, name);
  try {
    await access(target, constants.F_OK);
    usage(`${target} already exists`);
  } catch {
    // expected: the target must not exist
  }

  await cp(join(ROOT, 'template'), target, {
    recursive: true,
    filter: (source) => !source.includes('node_modules') && !source.includes('/dist'),
  });

  const pkgPath = join(target, 'package.json');
  const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
  pkg.name = `@seance/app-${name}`;
  pkg.description = `A Séance room: ${name}`;
  delete pkg.private;
  await writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

  const title = name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  console.log(`created ${target}`);
  console.log('');
  console.log('Next:');
  console.log(`  1. persona(s)   ${join(target, 'personas')}/*.yaml`);
  console.log(`  2. copy + title ${join(target, 'src/main.tsx')}  (suggested title: "${title}")`);
  console.log(`  3. sample input ${join(target, 'src/sample.ts')}`);
  console.log('');
  console.log(`  npm install && npm run dev -w apps/${name}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
