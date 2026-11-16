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
    const referrerHost = (() => {
      try { return document.referrer ? new URL(document.referrer).hostname : ""; }
      catch { return ""; }
    })();
    const source = (params.get("utm_source") || referrerHost || "direct").slice(0, 80);
    const medium = (params.get("utm_medium") || (referrerHost ? "referral" : "direct")).slice(0, 80);
    const campaign = (params.get("utm_campaign") || "").slice(0, 80);
    const device = window.matchMedia("(max-width: 767px)").matches
      ? "mobile"
      : window.matchMedia("(max-width: 1023px)").matches ? "tablet" : "desktop";

    trackEvent("page_view", { page: pathname, source, medium, campaign, device });
  }, [pathname]);

  return null;
}
