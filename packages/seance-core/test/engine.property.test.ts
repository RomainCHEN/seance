import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { DEFAULT_SCORING, decide, orderPersonas, runRoom, scoreFindings, transcriptsEqual } from '../src/index.js';
import type { Finding, Persona, Severity } from '../src/types.js';

const severities: readonly Severity[] = ['info', 'warn', 'risk'];

const findingArb = fc
  .record({
    severity: fc.constantFrom(...severities),
    line: fc.integer({ min: 1, max: 500 }),
  })
  .map<Finding>(({ severity, line }) => ({
    id: `f-${severity}-${line}`,
    personaId: 'p',
    turn: 1,
    severity,
    lensId: 'l',
    lensLabel: 'L',
    evidence: 'x',
    line,
    keyword: 'x',
  }));

const personaArb = fc
  .record({
    id: fc.stringMatching(/^[a-z]{2,6}$/),
    order: fc.integer({ min: 0, max: 5 }),
    hits: fc.integer({ min: 0, max: 3 }),
  })
  .map<Persona>(({ id, order, hits }) => ({
    id,
    name: `Name ${id}`,
    role: 'role',
    order,
    voice: 'voice',
    lenses: [
      {
        id: 'k',
        label: 'keyword lens',
        severity: 'warn',
        keywords: Array.from({ length: hits }, (_, index) => `needle${index}`),
      },
    ],
    phrases: { none: 'none', some: 'some {hits}', many: 'many {hits}' },
  }));

describe('property: scoring', () => {
  it('P2 keeps the score inside [0, 100]', () => {
    fc.assert(
      fc.property(fc.array(findingArb, { maxLength: 60 }), fc.integer({ min: 1, max: 8 }), (findings, personaCount) => {
        const score = scoreFindings(findings, personaCount, DEFAULT_SCORING);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
        expect(Number.isInteger(score)).toBe(true);
      }),
    );
  });

  it('P3 adding a risk finding never lowers the score', () => {
    const riskFinding: Finding = {
      id: 'extra-risk',
      personaId: 'p',
      turn: 1,
      severity: 'risk',
      lensId: 'l',
      lensLabel: 'L',
      evidence: 'x',
      line: 999,
      keyword: 'x',
    };

    fc.assert(
      fc.property(fc.array(findingArb, { maxLength: 20 }), fc.integer({ min: 1, max: 8 }), (findings, personaCount) => {
        const before = scoreFindings(findings, personaCount, DEFAULT_SCORING);
        const after = scoreFindings([...findings, riskFinding], personaCount, DEFAULT_SCORING);
        expect(after).toBeGreaterThanOrEqual(before);
      }),
    );
  });

  it('P4 maps every score to exactly one decision', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), (score) => {
        const decision = decide(score);
        expect(['ship', 'revise', 'block']).toContain(decision);
        if (score < 30) expect(decision).toBe('ship');
        else if (score < 70) expect(decision).toBe('revise');
        else expect(decision).toBe('block');
      }),
    );
  });
});

describe('property: engine', () => {
  it('P1 is deterministic and P5 emits one turn per persona', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(personaArb, { maxLength: 8, selector: (persona) => persona.id }),
        fc.array(fc.string({ maxLength: 12 }), { maxLength: 12 }),
        fc.integer({ min: 0, max: 1_000_000 }),
        (personas, lines, seed) => {
          fc.pre(personas.length > 0 && lines.join('').trim() !== '');

          const artifact = lines.join('\n') || 'x';
          const a = runRoom({ artifactLabel: 'a', artifact, personas, seed });
          const b = runRoom({ artifactLabel: 'a', artifact, personas, seed });

          expect(transcriptsEqual(a, b)).toBe(true);
          expect(a.turns).toHaveLength(personas.length);
        },
      ),
    );
  });

  it('P6 never mutates the persona array it was given', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(personaArb, { maxLength: 8, selector: (persona) => persona.id }),
        fc.integer({ min: 0, max: 1000 }),
        (personas, seed) => {
          fc.pre(personas.length > 0);
          const snapshot = JSON.stringify(personas);
          runRoom({ artifactLabel: 'a', artifact: 'needle0 needle1', personas, seed });
          expect(JSON.stringify(personas)).toBe(snapshot);
        },
      ),
    );
  });

  it('P7 ordering is stable regardless of input order', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(personaArb, { maxLength: 8, selector: (persona) => persona.id }),
        (personas) => {
          fc.pre(personas.length > 1);
          const forward = orderPersonas(personas).map((persona) => persona.id);
          const backward = orderPersonas([...personas].reverse()).map((persona) => persona.id);
          expect(backward).toEqual(forward);
        },
      ),
    );
  });
});
