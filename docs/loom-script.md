# Loom script (aim for ~4 minutes, cap is 5)

Record your screen going through this order. You don't need to read it
verbatim — use it as a beat sheet so you don't ramble or forget a piece.

**0:00 – 0:30 | Live funnel**
Open the deployed funnel. Say what it is in one sentence, click through
the 5 steps quickly (age -> work status -> duration -> state -> contact),
submit a test lead.

**0:30 – 1:15 | What just happened (Network tab)**
Open DevTools Network tab, show the `submit-lead` request/response. Point
out the `eventId` in the payload — explain in one sentence that this same
ID goes to both the Meta Pixel (client) and Meta CAPI (server) so Meta
dedupes them into one counted conversion instead of two.

**1:15 – 2:00 | The Meta payload (webhook.site)**
LexHive confirmed test Meta credentials wouldn't be provided and that
showing the event land in Meta isn't required — just the correct
payload shape. So: show the webhook.site bin receiving the POST from
`/api/submit-lead`, and point out the hashed `em`/`ph` fields, the
shared `event_id` (same one the client pixel would use), and `fbp`/`fbc`
in the payload. Mention in one sentence that swapping to a real pixel
is a one-line env var change (`META_CAPI_ENDPOINT_OVERRIDE` removed,
real `META_PIXEL_ID`/`META_CAPI_ACCESS_TOKEN` added).

**2:00 – 3:00 | n8n workflow**
Open n8n, show the `Lead Intake` workflow, walk through: Webhook -> Validate
& Normalize -> Search Existing Lead (dedup) -> Create/Update -> Respond.
Trigger an execution (or show a past one) so the data is visible flowing
through each node.

**3:00 – 3:30 | Airtable**
Show the new row in the `Leads` table with all fields populated
correctly, plus the `Automation Logs` table (even if empty, explain what
it's for).

**3:30 – 4:15 | Deliberately break something**
This is the part that actually demonstrates "resilience," not just
claims it. Two good options:
  - Temporarily rename an Airtable field so the "Create Lead" node
    errors, submit a lead, then show the Slack alert + the
    Automation Logs row that got created automatically. Undo the rename after.
  - Or: kill your n8n webhook URL in Vercel's env vars temporarily,
    submit a lead, show the 502 in the Network tab, then show it land in
    the browser's localStorage retry queue (Application tab -> Local Storage).

**4:15 – 4:45 | One key decision**
Pick ONE trade-off from `assumptions-and-tradeoffs.md` and explain it out
loud in your own words — e.g. why age is a hard disqualify but the other
two questions are soft. Shows judgment, not just execution.

**4:45 – 5:00 | Close**
One sentence: what you'd build next if you had another day (e.g. the
dead-letter replay, or bot protection).
