/**
 * COMARCA_OS — Analytics experimental
 *
 * Módulo deliberadamente aislado:
 * - No modifica carrito, checkout, stock ni autenticación.
 * - Si analytics falla, nunca debe afectar la experiencia del cliente.
 * - No guarda nombres, correos, IPs ni datos personales.
 * - Los eventos se pueden activar gradualmente desde los componentes.
 *
 * Esta primera versión NO envía nada a Supabase.
 * Solo prepara la interfaz y permite probar el flujo en consola.
 */

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
  query?: string;
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
  timestamp: string;
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

/**
 * Punto único de entrada para toda la analítica.
 *
 * IMPORTANTE:
 * Nunca debe lanzar una excepción que pueda romper una función
 * comercial del sitio.
 */
export function track(
  event: AnalyticsEvent,
  payload: AnalyticsPayload = {},
): void {
  try {
    const record: AnalyticsEventRecord = {
      event,
      session_id: getSessionId(),
      timestamp: new Date().toISOString(),
      payload: {
        ...getAttribution(),
        ...payload,
      },
    };

    // Modo prueba: no hay escritura en Supabase todavía.
    if (process.env.NODE_ENV !== "production") {
      console.debug("[COMARCA_ANALYTICS]", record);
    }

    // Futura implementación:
    // void sendAnalytics(record);
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
  if (!query.trim()) return;
  track("search", { query: query.trim() });
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
