import { describe, expect, it } from 'vitest';
import { nextSeed } from '../src/index.js';

describe('nextSeed', () => {
  it('is deterministic', () => {
    expect(nextSeed(7)).toBe(nextSeed(7));
  });

  it('stays inside the modulus', () => {
    let seed = 0;
    for (let i = 0; i < 1000; i += 1) {
      seed = nextSeed(seed);
      expect(seed).toBeGreaterThanOrEqual(0);
      expect(seed).toBeLessThan(1_000_000);
    }
  });

  it('eventually leaves the starting value', () => {
    expect(nextSeed(7)).not.toBe(7);
  });

  it('handles junk input without throwing', () => {
    expect(() => nextSeed(Number.NaN)).not.toThrow();
    expect(nextSeed(Number.NaN)).toBe(12345);
  });
});
