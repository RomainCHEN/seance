import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { parsePersona, runRoom, type Persona } from '../src/index.js';

const ROOT = process.cwd();

interface RoomFixture {
  name: string;
  personas: Persona[];
}

function loadRoom(relative: string): RoomFixture {
  const dir = join(ROOT, relative, 'personas');
  const files = readdirSync(dir).filter((file) => file.endsWith('.yaml'));
  const personas = files.map((file) => parsePersona(parse(readFileSync(join(dir, file), 'utf8'))));
  return { name: relative, personas };
}

const ROOMS = ['template', 'apps/code-seance', 'apps/postmortem-seance'].filter((relative) =>
  existsSync(join(ROOT, relative, 'personas')),
);

describe('shipped rooms', () => {
  it('finds at least three rooms to validate', () => {
    expect(ROOMS.length).toBeGreaterThanOrEqual(3);
  });

  it.each(ROOMS)('%s declares a persona set the engine accepts', (relative) => {
    const room = loadRoom(relative);
    expect(room.personas.length).toBeGreaterThan(0);

    const transcript = runRoom({
      artifactLabel: 'fixture.txt',
      artifact: 'TODO: nothing has been written here yet.',
      personas: room.personas,
      seed: 42,
    });

    expect(transcript.turns).toHaveLength(room.personas.length);
    expect(transcript.verdict.score).toBeGreaterThanOrEqual(0);
    expect(transcript.verdict.score).toBeLessThanOrEqual(100);
  });

  it.each(ROOMS)('%s assigns every persona a unique turn order', (relative) => {
    const { personas } = loadRoom(relative);
    const ids = personas.map((persona) => persona.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(personas.every((persona) => persona.lenses.length > 0)).toBe(true);
  });
});
