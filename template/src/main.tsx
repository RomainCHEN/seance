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
      title="The Reading Room"
      subtitle="The Séance skeleton: one persona, one page, one artifact. Copy this folder, swap the YAML, and you have a new room."
      artifactLabel="notes.md"
      artifactHint="Everything runs in the tab. Swap personas/*.yaml and src/sample.ts to make this yours."
      personas={loadPersonas()}
      scoring={loadScoring()}
      sampleArtifact={SAMPLE_ARTIFACT}
      initialSeed={3}
      footer="Séance template — MIT licensed. Delete this footer in your own room."
    />
  </StrictMode>,
);
