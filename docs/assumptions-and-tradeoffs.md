# Assumptions, trade-offs, and what I added

## How I used AI
I used Claude as my build partner throughout — conversationally, not as
a single code dump — reviewing and testing at each stage. It scaffolded
the React funnel, the Vercel API (Meta CAPI hashing/dedup), and the n8n
workflows (built directly against my real n8n/Airtable accounts via
their APIs, not just handed to me as files to import). I drove account
setup, credential attachment, and testing myself, and debugged real
issues alongside it — a Meta access restriction (resolved by testing
against webhook.site instead, per LexHive's confirmation that live
verification wasn't required), and a genuine bug: `/api/submit-lead`
threw `ERR_MODULE_NOT_FOUND` because my `package.json`'s `"type":
"module"` requires explicit `.js` extensions on relative imports at
runtime, even though TypeScript compiles fine without them.

## Assumptions
- The reference funnel asks one age question; I used a 3-question
  qualification gate (age, work status, condition duration) since real
  SSD/Mass Tort intake needs more than one signal for a meaningful
  `qualified` flag.
- No design system was given, so I chose a distinct visual direction
  (deep green/parchment, serif headlines) over a generic template.
- Restricted states (placeholders) are flagged for manual review rather
  than dropped — a compliance call worth a follow-up conversation, not
  mine to decide unilaterally.

## Trade-offs
- **Dedup key:** shared `event_id` as primary key, falling back to email
  for the Airtable search. Correct for the common case; wouldn't catch
  one person using two emails — fuzzy phone-matching felt out of scope.
- **Resilience is layered, not infinite:** client retries once + queues
  in localStorage; server tries Meta and n8n independently
  (`Promise.allSettled`); n8n logs every failure to Airtable. No
  dead-letter replay or chat alert — failures are visible and
  human-recoverable, not self-healing.
- **No bot/spam protection** — flagged as a gap a live funnel would need.
- **State list is a placeholder** — production would pull it from
  Airtable/env so compliance can update it without a redeploy.

## What I added beyond the brief
- Restricted-state flag feeding Airtable's Review Status field.
- A TCPA-style consent checkbox required to submit.
- A `/api/health` endpoint for config/uptime monitoring.
- Client-side localStorage retry queue so a lead never silently vanishes.
- Meta CAPI failure and n8n/CRM failure handled and reported separately,
  since a tracking miss and a lost lead are different severities.
- Live end-to-end verification, not just a working build: 10 successful
  n8n executions covering both the create path and the dedup/update path
  (repeat email → Touch Count increments instead of a duplicate row).
