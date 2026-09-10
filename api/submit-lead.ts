import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendMetaLeadEvent } from "./lib/metaCapi.js";

const REQUIRED_FIELDS = ["eventId", "email", "phone", "firstName", "lastName", "state"] as const;

function getClientIp(req: VercelRequest): string | undefined {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string") return fwd.split(",")[0].trim();
  return req.socket?.remoteAddress;
}

async function forwardToN8n(payload: unknown, signal: AbortSignal) {
  const webhookUrl = process.env.N8N_LEAD_WEBHOOK_URL;
  if (!webhookUrl) throw new Error("N8N_LEAD_WEBHOOK_URL is not configured");

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Shared secret so the n8n webhook can reject calls that didn't come
      // from this API — n8n's Webhook node checks this header.
      "x-lexhive-webhook-secret": process.env.N8N_WEBHOOK_SECRET ?? "",
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`n8n webhook ${res.status}: ${body}`);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const lead = req.body ?? {};
  const missing = REQUIRED_FIELDS.filter((f) => !lead[f]);
  if (missing.length > 0) {
    res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
    return;
  }

  const clientIp = getClientIp(req);
  const userAgent = req.headers["user-agent"] as string | undefined;

  // Meta CAPI and the n8n handoff are independent concerns: a tracking
  // hiccup should never cost us the actual lead, and a CRM hiccup
  // shouldn't block ad-platform attribution. We run them in parallel and
  // report each outcome separately instead of one masking the other.
  const [capiResult, n8nResult] = await Promise.allSettled([
    sendMetaLeadEvent({
      eventId: lead.eventId,
      email: lead.email,
      phone: lead.phone,
      firstName: lead.firstName,
      lastName: lead.lastName,
      state: lead.state,
      landingUrl: lead.landingUrl ?? "",
      fbp: lead.fbp,
      fbc: lead.fbc,
      clientIp,
      userAgent,
      submittedAt: lead.submittedAt ?? new Date().toISOString(),
    }),
    (async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        await forwardToN8n({ ...lead, clientIp, userAgent }, controller.signal);
      } finally {
        clearTimeout(timeout);
      }
    })(),
  ]);

  const capiOk = capiResult.status === "fulfilled" && capiResult.value.ok;
  const n8nOk = n8nResult.status === "fulfilled";

  if (!capiOk) {
    // Non-fatal: log loudly (Vercel's function logs are the "visible" half
    // of "visible and recoverable" for this path) but don't fail the request.
    const reason =
      capiResult.status === "rejected" ? capiResult.reason : capiResult.value.error;
    console.error("[submit-lead] Meta CAPI failed", { eventId: lead.eventId, reason });
  }

  if (!n8nOk) {
    console.error("[submit-lead] n8n forward failed", {
      eventId: lead.eventId,
      reason: (n8nResult as PromiseRejectedResult).reason,
    });
    // The lead itself failed to reach the CRM layer — this IS fatal for
    // the client, which will retry once more and then queue it locally.
    res.status(502).json({ error: "Failed to route lead", capiOk });
    return;
  }

  res.status(200).json({ ok: true, capiOk });
}
