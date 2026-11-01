import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { decodeRoomState, encodeRoomState, roomFragment, MAX_SHARED_ARTIFACT } from '../src/index.js';

describe('property: room state round-trip', () => {
  it('P8 decodes whatever it encoded', () => {
    fc.assert(
      fc.property(
        fc.string({ maxLength: 400 }),
        fc.integer({ min: 0, max: 999_999 }),
        (artifact, seed) => {
          const encoded = encodeRoomState({ artifact, seed });
          expect(decodeRoomState(encoded)).toEqual({ artifact, seed });
          expect(decodeRoomState(roomFragment({ artifact, seed }))).toEqual({ artifact, seed });
        },
      ),
    );
  });

  it('P9 survives arbitrary unicode and control characters', () => {
    fc.assert(
      fc.property(fc.fullUnicodeString({ maxLength: 200 }), (artifact) => {
        const decoded = decodeRoomState(encodeRoomState({ artifact, seed: 1 }));
        expect(decoded?.artifact).toBe(artifact);
      }),
    );
  });

  it('P10 never throws on hostile input', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 120 }), (junk) => {
        expect(() => decodeRoomState(junk)).not.toThrow();
      }),
    );
  });
});

describe('room state limits', () => {
  it('truncates oversized artifacts instead of producing a giant link', () => {
    const artifact = 'x'.repeat(MAX_SHARED_ARTIFACT + 500);
    const encoded = encodeRoomState({ artifact, seed: 5 });
    expect(decodeRoomState(encoded)?.artifact.length).toBe(MAX_SHARED_ARTIFACT);
  });

  it('normalises negative and oversized seeds', () => {
    expect(decodeRoomState(encodeRoomState({ artifact: 'a', seed: -3 }))?.seed).toBe(0);
    expect(decodeRoomState(encodeRoomState({ artifact: 'a', seed: 1_000_007 }))?.seed).toBe(7);
  });

  it('returns null for a fragment that is not ours', () => {
    expect(decodeRoomState('#garbage')).toBeNull();
    expect(decodeRoomState('')).toBeNull();
  });
});
