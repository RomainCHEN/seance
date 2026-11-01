import type { Severity, Turn } from '@seance/core';

const SEVERITY_LABEL: Record<Severity, string> = {
  info: 'note',
  warn: 'warn',
  risk: 'risk',
};

export interface AgentCardProps {
  turn: Turn;
}

/** One persona's turn: who spoke, what they said, and the evidence they cited. */
export function AgentCard({ turn }: AgentCardProps): JSX.Element {
  return (
    <article className="sn-agent">
      <header className="sn-agent-head">
        <h3 className="sn-agent-name">{turn.personaName}</h3>
        <span className="sn-agent-voice">{turn.voice}</span>
      </header>
      <p className="sn-agent-role">{turn.personaRole}</p>
      <p className="sn-agent-line">{turn.narrative}</p>

      {turn.findings.length > 0 ? (
        <ul className="sn-findings">
          {turn.findings.map((finding) => (
            <li key={finding.id} className="sn-finding">
              <span className={`sn-sev sn-sev-${finding.severity}`}>{SEVERITY_LABEL[finding.severity]}</span>
              <div className="sn-finding-body">
                <p className="sn-finding-label">{finding.lensLabel}</p>
                <code className="sn-evidence">
                  <span className="sn-line">L{finding.line}</span> {finding.evidence}
                </code>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="sn-clear">No hits for this reviewer's lenses.</p>
      )}
    </article>
  );
}
