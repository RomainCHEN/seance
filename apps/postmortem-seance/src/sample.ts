/** A real-shaped incident timeline, with the gaps left in on purpose. */
export const SAMPLE_ARTIFACT = `2026-10-31 02:14 PT — pager: checkout error rate 4.2% (baseline 0.1%)
02:16 — on-call acknowledged. No dashboard for payment saturation; presumed latency.
02:21 — pod-7b9 OOMKilled and restarted. Root cause unknown.
02:29 — revenue impact estimated at $18k/min; users in EU report duplicate charges.
02:34 — rolled back deploy 4f21c, error rate falls to 0.6%.
02:41 — found that deploy 4f21c bundled the migration with the feature flag flip.
02:41 — No test covered the rollback path.
02:52 — data integrity check: 240 duplicate charges, stale reads for 9 minutes.
03:02 — incident resolved. Follow-up actions TBD. Someone should own the dashboard.
`;
