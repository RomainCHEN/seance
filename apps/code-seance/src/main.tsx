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
      title="Code Séance"
      subtitle="Paste a diff. Three reviewers read it in turn — the specter checks what lets a stranger in, the poltergeist counts wasted milliseconds, the wraith judges what the next reader will inherit — and the room returns one merge verdict."
      artifactLabel="snippet.ts"
      artifactHint="Runs entirely in this tab: no model calls, no API key, no upload. Same artifact + same seed always produce the same transcript."
      personas={loadPersonas()}
      scoring={loadScoring()}
      sampleArtifact={SAMPLE_ARTIFACT}
      initialSeed={7}
      footer="Built with Séance, the deterministic multi-agent room template. MIT licensed."
    />
  </StrictMode>,
);
