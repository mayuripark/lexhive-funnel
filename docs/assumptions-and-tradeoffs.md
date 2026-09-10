# Assumptions, trade-offs, and what I added

## How I used AI
I used Claude as my build partner throughout — conversationally, not as
a single code dump — reviewing and testing at each stage rather than
shipping generated output blind. It scaffolded the React funnel, the
Vercel API (Meta CAPI hashing/dedup), and the n8n workflows (built
directly against my real n8n/Airtable accounts via their APIs, not
handed to me as files to import). I drove account setup, credential
attachment, and testing myself, and worked through real issues as they
came up — a Meta access restriction (resolved by verifying against
webhook.site instead, per LexHive's own confirmation that live
verification wasn't required), and a genuine bug: `/api/submit-lead`
threw `ERR_MODULE_NOT_FOUND` because my `package.json`'s `"type":
"module"` requires explicit `.js` extensions on relative imports at
runtime, even though TypeScript compiles fine without them. I diagnosed
this from Vercel's runtime logs, not by guessing.

## Where I focused effort (tracking quality, reliability, judgment)
- **Event quality:** shared `event_id` between the client Pixel and
  server-side CAPI call for correct dedup; hashed PII, `fbp`/`fbc`, and
  event_time for match quality — the exact things the brief said matter
  most.
- **Lead-flow reliability:** client retries once and queues in
  localStorage on failure; server calls Meta and n8n independently so
  one failing never blocks the other; n8n logs every failure to an
  Airtable table instead of dropping it silently. I proved this against
  a real failure that happened while building, not a staged one.
- **Practical judgment over rigid correctness:** age is a hard
  disqualifier (no PII collected at all), but the other two qualifying
  questions are soft — the lead is still captured, just flagged, because
  I'd rather the business see a borderline case than lose it.

## Assumptions
- The reference funnel asks one age question; I used a 3-question
  qualification gate since real SSD/Mass Tort intake needs more than one
  signal for a meaningful `qualified` flag.
- No design system was given, so I chose a distinct visual direction
  over a generic template.
- Restricted states (placeholders) are flagged for manual review, not
  dropped — a compliance call worth a follow-up conversation, not mine
  to decide unilaterally.

## Trade-offs
- **Dedup key:** shared `event_id`, falling back to email for the
  Airtable search. Correct for the common case; wouldn't catch one
  person using two emails — fuzzy phone-matching felt out of scope for
  6-8 hours.
- **No bot/spam protection** — flagged as a gap a live funnel would need.
- **State list is a placeholder** — production would pull it from
  Airtable/env so compliance can update it without a redeploy.

## What I added beyond the brief
- Restricted-state flag feeding Airtable's Review Status field.
- A TCPA-style consent checkbox required to submit.
- A `/api/health` endpoint for config/uptime monitoring.
- Client-side localStorage retry queue so a lead never silently vanishes.
- Meta and n8n failures handled and reported separately, since a
  tracking miss and a lost lead are different severities.
- Live end-to-end verification: 10 successful n8n executions covering
  both the create path and the dedup/update path (repeat email → Touch
  Count increments instead of a duplicate row).
