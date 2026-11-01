/**
 * Domain types for Séance rooms.
 *
 * The engine is a pure function over these values: no I/O, no clock, no globals.
 */

export type Severity = 'info' | 'warn' | 'risk';

export type Decision = 'ship' | 'revise' | 'block';

/** A single thing a persona looks for in the artifact. */
export interface Lens {
  /** Stable identifier, used by scoring and tests. */
  id: string;
  /** Human label shown in the UI. */
  label: string;
  /** Severity a hit with this lens carries. */
  severity: Severity;
  /** Case-insensitive substrings to look for. */
  keywords: string[];
}

/** A declarative agent. Loaded from YAML, never hard-coded in a component. */
export interface Persona {
  id: string;
  name: string;
  /** One line describing what this persona is responsible for. */
  role: string;
  /** Explicit ordering key; ties break on `id`. */
  order: number;
  /** Tone descriptor, surfaced in the UI. */
  voice: string;
  lenses: Lens[];
  /** Lines spoken depending on how many findings the turn produced. */
  phrases: {
    none: string;
    some: string;
    many: string;
  };
}

export interface Finding {
  /** Stable id: `${personaId}:${lensId}:${lineNumber}:${keyword}`. */
  id: string;
  personaId: string;
  turn: number;
  severity: Severity;
  lensId: string;
  lensLabel: string;
  /** Quoted artifact line the finding is based on (trimmed, truncated). */
  evidence: string;
  /** 1-based line number in the artifact. */
  line: number;
  /** The keyword that matched. */
  keyword: string;
}

export interface Turn {
  /** 1-based turn number. */
  index: number;
  personaId: string;
  personaName: string;
  personaRole: string;
  voice: string;
  /** What the persona says, with `{hits}` and `{artifact}` substituted. */
  narrative: string;
  findings: Finding[];
}

export interface Verdict {
  /** Integer in [0, 100]. */
  score: number;
  decision: Decision;
  headline: string;
  counts: Record<Severity, number>;
}

export interface Scoring {
  weights: Record<Severity, number>;
  /** Points that count as "fully at risk" for one persona. */
  capacityPerPersona: number;
}

export interface RoomInput {
  artifactLabel: string;
  artifact: string;
  personas: Persona[];
  seed: number;
  scoring?: Scoring;
}

export interface Transcript {
  seed: number;
  artifactLabel: string;
  turns: Turn[];
  verdict: Verdict;
}

/** Thrown when the room cannot run (empty artifact, duplicate ids, ...). */
export class ValidationError extends Error {
  public readonly field: string;

  constructor(field: string, message: string) {
    super(`${field}: ${message}`);
    this.name = 'ValidationError';
    this.field = field;
  }
}
