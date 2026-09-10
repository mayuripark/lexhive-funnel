# Airtable schema

Base: `LexHive Lead Automation` (create manually — Airtable bases can't be
created via API without an existing base as a template, so this is a
one-time manual step).

## Table 1: `Leads`

| Field             | Type                         | Notes                                                        |
|-------------------|------------------------------|----------------------------------------------------------------|
| Event ID           | Single line text (primary)  | The shared Meta/lead `eventId` — used as the natural dedup key |
| First Name         | Single line text             |                                                                |
| Last Name          | Single line text             |                                                                |
| Email               | Email                        |                                                                |
| Phone               | Phone number                 |                                                                |
| State               | Single select (50 US states) |                                                                |
| Qualified           | Checkbox                     | `true` only if all 3 qualifying questions passed              |
| Restricted State    | Checkbox                     | `true` if State is in the restricted-state list                |
| Review Status       | Single select               | `New`, `Auto-Routed`, `Needs Manual Review`, `Contacted`        |
| Meta CAPI Sent      | Checkbox                     | Whether the server-side event confirmed delivery to Meta       |
| UTM Source/Medium/Campaign | Single line text (x3) | Flattened from the `utm` object for easy filtering/reporting   |
| Landing URL         | URL                          |                                                                |
| Submitted At        | Date (with time)             |                                                                |
| Touch Count         | Number                       | Incremented if the same Event ID/Email is seen again            |
| Raw Payload         | Long text                    | Full JSON of what n8n received — the audit trail for debugging |

**Views worth adding:** `Needs Manual Review` (filtered on Restricted
State = true OR Meta CAPI Sent = false), and `Today's Qualified Leads`
(filtered + sorted by Submitted At) for the marketing team's daily glance.

## Table 2: `Automation Logs`

This is the "failures should be visible and recoverable" table — every
node error in the n8n workflow writes here instead of silently vanishing.

| Field         | Type              | Notes                                      |
|---------------|-------------------|---------------------------------------------|
| Timestamp     | Date (with time)  |                                             |
| Workflow      | Single line text  | Which n8n workflow failed                  |
| Failed Node   | Single line text  | e.g. "Create Lead"                         |
| Event ID      | Single line text  | Links back to the Leads table when known   |
| Error Message | Long text         |                                             |
| Raw Input     | Long text         | The item that was being processed — lets you replay it manually |
| Resolved      | Checkbox          | Manually ticked once someone has re-processed the lead |

Linking `Event ID` here to the `Leads` table (Airtable linked record
field) means a failed lead can be recovered by hand in under a minute:
open the log row, copy the Raw Input, re-run it through the workflow's
manual trigger.
