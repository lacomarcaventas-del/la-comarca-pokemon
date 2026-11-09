import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import "./account-hero-quality.css";
import "./auth-skin.css";

export const metadata: Metadata = {
  title: "La Comarca",
  description: "Catálogo y tienda de cartas de La Comarca"
};

const privateAnalyticsPaths = ["/admin", "/login", "/cuenta", "/checkout", "/pedido", "/api"];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        {children}
        <Analytics
          beforeSend={(event) => {
            const url = new URL(event.url, "https://lacomarca.com.mx");
            const pathname = url.pathname.replace(/\/+$/, "") || "/";

            // Never collect private/account/administrative routes.
            if (privateAnalyticsPaths.some((path) => pathname === path || pathname.startsWith(path + "/"))) {
              return null;
            }

            // Strip query strings and fragments so tokens or personal data in URLs are not sent.
            return { ...event, url: pathname };
          }}
        />
      </body>
    </html>
  );
}
