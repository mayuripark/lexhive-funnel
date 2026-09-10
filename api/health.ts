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
  res.status(healthy ? 200 : 503).json({ healthy, checks, checkedAt: new Date().toISOString() });
}
