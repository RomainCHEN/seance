import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Persona, Scoring, Transcript } from '@seance/core';
import { MAX_SHARED_ARTIFACT, decodeRoomState, nextSeed, roomFragment, runRoom } from '@seance/core';
import { AgentCard } from './components/AgentCard.js';
import { VerdictCard } from './components/VerdictCard.js';

export interface RoomProps {
  /** Product name shown in the header. */
  title: string;
  /** One line explaining who this room is for. */
  subtitle: string;
  /** Label for the artifact under review, e.g. "checkout.ts". */
  artifactLabel: string;
  /** Hints shown under the textarea. */
  artifactHint?: string;
  personas: Persona[];
  scoring?: Scoring;
  /** Artifact the room opens with. */
  sampleArtifact: string;
  /** Pre-filled seed; users can change it to re-voice the room. */
  initialSeed?: number;
  /** Footer note, e.g. attribution. */
  footer?: string;
}

function readSharedRoom(): { artifact: string; seed: number } | null {
  if (typeof window === 'undefined') return null;
  return decodeRoomState(window.location.hash);
}

/**
 * The whole product: artifact editor, seed control, transcript and verdict.
 * Everything is computed client-side; no network calls are made.
 */
export function Room({
  title,
  subtitle,
  artifactLabel,
  artifactHint,
  personas,
  scoring,
  sampleArtifact,
  initialSeed = 7,
  footer,
}: RoomProps): JSX.Element {
  // A shared link wins over the app's own defaults, but only on first load.
  const shared = useMemo(readSharedRoom, []);
  const [draft, setDraft] = useState(shared?.artifact ?? sampleArtifact);
  const [seed, setSeed] = useState(shared?.seed ?? initialSeed);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const result = useMemo((): { transcript: Transcript } | { error: string } => {
    try {
      const transcript = runRoom({
        artifactLabel,
        artifact: draft,
        personas,
        seed,
        ...(scoring ? { scoring } : {}),
      });
      return { transcript };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'The room could not run.' };
    }
  }, [draft, seed, personas, artifactLabel, scoring]);

  const transcript = 'transcript' in result ? result.transcript : null;
  const error = 'error' in result ? result.error : null;
  const lineCount = draft.trim() === '' ? 0 : draft.split(/\r?\n/).length;

  // Keep the address bar shareable, debounced so typing does not thrash history.
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.history?.replaceState !== 'function') return;
    const timer = setTimeout(() => {
      window.history.replaceState(null, '', roomFragment({ artifact: draft, seed }));
    }, 400);
    return () => clearTimeout(timer);
  }, [draft, seed]);

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);

  const copyRoomLink = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}${window.location.pathname}${roomFragment({ artifact: draft, seed })}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt('Copy this room link', url);
    }
  }, [draft, seed]);

  return (
    <main className="sn-shell">
      <header className="sn-header">
        <p className="sn-eyebrow">Séance room</p>
        <h1 className="sn-title">{title}</h1>
        <p className="sn-subtitle">{subtitle}</p>
        <p className="sn-badge" title="No model calls: the same input always yields the same transcript.">
          Offline deterministic script engine · seed {seed}
        </p>
      </header>

      <section className="sn-editor" aria-labelledby="sn-artifact-label">
        <div className="sn-editor-head">
          <h2 id="sn-artifact-label" className="sn-editor-title">
            Artifact · {artifactLabel}
          </h2>
          <span className="sn-muted">{lineCount} lines</span>
        </div>

        <label className="sn-sr-only" htmlFor="sn-artifact">
          Paste the artifact to review
        </label>
        <textarea
          id="sn-artifact"
          className="sn-textarea"
          value={draft}
          spellCheck={false}
          onChange={(event) => setDraft(event.target.value)}
          rows={10}
        />
        {artifactHint ? <p className="sn-hint">{artifactHint}</p> : null}
        {draft.length > MAX_SHARED_ARTIFACT ? (
          <p className="sn-hint sn-hint-warn">
            This artifact is longer than {MAX_SHARED_ARTIFACT.toLocaleString()} characters — a room
            link will carry only the first {MAX_SHARED_ARTIFACT.toLocaleString()}.
          </p>
        ) : null}

        <div className="sn-controls">
          <label className="sn-seed">
            <span>Seed</span>
            <input
              type="number"
              min={0}
              max={999999}
              value={seed}
              onChange={(event) => {
                const parsed = Number.parseInt(event.target.value, 10);
                if (Number.isFinite(parsed)) setSeed(Math.max(0, Math.min(999_999, parsed)));
              }}
            />
          </label>
          <button
            type="button"
            className="sn-button"
            onClick={() => setSeed((current) => nextSeed(current))}
          >
            Re-run with a new seed
          </button>
          <button type="button" className="sn-button sn-button-ghost" onClick={() => setDraft(sampleArtifact)}>
            Reset artifact
          </button>
          <button type="button" className="sn-button sn-button-ghost" onClick={() => void copyRoomLink()}>
            {copied ? 'Link copied' : 'Copy room link'}
          </button>
        </div>
      </section>

      {error ? (
        <p className="sn-error" role="alert">
          {error}
        </p>
      ) : null}

      {transcript ? (
        <>
          <section className="sn-transcript" aria-label="Transcript">
            <h2 className="sn-section-title">The room speaks</h2>
            <ol className="sn-turns">
              {transcript.turns.map((turn) => (
                <li key={turn.index}>
                  <AgentCard turn={turn} />
                </li>
              ))}
            </ol>
          </section>

          <VerdictCard transcript={transcript} />
        </>
      ) : null}

      {footer ? <footer className="sn-footer">{footer}</footer> : null}
    </main>
  );
}
