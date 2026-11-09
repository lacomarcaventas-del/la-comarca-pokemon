"use client";

import { Analytics } from "@vercel/analytics/next";

const privateAnalyticsPaths = ["/admin", "/login", "/cuenta", "/checkout", "/pedido", "/api"];

export default function PrivacyFilteredAnalytics() {
  return (
    <Analytics
      beforeSend={(event) => {
        const url = new URL(event.url, window.location.origin);
        const pathname = url.pathname.replace(/\/+$/, "") || "/";

        // Do not collect private, administrative, account, order, or API routes.
        if (privateAnalyticsPaths.some((path) => pathname === path || pathname.startsWith(path + "/"))) {
          return null;
        }

        // Remove query strings and fragments to avoid collecting identifiers or tokens in URLs.
        return { ...event, url: pathname };
      }}
    />
  );
}
