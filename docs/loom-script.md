# Loom script (aim for ~4-5 minutes)

Record your screen going through this order. Use it as a beat sheet, not
a word-for-word script — talk naturally.

**Setup before you hit record:**
- Have these tabs ready: your live funnel, browser DevTools (Network tab
  open), webhook.site inbox, your n8n workflow, your Airtable base.
- Loom: go to loom.com, sign in (or install the Chrome extension), click
  the Loom icon, choose "Screen + Cam" or "Screen only," pick "Current
  Tab" or "Full Desktop" (Full Desktop is safer here since you're
  switching tabs), hit start.

**0:00 – 0:30 | What this is**
"This is a lead-qualification funnel for [LexHive's use case] — 5 steps,
capturing a lead, sending a matched/deduped conversion event to Meta,
and routing the lead into Airtable through n8n, with failure handling
built in." Click through the funnel quickly, submit a NEW test lead
(fresh email, not one you've used before) so the create path fires.

**0:30 – 1:10 | What just happened (Network tab)**
Show the `submit-lead` request/response in DevTools. Point at the
`eventId` field — explain: this same ID is shared between the client-side
Meta Pixel and the server-side Conversions API call, so Meta collapses
both signals into one counted conversion instead of double-counting.

**1:10 – 1:50 | The Meta payload**
Switch to webhook.site. Say plainly: "LexHive confirmed they wouldn't
provide test Meta credentials for this assignment, and that showing the
event land in Meta itself wasn't required — just the correct payload."
Show the received POST: point at hashed `em`/`ph` (not plaintext),
the shared `event_id`, `fbp`/`fbc`. One sentence: swapping to a real
pixel is a one-line env var change.

**1:50 – 2:50 | n8n workflow**
Open the n8n workflow. Walk through the canvas left to right: Webhook →
secret check → Validate & Normalize (Code node) → Search Existing Lead →
Existing Record? branch → Create or Update → Respond. Click into the
most recent execution and show real data flowing through 2-3 nodes.

**2:50 – 3:30 | Airtable + the dedup proof**
Show the new row in Leads with your fresh test lead's data. Then — this
is a good moment — mention or show that submitting the SAME email twice
updates Touch Count instead of creating a duplicate row (you already
proved this earlier; describe it even if you don't re-demo it live).
Show the Automation Logs table and explain what it's for.

**3:30 – 4:15 | Resilience, for real**
You don't need to stage a failure — you hit a real one earlier today:
show (or describe) the funnel's "trouble reaching our server" message
from when N8N_LEAD_WEBHOOK_URL was still a placeholder, and explain what
happened: the client retried once, then queued the lead in localStorage
instead of losing it, while the Meta CAPI call succeeded independently
in parallel. That's the actual system behaving correctly under a real
partial failure, not a simulated one.

**4:15 – 4:45 | One decision, in your own words**
Pick ONE trade-off from `assumptions-and-tradeoffs.md` and explain the
reasoning — e.g. why age is a hard disqualify (no PII collected) but the
other two qualifying questions are soft (lead still captured, flagged
`qualified: false`). Shows judgment, not just execution.

**4:45 – 5:00 | Close**
One sentence on what you'd build next with more time (e.g. a
dead-letter replay button, or bot/spam protection on the funnel).
