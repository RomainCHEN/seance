/**
 * Deterministic pseudo-randomness.
 *
 * The engine must never call Math.random(); every "random" choice is derived
 * from the room seed plus stable labels, so transcripts are reproducible.
 */

/** FNV-1a 32-bit hash. Stable across runs and platforms. */
export function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** mulberry32: tiny, fast, good enough for narrative jitter. */
export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable number in [0, 1) for a given seed and labels. */
export function jitter(seed: number, ...labels: string[]): number {
  const rng = createRng(hashString(`${seed}:${labels.join('|')}`));
  return rng();
}

/** Stable index into an array of `length`. Returns 0 when the array is empty. */
export function pickIndex(seed: number, length: number, ...labels: string[]): number {
  if (length <= 0) return 0;
  return Math.floor(jitter(seed, ...labels) * length) % length;
}

/**
 * Deterministic "give me another seed" step (LCG, mod 1e6).
 * Used by the UI so pressing "re-run" is reproducible rather than random.
 */
export function nextSeed(current: number, modulus = 1_000_000): number {
  const base = Number.isFinite(current) ? Math.trunc(current) : 0;
  const next = (base * 1103515245 + 12345) % modulus;
  return next < 0 ? next + modulus : next;
}
