# How I used AI on this assignment

I used Claude (Anthropic) as my primary build partner throughout,
working conversationally rather than accepting one large code dump —
reviewing, testing, and debugging at each stage rather than blindly
shipping generated output.

## What Claude built
- The React/TypeScript funnel (5-step qualification flow, styling,
  state machine, retry/queue logic on submission failure).
- The Vercel serverless API: lead validation, Meta Conversions API
  integration (PII hashing, event dedup via shared `event_id`), and
  the n8n handoff.
- The n8n automation (webhook → validate → dedup search → Airtable
  create/update → error handling), built directly against my real n8n
  and Airtable accounts via their APIs — not just handed to me as a
  file to import.
- The Airtable base schema, generated from a prompt I pasted into
  Airtable's own AI builder.
- The supporting docs: this file, `assumptions-and-tradeoffs.md`,
  `airtable-schema.md`, and the Loom recording script.

## Steps, roughly in order
1. Reviewed the take-home brief and the job description together to
   understand what "good" looked like for this specific role.
2. Had Claude scaffold the Vite + React + TypeScript project, then
   build the funnel steps, styling, and client-side logic.
3. Built the Vercel API layer (`/api/submit-lead`, `/api/health`) and
   the Meta CAPI hashing/dedup logic.
4. Hit a real blocker: my personal Meta ad account has an advertising
   restriction, so I couldn't get a live Pixel. I asked LexHive
   directly whether they could provide test credentials — they
   confirmed they couldn't, and that proving the payload shape was
   enough. Claude added a `META_CAPI_ENDPOINT_OVERRIDE` so I could
   verify the exact same code path against webhook.site instead.
5. Pushed the code to GitHub and deployed to Vercel — this is where
   most of the real debugging happened: a GitHub push that only
   included a placeholder README, environment variables not reaching
   the deployed function, and eventually a genuine bug
   (`ERR_MODULE_NOT_FOUND`, caused by my `package.json`'s `"type":
   "module"` requiring explicit `.js` extensions on relative imports
   in the compiled function). Claude walked me through diagnosing each
   one from screenshots and logs rather than guessing.
6. Set up Airtable (base + two tables) and connected an n8n MCP tool
   in this chat, which let Claude create both workflows directly
   through n8n's API using real table IDs — I only had to attach my
   own Airtable credential and click Publish, since credential
   attachment requires manual confirmation in n8n's UI.
7. Tested end-to-end: submitted real leads through the live funnel,
   confirmed the Meta payload in webhook.site, confirmed successful
   n8n executions, and confirmed both the create and dedup/update paths
   in Airtable (10/10 successful executions).
8. Had Claude draft a Loom recording script and tighten the required
   assumptions/trade-offs note to fit the 1-page limit.

## What I made sure I understood before submitting
I can explain: the Meta event-matching and dedup logic (hashed
identifiers + shared `event_id`), why the n8n search-then-branch
pattern needs `alwaysOutputData` to handle the "no existing record"
case, why age is a hard disqualify but the other two qualifying
questions are soft, and the root cause of the ESM import bug. Anywhere
I wasn't fully driving the implementation, I made sure I could still
account for *why* it works before treating it as done.
