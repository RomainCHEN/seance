import { orderPersonas } from './persona.js';
import { pickIndex } from './rng.js';
import { DEFAULT_SCORING, buildVerdict } from './verdict.js';
import {
  ValidationError,
  type Finding,
  type Lens,
  type Persona,
  type RoomInput,
  type Transcript,
  type Turn,
} from './types.js';

/** How many hits one lens may contribute to a turn, to keep transcripts readable. */
export const MAX_FINDINGS_PER_LENS = 2;

/** Max characters of evidence quoted from an artifact line. */
const EVIDENCE_LIMIT = 120;

interface Hit {
  line: number;
  keyword: string;
  text: string;
}

function scanLens(lines: readonly string[], lens: Lens): Hit[] {
  const hits: Hit[] = [];
  const seenLines = new Set<number>();

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? '';
    const haystack = line.toLowerCase();
    if (haystack.trim() === '') continue;

    for (const keyword of lens.keywords) {
      if (!haystack.includes(keyword.toLowerCase())) continue;
      if (seenLines.has(index + 1)) continue;
      seenLines.add(index + 1);
      hits.push({
        line: index + 1,
        keyword,
        text: line.trim().slice(0, EVIDENCE_LIMIT),
      });
      break;
    }
    if (hits.length >= MAX_FINDINGS_PER_LENS) break;
  }

  return hits;
}

function speak(persona: Persona, hitCount: number, seed: number, turnIndex: number): string {
  const source =
    hitCount === 0 ? persona.phrases.none : hitCount <= 2 ? persona.phrases.some : persona.phrases.many;

  const variants = source
    .split('|')
    .map((variant) => variant.trim())
    .filter((variant) => variant !== '');

  const chosen = variants[pickIndex(seed, variants.length, persona.id, String(turnIndex), String(hitCount))];
  return (chosen ?? source).replaceAll('{hits}', String(hitCount));
}

/**
 * Run one room. Pure: same input always yields a deeply equal transcript (R6).
 *
 * @throws ValidationError when the artifact is blank, personas are empty or ids collide.
 */
export function runRoom(input: RoomInput): Transcript {
  const artifact = input.artifact ?? '';
  if (artifact.trim() === '') {
    throw new ValidationError('artifact', 'is empty; a room needs something to review');
  }

  const personas = orderPersonas(input.personas);
  const scoring = input.scoring ?? DEFAULT_SCORING;
  const lines = artifact.split(/\r?\n/);
  const turns: Turn[] = [];

  personas.forEach((persona, personaIndex) => {
    const turnIndex = personaIndex + 1;
    const findings: Finding[] = [];

    for (const lens of persona.lenses) {
      for (const hit of scanLens(lines, lens)) {
        findings.push({
          id: `${persona.id}:${lens.id}:${hit.line}:${hit.keyword}`,
          personaId: persona.id,
          turn: turnIndex,
          severity: lens.severity,
          lensId: lens.id,
          lensLabel: lens.label,
          evidence: hit.text,
          line: hit.line,
          keyword: hit.keyword,
        });
      }
    }

    turns.push({
      index: turnIndex,
      personaId: persona.id,
      personaName: persona.name,
      personaRole: persona.role,
      voice: persona.voice,
      narrative: speak(persona, findings.length, input.seed, turnIndex),
      findings,
    });
  });

  const allFindings = turns.flatMap((turn) => turn.findings);

  return {
    seed: input.seed,
    artifactLabel: input.artifactLabel,
    turns,
    verdict: buildVerdict(allFindings, personas.length, input.artifactLabel, scoring),
  };
}

/** True when two transcripts would render identically. */
export function transcriptsEqual(a: Transcript, b: Transcript): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
