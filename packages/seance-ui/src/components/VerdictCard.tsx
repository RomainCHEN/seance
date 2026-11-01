import type { Transcript } from '@seance/core';

const DECISION_COPY = {
  ship: { label: 'Ship it', note: 'Nothing here outranks a note.' },
  revise: { label: 'Revise', note: 'One more pass before this leaves the crypt.' },
  block: { label: 'Blocked', note: 'The room will not sign off on this.' },
} as const;

export interface VerdictCardProps {
  transcript: Transcript;
}

/** Aggregated decision for the whole room. */
export function VerdictCard({ transcript }: VerdictCardProps): JSX.Element {
  const { verdict } = transcript;
  const copy = DECISION_COPY[verdict.decision];

  return (
    <section
      className={`sn-verdict sn-verdict-${verdict.decision}`}
      aria-live="polite"
      aria-label={`Verdict: ${copy.label}, risk score ${verdict.score} out of 100`}
    >
      <div className="sn-verdict-score">
        <span className="sn-score">{verdict.score}</span>
        <span className="sn-score-unit">/100 risk</span>
      </div>

      <div className="sn-verdict-body">
        <p className="sn-verdict-decision">{copy.label}</p>
        <p className="sn-verdict-headline">{verdict.headline}</p>
        <p className="sn-verdict-note">{copy.note}</p>

        <ul className="sn-counts" aria-label="Finding counts">
          <li>
            <strong>{verdict.counts.risk}</strong> risk
          </li>
          <li>
            <strong>{verdict.counts.warn}</strong> warn
          </li>
          <li>
            <strong>{verdict.counts.info}</strong> note
          </li>
        </ul>
      </div>

      <div className="sn-meter" aria-hidden="true">
        <span className="sn-meter-fill" style={{ width: `${verdict.score}%` }} />
      </div>
    </section>
  );
}
