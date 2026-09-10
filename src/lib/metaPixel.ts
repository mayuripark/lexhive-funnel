import { v4 as uuidv4 } from "uuid";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined;

/**
 * Loads the Meta Pixel base code once. Safe to call multiple times.
 */
export function initMetaPixel() {
  if (!PIXEL_ID) {
    console.warn("[metaPixel] VITE_META_PIXEL_ID is not set — pixel disabled.");
    return;
  }
  if (window.fbq) return; // already loaded

  // Standard Meta Pixel bootstrap snippet, condensed.
  (function (
    f: Window,
    b: Document,
    e: string,
    v: string
  ) {
    let n: any;
    let t: HTMLScriptElement;
    let s: HTMLScriptElement;
    if ((f as any).fbq) return;
    n = (f as any).fbq = function (...args: unknown[]) {
      n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
    };
    if (!(f as any)._fbq) (f as any)._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e) as HTMLScriptElement;
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0] as HTMLScriptElement;
    s.parentNode?.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  (window.fbq as ((...args: unknown[]) => void) | undefined)?.("init", PIXEL_ID);
  (window.fbq as ((...args: unknown[]) => void) | undefined)?.("track", "PageView");
}

/**
 * Fires the client-side Lead event and returns the event_id that must be
 * reused for the server-side Conversions API call so Meta can dedupe the
 * two signals into one event instead of double-counting the conversion.
 */
export function trackLead(eventId?: string): string {
  const id = eventId ?? uuidv4();
  window.fbq?.("track", "Lead", {}, { eventID: id });
  return id;
}

/** Reads the _fbp / _fbc cookies Meta sets, used for CAPI event matching. */
export function getFacebookCookies() {
  const get = (name: string) => {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] : undefined;
  };
  return { fbp: get("_fbp"), fbc: get("_fbc") };
}
