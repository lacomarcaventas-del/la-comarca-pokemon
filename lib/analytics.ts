/**
 * COMARCA_OS — Analytics experimental
 *
 * Módulo deliberadamente aislado:
 * - No modifica carrito, checkout, stock ni autenticación.
 * - Si analytics falla, nunca debe afectar la experiencia del cliente.
 * - No guarda nombres, correos, IPs ni datos personales.
 * - Solo persiste eventos mínimos y anónimos en Supabase.
 */

import { supabaseBrowser } from "./supabase";

export type AnalyticsEvent =
  | "page_view"
  | "category_view"
  | "search"
  | "product_view"
  | "add_to_cart"
  | "checkout_started"
  | "purchase";

export type AnalyticsPayload = {
  product_id?: string;
  category_id?: string;
  query_length?: number;
  source?: string;
  medium?: string;
  campaign?: string;
  page?: string;
  value?: number;
  currency?: string;
};

type AnalyticsEventRecord = {
  event: AnalyticsEvent;
  session_id: string;
  occurred_at: string;
  payload: AnalyticsPayload;
};

const SESSION_KEY = "comarca_analytics_session";

function getSessionId(): string {
  if (typeof window === "undefined") return "server";

  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;

    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);

    window.sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return "anonymous";
  }
}

function getAttribution(): Pick<
  AnalyticsPayload,
  "source" | "medium" | "campaign"
> {
  if (typeof window === "undefined") return {};

  try {
    const params = new URLSearchParams(window.location.search);

    return {
      source: params.get("utm_source") || undefined,
      medium: params.get("utm_medium") || undefined,
      campaign: params.get("utm_campaign") || undefined,
    };
  } catch {
    return {};
  }
}

async function sendAnalytics(record: AnalyticsEventRecord): Promise<void> {
  try {
    const sb = supabaseBrowser();

    await sb.from("analytics_events").insert({
      event: record.event,
      session_id: record.session_id,
      occurred_at: record.occurred_at,
      payload: record.payload,
    });
  } catch {
    // Analytics nunca debe afectar al catálogo, carrito o checkout.
  }
}

/**
 * Punto único de entrada para toda la analítica.
 * Nunca debe lanzar una excepción que pueda romper una función comercial.
 */
export function track(
  event: AnalyticsEvent,
  payload: AnalyticsPayload = {},
): void {
  try {
    const record: AnalyticsEventRecord = {
      event,
      session_id: getSessionId(),
      occurred_at: new Date().toISOString(),
      payload: {
        ...getAttribution(),
        ...payload,
      },
    };

    if (process.env.NODE_ENV !== "production") {
      console.debug("[COMARCA_ANALYTICS]", record);
    }

    // Fire-and-forget: no bloquea navegación, carrito ni checkout.
    void sendAnalytics(record);
  } catch {
    // Analytics nunca debe afectar al catálogo, carrito o checkout.
  }
}

export function trackPageView(page?: string): void {
  track("page_view", {
    page:
      page ||
      (typeof window !== "undefined" ? window.location.pathname : undefined),
  });
}

export function trackProductView(productId: string, page?: string): void {
  track("product_view", {
    product_id: productId,
    page,
  });
}

export function trackSearch(query: string): void {
  const normalized = query.trim();
  if (!normalized) return;

  // No persistimos el texto buscado: solo medimos que hubo una búsqueda y su longitud.
  track("search", {
    query_length: Math.min(normalized.length, 200),
  });
}

export function trackAddToCart(
  productId: string,
  value?: number,
  currency = "MXN",
): void {
  track("add_to_cart", {
    product_id: productId,
    value,
    currency,
  });
}

export function trackCheckoutStarted(value?: number): void {
  track("checkout_started", {
    value,
    currency: "MXN",
  });
}

export function trackPurchase(
  value?: number,
  currency = "MXN",
): void {
  track("purchase", {
    value,
    currency,
  });
}
