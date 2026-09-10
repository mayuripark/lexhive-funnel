# Loom — word-for-word script

Read each line naturally. Pause a beat between segments while you
switch tabs — that's normal, don't rush it.

---

**[Segment 1 — funnel]**

"Hi, this is my walkthrough for the Growth Automation Engineer
assignment. I built a lead qualification funnel that captures a lead,
sends a matched, deduplicated conversion event to Meta, and routes the
lead into Airtable through n8n — with failure handling built in from
the start, not bolted on after.

Let me show it running live."

*(Click through all 5 steps with a fresh email, submit.)*

"That's submitted — you're all set, the lead's been captured."

---

**[Segment 2 — Network tab + webhook.site]**

"Now let's look at what actually happened behind the scenes, because
event quality is where I focused the most attention."

*(Switch to DevTools, click the submit-lead request.)*

"Here's the request my funnel sent to the backend. This eventId field
is shared between the Meta Pixel firing in the browser and the Meta
Conversions API call firing on the server — that's what lets Meta
collapse both signals into one counted conversion instead of
double-counting, which directly affects match quality and reporting
accuracy.

One note on my process here: my personal Meta ad account has an
advertising restriction, so I didn't have a live test pixel. Rather than
guess or fake it, I raised it directly with LexHive — they confirmed
they wouldn't provide test credentials, and that proving the payload
itself was correct was enough. So I built in a way to verify the exact
same code path against a request inspector instead."

*(Switch to webhook.site, refresh.)*

"Here's the real payload. Email and phone are hashed, not plaintext,
along with the shared event ID and the fbp and fbc identifiers Meta
uses for matching. This is the identical code that would run against a
live pixel — swapping to one is a one-line environment variable change,
nothing structural."

---

**[Segment 3 — n8n and Airtable]**

"Now, where the lead actually goes — this is the reliability piece."

*(Switch to n8n, open the workflow.)*

"A webhook receives the lead, checks a shared secret, then this Code
node validates and normalizes the data — it fails loudly on bad input
rather than passing along a broken record. Then it searches Airtable
by email and branches: existing lead gets updated, new lead gets
created. That's the dedup logic that keeps this reliable at volume."

*(Click into the most recent execution.)*

"Here's a real execution with real data flowing through each node —
this isn't a workflow I imported and left untested."

*(Switch to Airtable.)*

"And here's the result — this row is the lead I just submitted. There's
a second table here, Automation Logs, where any failure in this
workflow gets written automatically, so a broken lead is visible and
recoverable instead of just gone."

---

**[Segment 4 — resilience, proven not staged]**

"I want to walk through something that happened while I was actually
building this — it's stronger proof than a staged demo.

Earlier today, before I'd finished setting up n8n, my n8n webhook URL
was still a placeholder. When I submitted a test lead, the funnel
correctly told me it had trouble reaching the server, and that my
answers were saved and would send once online. Behind the scenes, the
browser retried once, then queued the lead locally instead of losing
it — while the Meta call still succeeded independently, since tracking
and lead delivery run in parallel and one failing doesn't take the
other down. I didn't script that failure — it happened, and the system
handled it the way I'd designed it to."

---

**[Segment 5 — a real engineering decision + close]**

"One decision worth explaining: age is a hard disqualifier — a no means
I don't collect any contact information at all. The other two
qualifying questions are soft — the lead still gets captured, just
flagged as not fully qualified. I made that call because those two
signals are less clear-cut than age, and I'd rather the business see a
borderline lead and decide, than have the funnel silently drop someone
still worth a conversation. That's the kind of trade-off I tried to
make throughout — practical, not just correct on paper.

With another day, I'd add a dead-letter replay for failed leads and
basic bot protection on the form. Thanks for watching."
