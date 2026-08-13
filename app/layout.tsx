import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "La Comarca",
  description: "Catálogo y tienda de cartas de La Comarca"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
