import type { Metadata } from "next";
import "./globals.css";
import "./account-hero-quality.css";
import "./auth-skin.css";

export const metadata: Metadata = {
  title: "La Comarca",
  description: "Catálogo y tienda de cartas de La Comarca"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
