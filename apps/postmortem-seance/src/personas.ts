import { parse } from 'yaml';
import { parsePersona, type Persona, type Scoring } from '@seance/core';

import timelineDetective from '../personas/timeline-detective.yaml?raw';
import blastAnalyst from '../personas/blast-analyst.yaml?raw';
import processGhost from '../personas/process-ghost.yaml?raw';
import scoringSource from '../scoring.yaml?raw';

const PERSONA_SOURCES: readonly string[] = [timelineDetective, blastAnalyst, processGhost];

/** Parse and validate every persona shipped with this app. */
export function loadPersonas(): Persona[] {
  return PERSONA_SOURCES.map((source) => parsePersona(parse(source)));
}

/** Parse the app's scoring weights. */
export function loadScoring(): Scoring {
  const parsed = parse(scoringSource) as Partial<Scoring> | null;
  if (!parsed?.weights) {
    throw new Error('scoring.yaml must define weights');
  }
  return {
    weights: parsed.weights,
    capacityPerPersona: parsed.capacityPerPersona ?? 30,
  };
}
