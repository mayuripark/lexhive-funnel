# Assumptions, trade-offs, and what I added

## Assumptions
- The reference funnel asks one age question; I inferred a 3-question
  qualification gate (age, work status, condition duration) since real
  SSD/Mass Tort intake needs more than one signal for a meaningful
  `qualified` flag.
- No design system was given, so I designed a distinct visual direction
  (deep green/parchment, serif headlines) rather than a generic template.
- My personal Meta ad account has an advertising restriction blocking
  Pixel creation. LexHive confirmed test Meta credentials wouldn't be
  provided and that landing the event in Meta itself isn't required —
  just the correct payload. I verified via `META_CAPI_ENDPOINT_OVERRIDE`
  pointed at a request inspector (webhook.site): same code path, same
  hashed payload, different destination. One env var swap restores the
  real Graph API endpoint.
- The n8n/Airtable pieces were built and live-tested against real
  accounts, not just documented: 10 successful executions, covering both
  the create path and the dedup/update path (repeat email → Touch Count
  increments instead of a duplicate row).
- Restricted states (placeholders) are flagged for manual review rather
  than dropped — a real business/compliance call worth a follow-up
  conversation, not something I should decide unilaterally.

## Trade-offs
- **Dedup key:** shared `event_id` (client-generated) as primary key,
  falling back to email for the Airtable search. Correct for the common
  case; wouldn't catch one person using two different emails — proper
  fuzzy phone-matching felt out of scope for 6-8 hours.
- **Resilience is 3-layered, not infinite:** client retries once + queues
  in localStorage; server tries Meta and n8n independently
  (`Promise.allSettled`) so one failing doesn't block the other; n8n logs
  every failure to an Airtable table. No dead-letter replay or chat alert
  on top — failures are *visible and recoverable* by a human, not
  self-healing.
- **No bot/spam protection** — flagged as a gap a live paid funnel would need.
- **State list is a placeholder** — production would pull this from
  Airtable/env so compliance can update it without a redeploy.

## A real bug I hit and fixed
`/api/submit-lead` failed on every call with `ERR_MODULE_NOT_FOUND` post-deploy.
Cause: `package.json` has `"type": "module"`, so Vercel runs the function as
native Node ESM, which needs explicit `.js` extensions on relative imports —
`./lib/metaCapi` compiled fine but failed at runtime; `./lib/metaCapi.js` fixed
it. Found it by adding a debug field to `/api/health` listing visible env var
*names* (ruled out a config issue), then checking Vercel's runtime logs directly.

## What I added beyond the brief
- Restricted-state flag feeding Airtable's Review Status field.
- A TCPA-style consent checkbox required to submit.
- A `/api/health` endpoint for uptime/config monitoring.
- Client-side localStorage retry queue so a lead never silently vanishes.
- Meta CAPI failure and n8n/CRM failure handled and reported separately,
  since a tracking miss and a lost lead are different severities.
