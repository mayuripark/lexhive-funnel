const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"];
const UTM_STORAGE_KEY = "lexhive_utm";

/**
 * Captures UTM/click-id params on first landing and persists them for the
 * whole session, so a lead who lands on ?utm_source=facebook and converts
 * three steps later (or after a reload) still gets correctly attributed.
 */
export function captureAndPersistUtm(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const fromUrl: Record<string, string> = {};
  UTM_KEYS.forEach((key) => {
    const val = params.get(key);
    if (val) fromUrl[key] = val;
  });

  if (Object.keys(fromUrl).length > 0) {
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(fromUrl));
    return fromUrl;
  }

  try {
    return JSON.parse(sessionStorage.getItem(UTM_STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}
