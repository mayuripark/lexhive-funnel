# LexHive Take-Home — Lead Qualification Funnel

A 5-step React qualification funnel (age -> work status -> condition
duration -> state -> contact) that captures a lead, fires a matched/deduped
Meta conversion event, and routes the lead through n8n into Airtable —
with failures logged and alerted rather than silently dropped.

## Stack
- **Frontend:** React + TypeScript + Vite, deployed on Vercel
- **Backend:** Vercel serverless functions (`/api/submit-lead`, `/api/health`)
- **Tracking:** Meta Pixel (client) + Meta Conversions API (server), deduped by a shared `event_id`
- **Automation:** n8n (webhook -> validate -> dedup -> Airtable)
- **Database:** Airtable (`Leads`, `Automation Logs`)

## Local development
```bash
npm install
cp .env.example .env.local   # fill in real values, see below
npm run dev
```
The frontend runs against `/api/*` via Vercel's dev server if you use
`vercel dev` instead of `vite dev` — plain `vite dev` will serve the
frontend but the API routes need `vercel dev` (or a deployed preview) to
actually execute.

## Deploying
1. Push this repo to GitHub.
2. Import it into Vercel (framework preset: Vite).
3. Add the environment variables from `.env.example` in Vercel's project
   settings (Production + Preview).
4. Deploy. Vercel automatically builds `src/` as the static site and
   `api/*.ts` as serverless functions.

## Setting up the pieces this repo depends on

**Meta:**
1. Create/locate your Pixel ID in Meta Events Manager.
2. Generate a Conversions API access token (Events Manager -> Settings ->
   Conversions API -> Generate access token).
3. Set `VITE_META_PIXEL_ID`, `META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN`.
4. While testing, set `META_TEST_EVENT_CODE` so events show up in the
   Events Manager "Test Events" tab without polluting real reporting —
   remove it before going live.

**No Meta access available?** Set `META_CAPI_ENDPOINT_OVERRIDE` to a
request-inspector URL (e.g. create a bin at https://webhook.site and copy
its unique URL) instead of steps 1-3. `sendMetaLeadEvent` will send the
exact same hashed payload — the shared `event_id`, hashed email/phone/name,
`fbp`/`fbc`, event_time, everything — to that URL instead of Meta's Graph
API. This proves the integration's logic and payload shape end-to-end
without needing a real pixel, and it's a one-line env var to swap back to
the real endpoint once you have access (just unset the override).

**n8n:**
Both workflows were built directly against a real n8n instance via
n8n's API (not hand-assembled JSON), with real Airtable table IDs
wired in, and live-tested end-to-end — 10 successful executions
covering both the create path and the dedup/update path. See
`n8n/lead-intake-workflow.json` and
`n8n/error-handler-workflow.json` for the exact exported configuration,
including the working Airtable credential reference. To reuse these
yourself:
1. Import both files (Workflows -> Import from File).
2. Attach your own Airtable credential to each Airtable node (the
   exported JSON references a credential ID that's specific to my
   instance and won't resolve on yours).
3. Activate both workflows, then copy the production webhook URL from
   the "Webhook: Lead Intake" node into `N8N_LEAD_WEBHOOK_URL`.
4. Set `N8N_WEBHOOK_SECRET` to match the value baked into the
   "Check Webhook Secret" node.

**Airtable:**
- See `docs/airtable-schema.md` for the two tables and exact fields.
- Live base: linked in my submission email.

## Project structure
```
src/                  React funnel (steps, state machine, styling)
api/submit-lead.ts    Validates lead, fires Meta CAPI, forwards to n8n
api/lib/metaCapi.ts   PII hashing + Meta Graph API call
api/health.ts         Cheap config-check endpoint for uptime monitoring
n8n/                  Importable workflow JSON (intake + error handler)
docs/                 Airtable schema, assumptions/trade-offs, Loom script
```

## Design decisions worth knowing about
See `docs/assumptions-and-tradeoffs.md` for the full list — the short
version: qualification is 3 gated yes/no questions (age is a hard stop
before any PII is collected; the other two are soft — the lead is still
captured but flagged `qualified: false` for prioritization), restricted
states are flagged for manual review rather than dropped, and every
external call (Meta, n8n) is isolated with `Promise.allSettled` so one
failing doesn't take the other down with it.
