import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arquimides · Núcleo Operativo",
  description: "Centro operativo para consultas, seguimiento y acciones de La Comarca"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
