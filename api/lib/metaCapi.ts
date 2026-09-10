import { createHash } from "node:crypto";

const GRAPH_VERSION = "v21.0";

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

/** Normalizes a US phone number to E.164-ish digits-only before hashing, per Meta's spec. */
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  // Meta expects country code included; assume US (+1) if a 10-digit number is passed.
  return digits.length === 10 ? `1${digits}` : digits;
}

export interface CapiLeadInput {
  eventId: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  state: string;
  landingUrl: string;
  fbp?: string;
  fbc?: string;
  clientIp?: string;
  userAgent?: string;
  submittedAt: string; // ISO string
}

/**
 * Sends a server-side "Lead" event to Meta. Reuses the eventId the client
 * pixel already fired with — Meta dedupes on (event_name, event_id) pairs,
 * so this event and the browser-side one collapse into a single counted
 * conversion instead of inflating results 2x.
 *
 * Match quality (and therefore how well Meta can attribute + optimize
 * against this event) depends on how many identifiers we send. We send
 * hashed email/phone/name/state plus fbp/fbc/IP/UA, which covers Meta's
 * recommended "strong" match key set for a lead event.
 */
export async function sendMetaLeadEvent(input: CapiLeadInput): Promise<{ ok: boolean; error?: string }> {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  // Test/dev escape hatch: when a real pixel isn't available (e.g. an
  // account-level restriction blocks creating one), point this at a
  // request-inspector like https://webhook.site/#!/<your-id> instead of
  // Meta's real Graph API endpoint. The exact same hashed payload gets
  // built and sent — this only swaps the destination, so it proves the
  // integration's shape/logic without needing live Meta credentials.
  const endpointOverride = process.env.META_CAPI_ENDPOINT_OVERRIDE;

  if (!endpointOverride && (!pixelId || !accessToken)) {
    return { ok: false, error: "Meta CAPI not configured (missing pixel id / access token)" };
  }

  const userData: Record<string, unknown> = {
    em: [sha256(input.email)],
    ph: [sha256(normalizePhone(input.phone))],
    fn: [sha256(input.firstName)],
    ln: [sha256(input.lastName)],
    st: [sha256(input.state)],
    country: [sha256("us")],
  };
  if (input.fbp) userData.fbp = input.fbp;
  if (input.fbc) userData.fbc = input.fbc;
  if (input.clientIp) userData.client_ip_address = input.clientIp;
  if (input.userAgent) userData.client_user_agent = input.userAgent;

  const body = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(new Date(input.submittedAt).getTime() / 1000),
        event_id: input.eventId, // <-- shared with the client-side pixel event for dedup
        action_source: "website",
        event_source_url: input.landingUrl,
        user_data: userData,
      },
    ],
    // Only present in non-production so test events don't pollute real reporting.
    ...(process.env.META_TEST_EVENT_CODE
      ? { test_event_code: process.env.META_TEST_EVENT_CODE }
      : {}),
  };

  const url =
    endpointOverride ??
    `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${accessToken}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    return { ok: false, error: `Meta CAPI ${res.status}: ${errBody}` };
  }
  if (endpointOverride) {
    console.log(`[metaCapi] TEST MODE — sent to override endpoint instead of Meta: ${endpointOverride}`);
  }
  return { ok: true };
}
