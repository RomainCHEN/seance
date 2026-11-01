import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Room } from '@seance/ui';
import '@seance/ui/styles.css';

import { loadPersonas, loadScoring } from './personas.js';
import { SAMPLE_ARTIFACT } from './sample.js';

const container = document.getElementById('root');
if (!container) throw new Error('Missing #root container');

createRoot(container).render(
  <StrictMode>
    <Room
      title="Postmortem Séance"
      subtitle="Paste an incident timeline. A detective reconstructs the minutes, an analyst counts who paid, a process ghost finds the shortcut that made it possible — and the room returns one root-cause verdict."
      artifactLabel="incident.md"
      artifactHint="Runs entirely in this tab: no model calls, no API key, no upload. Same timeline + same seed always produce the same transcript."
      personas={loadPersonas()}
      scoring={loadScoring()}
      sampleArtifact={SAMPLE_ARTIFACT}
      initialSeed={13}
      footer="Built with Séance, the deterministic multi-agent room template. MIT licensed."
    />
  </StrictMode>,
);
