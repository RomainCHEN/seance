import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SCORING,
  MAX_FINDINGS_PER_LENS,
  ValidationError,
  decide,
  orderPersonas,
  parsePersona,
  runRoom,
  scoreFindings,
  transcriptsEqual,
} from '../src/index.js';
import type { Finding, Persona, Severity } from '../src/types.js';

const reviewer: Persona = {
  id: 'specter',
  name: 'The Specter',
  role: 'Hunts secrets',
  order: 2,
  voice: 'cold',
  lenses: [
    { id: 'secrets', label: 'Secrets in source', severity: 'risk', keywords: ['api_key', 'token'] },
    { id: 'style', label: 'Style drift', severity: 'info', keywords: ['console.log'] },
  ],
  phrases: { none: 'Nothing. | Silence.', some: 'Seen {hits}.', many: 'So many ({hits}).' },
};

const wraith: Persona = {
  id: 'wraith',
  name: 'The Wraith',
  role: 'Guards trust boundaries',
  order: 1,
  voice: 'clipped',
  lenses: [{ id: 'injection', label: 'Injection', severity: 'risk', keywords: ['innerHTML', 'eval('] }],
  phrases: { none: 'Clean.', some: '{hits} way in.', many: '{hits} ways in.' },
};

function finding(severity: Severity, index = 0): Finding {
  return {
    id: `f${index}`,
    personaId: 'p',
    turn: 1,
    severity,
    lensId: 'l',
    lensLabel: 'L',
    evidence: 'x',
    line: 1,
    keyword: 'x',
  };
}

describe('parsePersona', () => {
  it('accepts a valid persona', () => {
    expect(parsePersona(reviewer).id).toBe('specter');
  });

  it('names the offending field', () => {
    const broken = { ...reviewer, name: '' };
    expect(() => parsePersona(broken)).toThrowError(/persona\.name/);
  });

  it('rejects an unknown severity', () => {
    const broken = { ...reviewer, lenses: [{ ...reviewer.lenses[0], severity: 'fatal' }] };
    expect(() => parsePersona(broken)).toThrowError(ValidationError);
  });
});

describe('orderPersonas', () => {
  it('sorts by order then id without mutating the input', () => {
    const input = [reviewer, wraith];
    const ordered = orderPersonas(input);
    expect(ordered.map((persona) => persona.id)).toEqual(['wraith', 'specter']);
    expect(input.map((persona) => persona.id)).toEqual(['specter', 'wraith']);
  });

  it('rejects duplicate ids', () => {
    expect(() => orderPersonas([reviewer, { ...wraith, id: 'specter' }])).toThrowError(/duplicate/);
  });
});

describe('runRoom', () => {
  const artifact = ['const api_key = "sk-live-123";', 'el.innerHTML = payload;', 'console.log(api_key);'].join(
    '\n',
  );

  it('produces one turn per persona, in order', () => {
    const transcript = runRoom({ artifactLabel: 'app.ts', artifact, personas: [reviewer, wraith], seed: 7 });
    expect(transcript.turns).toHaveLength(2);
    expect(transcript.turns.map((turn) => turn.personaId)).toEqual(['wraith', 'specter']);
  });

  it('is deterministic for the same seed', () => {
    const a = runRoom({ artifactLabel: 'app.ts', artifact, personas: [reviewer, wraith], seed: 7 });
    const b = runRoom({ artifactLabel: 'app.ts', artifact, personas: [reviewer, wraith], seed: 7 });
    expect(transcriptsEqual(a, b)).toBe(true);
  });

  it('caps findings per lens and never duplicates a line within a lens', () => {
    const lines = Array.from({ length: 6 }, (_, index) => `token = "${index}";`);
    const transcript = runRoom({
      artifactLabel: 'a.ts',
      artifact: lines.join('\n'),
      personas: [reviewer],
      seed: 1,
    });
    const secrets = transcript.turns[0]?.findings.filter((item) => item.lensId === 'secrets') ?? [];
    expect(secrets).toHaveLength(MAX_FINDINGS_PER_LENS);
    expect(new Set(secrets.map((item) => item.line)).size).toBe(secrets.length);
  });

  it('records severity from the lens', () => {
    const transcript = runRoom({ artifactLabel: 'a.ts', artifact, personas: [wraith], seed: 1 });
    expect(transcript.turns[0]?.findings.every((item) => item.severity === 'risk')).toBe(true);
  });

  it('refuses a blank artifact', () => {
    expect(() => runRoom({ artifactLabel: 'a.ts', artifact: '   ', personas: [wraith], seed: 1 })).toThrowError(
      /artifact/,
    );
  });

  it('refuses an empty persona list', () => {
    expect(() => runRoom({ artifactLabel: 'a.ts', artifact, personas: [], seed: 1 })).toThrowError(/personas/);
  });
});

describe('verdict', () => {
  it('scores an empty finding list as 0 / ship', () => {
    expect(scoreFindings([], 3)).toBe(0);
    expect(decide(0)).toBe('ship');
  });

  it('uses the documented decision boundaries', () => {
    expect(decide(29)).toBe('ship');
    expect(decide(30)).toBe('revise');
    expect(decide(69)).toBe('revise');
    expect(decide(70)).toBe('block');
    expect(decide(100)).toBe('block');
  });

  it('never exceeds 100 even with many findings', () => {
    const findings = Array.from({ length: 40 }, (_, index) => finding('risk', index));
    expect(scoreFindings(findings, 1, DEFAULT_SCORING)).toBe(100);
  });
});
