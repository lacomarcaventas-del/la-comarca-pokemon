export type AnalyticsEvent =
  | "page_view"
  | "product_view"
  | "search"
  | "category_view"
  | "add_to_cart"
  | "cart_open"
  | "checkout_started"
  | "purchase";

type EventPayload = Record<string, string | number | boolean | null | undefined>;

function getSessionId() {
  const key = "lc_analytics_session";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

export function trackEvent(event: AnalyticsEvent, payload: EventPayload = {}) {
  if (typeof window === "undefined") return;
  try {
    const sessionId = getSessionId();
    const safePayload: EventPayload = {
      ...payload,
      page: window.location.pathname.slice(0, 160),
    };
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, sessionId, payload: safePayload }),
      keepalive: true,
      credentials: "same-origin",
    }).catch(() => {});
  } catch {
    // Analytics must never interrupt shopping or checkout.
  }
}
