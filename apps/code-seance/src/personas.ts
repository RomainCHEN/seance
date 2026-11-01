import { parse } from 'yaml';
import { parsePersona, type Persona, type Scoring } from '@seance/core';

import securitySpecter from '../personas/security-specter.yaml?raw';
import perfPoltergeist from '../personas/perf-poltergeist.yaml?raw';
import styleWraith from '../personas/style-wraith.yaml?raw';
import scoringSource from '../scoring.yaml?raw';

const PERSONA_SOURCES: readonly string[] = [securitySpecter, perfPoltergeist, styleWraith];

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
