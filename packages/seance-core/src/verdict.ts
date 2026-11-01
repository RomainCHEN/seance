import type { Decision, Finding, Severity, Scoring, Verdict } from './types.js';

/** Weights used when an app does not ship its own scoring.yaml. */
export const DEFAULT_SCORING: Scoring = {
  weights: { risk: 10, warn: 4, info: 1 },
  capacityPerPersona: 30,
};

/** Clamp a number into an inclusive range. */
export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/**
 * Aggregate finding severities into an integer risk score in [0, 100].
 *
 * `capacity` is the score that counts as "every persona is fully at risk", so a
 * transcript with one risky finding among many clean turns stays low.
 */
export function scoreFindings(
  findings: readonly Finding[],
  personaCount: number,
  scoring: Scoring = DEFAULT_SCORING,
): number {
  const raw = findings.reduce((total, finding) => total + scoring.weights[finding.severity], 0);
  const capacity = Math.max(1, personaCount) * Math.max(1, scoring.capacityPerPersona);
  return Math.round(clamp((raw / capacity) * 100, 0, 100));
}

/** Map a score to a decision using the published thresholds (R8). */
export function decide(score: number): Decision {
  if (score < 30) return 'ship';
  if (score < 70) return 'revise';
  return 'block';
}

function countSeverities(findings: readonly Finding[]): Record<Severity, number> {
  const counts: Record<Severity, number> = { info: 0, warn: 0, risk: 0 };
  for (const finding of findings) counts[finding.severity] += 1;
  return counts;
}

function headline(
  decision: Decision,
  counts: Record<Severity, number>,
  artifactLabel: string,
): string {
  if (decision === 'ship') {
    return `The room finds ${artifactLabel} fit to ship.`;
  }
  if (decision === 'revise') {
    return `${counts.risk + counts.warn} issue(s) need another pass before ${artifactLabel} ships.`;
  }
  return `The room blocks ${artifactLabel}: ${counts.risk} hard risk(s) on the table.`;
}

/** Build the final verdict for a transcript. */
export function buildVerdict(
  findings: readonly Finding[],
  personaCount: number,
  artifactLabel: string,
  scoring: Scoring = DEFAULT_SCORING,
): Verdict {
  const score = scoreFindings(findings, personaCount, scoring);
  const decision = decide(score);
  const counts = countSeverities(findings);
  return { score, decision, headline: headline(decision, counts, artifactLabel), counts };
}
