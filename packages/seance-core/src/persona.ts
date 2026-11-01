import { ValidationError, type Persona, type Lens, type Severity } from './types.js';

const SEVERITIES: readonly Severity[] = ['info', 'warn', 'risk'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireString(source: Record<string, unknown>, field: string, where: string): string {
  const value = source[field];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ValidationError(`${where}.${field}`, 'expected a non-empty string');
  }
  return value;
}

/**
 * A phrase entry must contain at least one non-empty variant after splitting on "|".
 * Otherwise `speak()` would silently fall back to a raw, unreplaced string.
 */
function requirePhrases(source: Record<string, unknown>, field: string, where: string): string {
  const value = requireString(source, field, where);
  const variants = value
    .split('|')
    .map((variant) => variant.trim())
    .filter((variant) => variant !== '');
  if (variants.length === 0) {
    throw new ValidationError(`${where}.${field}`, 'needs at least one non-empty variant');
  }
  return value;
}

function parseLens(raw: unknown, index: number, personaId: string): Lens {
  const where = `persona(${personaId}).lenses[${index}]`;
  if (!isRecord(raw)) throw new ValidationError(where, 'expected an object');

  const severity = raw['severity'];
  if (typeof severity !== 'string' || !SEVERITIES.includes(severity as Severity)) {
    throw new ValidationError(`${where}.severity`, `expected one of ${SEVERITIES.join(' | ')}`);
  }

  const keywords = raw['keywords'];
  if (!Array.isArray(keywords) || keywords.length === 0) {
    throw new ValidationError(`${where}.keywords`, 'expected a non-empty array of strings');
  }
  const parsedKeywords = keywords.map((keyword, keywordIndex) => {
    if (typeof keyword !== 'string' || keyword.trim() === '') {
      throw new ValidationError(`${where}.keywords[${keywordIndex}]`, 'expected a non-empty string');
    }
    return keyword;
  });

  return {
    id: requireString(raw, 'id', where),
    label: requireString(raw, 'label', where),
    severity: severity as Severity,
    keywords: parsedKeywords,
  };
}

/**
 * Validate one persona definition and return a frozen copy.
 * Throws a ValidationError naming the first invalid field.
 */
export function parsePersona(raw: unknown): Persona {
  if (!isRecord(raw)) throw new ValidationError('persona', 'expected an object');

  const id = requireString(raw, 'id', 'persona');
  const order = raw['order'];
  if (typeof order !== 'number' || !Number.isFinite(order)) {
    throw new ValidationError('persona.order', 'expected a finite number');
  }

  const lenses = raw['lenses'];
  if (!Array.isArray(lenses) || lenses.length === 0) {
    throw new ValidationError('persona.lenses', 'expected a non-empty array');
  }

  const phrases = raw['phrases'];
  if (!isRecord(phrases)) throw new ValidationError('persona.phrases', 'expected an object');

  const persona: Persona = {
    id,
    name: requireString(raw, 'name', 'persona'),
    role: requireString(raw, 'role', 'persona'),
    order,
    voice: requireString(raw, 'voice', 'persona'),
    lenses: lenses.map((lens, index) => parseLens(lens, index, id)),
    phrases: {
      none: requirePhrases(phrases, 'none', 'persona.phrases'),
      some: requirePhrases(phrases, 'some', 'persona.phrases'),
      many: requirePhrases(phrases, 'many', 'persona.phrases'),
    },
  };

  return Object.freeze({
    ...persona,
    lenses: Object.freeze(persona.lenses) as Lens[],
  }) as Persona;
}

/**
 * Validate a set of personas, reject duplicates and return them in turn order.
 * The input array is never mutated (R3, P6).
 */
export function orderPersonas(personas: readonly Persona[]): Persona[] {
  if (personas.length === 0) {
    throw new ValidationError('personas', 'a room needs at least one persona');
  }

  const seen = new Set<string>();
  for (const persona of personas) {
    if (seen.has(persona.id)) {
      throw new ValidationError('personas', `duplicate persona id "${persona.id}"`);
    }
    seen.add(persona.id);
  }

  return [...personas].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
}
