import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * GET /api/health — checks that required env vars are present without
 * making any external calls (cheap, safe to hit frequently). Wire this to
 * an uptime monitor (e.g. a 5-minute cron via UptimeRobot / Better Stack)
 * so a missing/rotated credential is caught before it silently drops leads.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  const checks = {
    metaConfigured: Boolean(process.env.META_PIXEL_ID && process.env.META_CAPI_ACCESS_TOKEN),
    n8nConfigured: Boolean(process.env.N8N_LEAD_WEBHOOK_URL),
  };
  const healthy = Object.values(checks).every(Boolean);
  // Debug aid: lists which relevant env var NAMES the running function can
  // actually see (never values) — the fastest way to catch a typo'd key
  // name without exposing anything sensitive. Remove before final submission.
  const relevantKeys = Object.keys(process.env).filter(
    (k) => k.startsWith("META_") || k.startsWith("N8N_") || k.startsWith("VITE_")
  );
  res
    .status(healthy ? 200 : 503)
    .json({ healthy, checks, presentEnvKeys: relevantKeys, checkedAt: new Date().toISOString() });
}
