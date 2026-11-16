"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "../lib/analytics";

const privatePaths = ["/admin", "/login", "/cuenta", "/checkout", "/pedido", "/api"];

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || privatePaths.some((p) => pathname === p || pathname.startsWith(p + "/"))) return;

    const params = new URLSearchParams(window.location.search);
    const attributionKey = "lc_analytics_attribution";
    let attribution: { source: string; medium: string; campaign: string } | null = null;
    try {
      const saved = sessionStorage.getItem(attributionKey);
      if (saved) attribution = JSON.parse(saved);
    } catch {}

    if (!attribution) {
      let referrerHost = "";
      try {
        const referrer = document.referrer ? new URL(document.referrer) : null;
        if (referrer && referrer.origin !== window.location.origin) referrerHost = referrer.hostname;
      } catch {}
      attribution = {
        source: (params.get("utm_source") || referrerHost || "direct").slice(0, 80),
        medium: (params.get("utm_medium") || (referrerHost ? "referral" : "direct")).slice(0, 80),
        campaign: (params.get("utm_campaign") || "").slice(0, 80),
      };
      try { sessionStorage.setItem(attributionKey, JSON.stringify(attribution)); } catch {}
    }

    const device = window.matchMedia("(max-width: 767px)").matches
      ? "mobile"
      : window.matchMedia("(max-width: 1023px)").matches ? "tablet" : "desktop";

    trackEvent("page_view", { page: pathname, ...attribution, device });
  }, [pathname]);

  return null;
}
