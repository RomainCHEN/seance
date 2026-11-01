import { parse } from 'yaml';
import { parsePersona, type Persona, type Scoring } from '@seance/core';

import archivist from '../personas/archivist.yaml?raw';
import scoringSource from '../scoring.yaml?raw';

const PERSONA_SOURCES: readonly string[] = [archivist];

/** Parse and validate every persona shipped with this room. */
export function loadPersonas(): Persona[] {
  return PERSONA_SOURCES.map((source) => parsePersona(parse(source)));
}

/** Parse the room's scoring weights. */
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
