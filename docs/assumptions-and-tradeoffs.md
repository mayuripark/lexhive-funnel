# Assumptions, trade-offs, and what I added

## How I used AI
I used Claude as my build partner throughout — conversationally, not a
single code dump — reviewing and testing at each stage rather than
shipping generated output blind. It scaffolded the React funnel, the
Vercel API (Meta CAPI hashing/dedup), and the n8n workflows (built
directly against my real n8n/Airtable accounts via their APIs). I drove
account setup, credentials, and testing myself.

What made this efficient, not just fast: every node config and build
was validated before deployment, catching schema errors before they
became runtime failures. When something did break in production, I
didn't guess — I added a debug field to `/api/health` listing which
environment variable names the function could see (ruled out a config
mismatch in one check), then went straight to Vercel's runtime logs,
which named the exact error: `/api/submit-lead` threw
`ERR_MODULE_NOT_FOUND` because `package.json`'s `"type": "module"`
requires explicit `.js` extensions on relative imports at runtime, even
though TypeScript compiles fine without them. Same principle with Meta:
rather than fake a pixel I didn't have access to, I verified the real
payload against a request inspector — faster and more honest than
waiting on credentials I couldn't get in time.

## Where I focused effort (tracking quality, reliability, judgment)
- **Event quality:** the client-side Meta Pixel and the server-side
  Conversions API call share one `event_id`, generated per submission —
  Meta uses this to collapse both signals into a single counted
  conversion instead of double-counting. Match quality comes from
  hashed `em`/`ph`/`fn`/`ln`/`st`, plus `fbp`/`fbc`, `client_ip_address`,
  and `client_user_agent` sent alongside.
- **Lead-flow reliability:** the client retries once, then queues in
  localStorage on failure; the server calls Meta and n8n independently
  via `Promise.allSettled` so a tracking failure never blocks lead
  delivery or vice versa; n8n's workflow-level error handler logs every
  failure to an Airtable table instead of dropping it. The dedup layer
  in n8n searches Airtable by `event_id` or email before writing, so a
  retried or repeat submission updates the existing record (incrementing
  a Touch Count) instead of creating a duplicate.
- **Practical judgment:** age is a hard disqualifier (no PII collected
  at all); the other two qualifying questions are soft — lead still
  captured, just flagged — since I'd rather the business see a
  borderline case than lose it.

## Assumptions & trade-offs
- Used a 3-question qualification gate (vs. the reference's one) since
  real intake needs more than one signal for a meaningful `qualified` flag.
- No design system was given, so I chose a distinct visual direction.
- Restricted states are flagged for manual review, not dropped — a
  compliance call worth a follow-up conversation, not mine to decide.
- No bot/spam protection or dead-letter replay — flagged as gaps a live
  funnel would need, not silently omitted.
- State list is a placeholder; production would pull it from
  Airtable/env so compliance can update it without a redeploy.

## What I added beyond the brief
- Restricted-state flag feeding Airtable's Review Status field.
- A TCPA-style consent checkbox required to submit.
- A `/api/health` endpoint for config/uptime monitoring.
- Meta and n8n failures handled and reported separately.
- Live end-to-end verification: 10 successful n8n executions covering
  both the create and dedup/update paths.
