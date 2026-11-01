import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const created: string[] = [];

function scaffold(name: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'seance-scaffold-'));
  created.push(dir);
  execFileSync(process.execPath, ['scripts/new-room.mjs', name, '--out', dir], { cwd: process.cwd() });
  return join(dir, name);
}

afterEach(() => {
  for (const dir of created.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe('scripts/new-room.mjs', () => {
  it('copies the template into a new app', () => {
    const room = scaffold('test-room');
    expect(existsSync(join(room, 'personas', 'archivist.yaml'))).toBe(true);
    expect(existsSync(join(room, 'scoring.yaml'))).toBe(true);
    expect(existsSync(join(room, 'src', 'main.tsx'))).toBe(true);
  });

  it('renames the package after the room', () => {
    const pkg = JSON.parse(readFileSync(join(scaffold('my-room'), 'package.json'), 'utf8')) as {
      name: string;
      private?: boolean;
    };
    expect(pkg.name).toBe('@seance/app-my-room');
    expect(pkg.private).toBeUndefined();
  });

  it('refuses an invalid room name', () => {
    const dir = mkdtempSync(join(tmpdir(), 'seance-scaffold-'));
    created.push(dir);
    expect(() =>
      execFileSync(process.execPath, ['scripts/new-room.mjs', 'Bad Name', '--out', dir], {
        cwd: process.cwd(),
        stdio: 'pipe',
      }),
    ).toThrow();
  });
});
