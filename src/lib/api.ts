import type { LeadPayload } from "../types";

const ENDPOINT = "/api/submit-lead";
const RETRY_QUEUE_KEY = "lexhive_pending_leads";

async function postLead(payload: LeadPayload): Promise<void> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`submit-lead failed: ${res.status} ${body}`);
  }
}

function readQueue(): LeadPayload[] {
  try {
    return JSON.parse(localStorage.getItem(RETRY_QUEUE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeQueue(items: LeadPayload[]) {
  localStorage.setItem(RETRY_QUEUE_KEY, JSON.stringify(items));
}

/**
 * Submits a lead with one immediate retry. If both attempts fail (e.g. the
 * user is on a flaky connection at the exact moment they convert — the
 * worst possible time to lose a lead), the payload is queued in
 * localStorage and retried on the next page load via flushQueuedLeads().
 * The shared eventId means a retried submission never creates a duplicate
 * lead or a duplicate Meta event.
 */
export async function submitLead(payload: LeadPayload): Promise<{ ok: boolean; queued: boolean }> {
  try {
    await postLead(payload);
    return { ok: true, queued: false };
  } catch (err) {
    console.warn("[api] first attempt failed, retrying once", err);
    try {
      await postLead(payload);
      return { ok: true, queued: false };
    } catch (err2) {
      console.error("[api] retry failed, queueing for later", err2);
      const queue = readQueue();
      queue.push(payload);
      writeQueue(queue);
      return { ok: false, queued: true };
    }
  }
}

/** Call on app load: flushes any leads that got stuck in the queue last visit. */
export async function flushQueuedLeads(): Promise<void> {
  const queue = readQueue();
  if (queue.length === 0) return;
  const remaining: LeadPayload[] = [];
  for (const payload of queue) {
    try {
      await postLead(payload);
    } catch {
      remaining.push(payload);
    }
  }
  writeQueue(remaining);
}
