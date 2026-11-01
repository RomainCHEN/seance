/**
 * Room state encoding, so a room can be shared as a URL fragment.
 *
 * The fragment is base64url(JSON) of `{ a, s }` — artifact and seed. It is not
 * compressed and not encrypted: it is a link a human copies, nothing more.
 */

export interface RoomState {
  artifact: string;
  seed: number;
}

/** Longest artifact carried in a fragment; larger artifacts fall back to seed-only links. */
export const MAX_SHARED_ARTIFACT = 4000;

function toBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(input: string): string {
  const normalised = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalised.padEnd(Math.ceil(normalised.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Encode a room into a URL fragment body (no leading `#`). */
export function encodeRoomState(state: RoomState): string {
  const artifact = state.artifact.slice(0, MAX_SHARED_ARTIFACT);
  const seed = Math.max(0, Math.trunc(state.seed)) % 1_000_000;
  return toBase64Url(JSON.stringify({ a: artifact, s: seed }));
}

/**
 * Decode a URL fragment body.
 * Returns `null` for anything that is not a room we produced, so a bad link can
 * never crash the app.
 */
export function decodeRoomState(fragment: string): RoomState | null {
  const raw = fragment.replace(/^#/, '').replace(/^r=/, '');
  if (raw === '') return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(fromBase64Url(raw));
  } catch {
    return null;
  }

  if (!isRecord(parsed)) return null;
  const artifact = parsed['a'];
  const seed = parsed['s'];
  if (typeof artifact !== 'string' || typeof seed !== 'number' || !Number.isFinite(seed)) return null;

  return { artifact, seed: Math.max(0, Math.trunc(seed)) % 1_000_000 };
}

/** Build the `#…` fragment for a room. */
export function roomFragment(state: RoomState): string {
  return `#r=${encodeRoomState(state)}`;
}
