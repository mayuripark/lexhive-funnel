# Assumptions, trade-offs, and what I added

## Assumptions
- The reference funnel only asks one age question; I inferred a realistic
  3-question qualification gate (age, work status, condition duration)
  since a real SSD/Mass Tort intake funnel needs more than one signal to
  produce a meaningfully different `qualified` flag for lead scoring.
- No design system or brand guide was given, so I designed a distinct
  visual direction (deep green/parchment, serif headlines) rather than a
  generic template look.
- My personal Meta ad account has an advertising access restriction that
  blocks creating a Pixel, so I couldn't test the CAPI integration against
  a real pixel. I asked LexHive for test access; if that didn't come
  through in time, I verified the integration by pointing
  `META_CAPI_ENDPOINT_OVERRIDE` at a request inspector (webhook.site)
  instead — same code path, same hashed payload, different destination.
  The Loom shows this and explains why.
- No live n8n/Airtable accounts were available to me while building,
  so the automation layer is delivered as an importable, documented
  workflow rather than a live-tested one. I've flagged this explicitly
  rather than claiming it's been round-tripped.
- Restricted states (CA, NY as placeholders) are flagged for manual
  review rather than silently dropped — assumed the business would rather
  a human glance at a restricted-state lead than lose it outright, but
  this is a real trade-off worth a two-minute conversation with legal/compliance.

## Trade-offs
- **Dedup key:** I used the shared `event_id` (generated client-side) as
  the primary dedup key across Meta, Airtable, and the retry queue,
  falling back to email for the Airtable search. This is simple and
  correct for the common case but wouldn't catch a lead who submits twice
  with two different emails — solving that properly needs phone-based
  fuzzy matching, which felt out of scope for 6-8 hours.
- **Resilience is 3-layered, not infinite:** client retries once + queues
  in localStorage; the server tries Meta and n8n independently via
  `Promise.allSettled` so one failing doesn't block the other; n8n itself
  has a workflow-level error handler that logs to Airtable and pings
  Slack. I did not build a dead-letter queue or automatic replay — a
  failed lead is *visible and recoverable* by a human, not
  self-healing. For a first version that felt like the right stopping point.
- **No bot/spam protection** (honeypot field, rate limiting) — flagged as
  a gap rather than silently omitted, since a live paid funnel would need it.
- **State list is a placeholder.** In production this would live in
  Airtable (or an env var) so compliance can update it without a redeploy.

## What I added beyond the brief
- A restricted-state routing flag feeding into Airtable's Review Status field.
- A TCPA-style consent checkbox on the contact step (required to submit).
- A `/api/health` endpoint for uptime monitoring of the config, not just the server.
- Client-side localStorage retry queue so a lead never silently vanishes
  on a bad connection at the worst possible moment — the moment they convert.
- Separated Meta CAPI failure from n8n/CRM failure in the response, since
  a tracking miss and a lost lead are different severities and should be
  handled (and alerted) differently.
