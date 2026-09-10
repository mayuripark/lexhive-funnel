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
- **Event quality:** shared `event_id` between Pixel and CAPI for
  correct dedup; hashed PII, `fbp`/`fbc`, event_time for match quality.
- **Lead-flow reliability:** client retries + queues on failure; Meta
  and n8n calls run independently so one failing never blocks the
  other; n8n logs every failure to Airtable instead of dropping it. I
  proved this against a real failure that happened while building, not
  a staged one.
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
- Dedup falls back to email if `event_id` differs across sessions;
  wouldn't catch one person using two emails — fuzzy phone-matching
  felt out of scope for 6-8 hours.
- No bot/spam protection or dead-letter replay — flagged as gaps a live
  funnel would need, not silently omitted.
- State list is a placeholder; production would pull it from
  Airtable/env so compliance can update it without a redeploy.

## What I added beyond the brief
- Restricted-state flag feeding Airtable's Review Status field.
- A TCPA-style consent checkbox required to submit.
- A `/api/health` endpoint for config/uptime monitoring.
- Client-side localStorage retry queue so a lead never silently vanishes.
- Meta and n8n failures handled and reported separately.
- Live end-to-end verification: 10 successful n8n executions covering
  both the create path and the dedup/update path (repeat email → Touch
  Count increments instead of a duplicate row).
