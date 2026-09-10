import { NextResponse } from "next/server";

const THEMES: Record<string, { bg: string; accent: string; icon: string }> = {
  accesorios: { bg: "#18222c", accent: "#7dd3fc", icon: "A" },
  coleccionables: { bg: "#3a2a18", accent: "#fbbf24", icon: "C" },
  "disney-lorcana": { bg: "#24163d", accent: "#c084fc", icon: "L" },
  "dungeons-dragons": { bg: "#35161a", accent: "#f87171", icon: "D" },
  "gundam-card-game": { bg: "#1b2635", accent: "#93c5fd", icon: "G" },
  heroclix: { bg: "#15283a", accent: "#60a5fa", icon: "H" },
  "juegos-de-mesa": { bg: "#332313", accent: "#f59e0b", icon: "J" },
  "magic-the-gathering": { bg: "#171b27", accent: "#fb923c", icon: "M" },
  modelismo: { bg: "#173022", accent: "#86efac", icon: "M" },
  "one-piece-card-game": { bg: "#132b3b", accent: "#67e8f9", icon: "O" },
  "pokemon-tcg": { bg: "#24330e", accent: "#fde047", icon: "P" },
  "weiss-schwarz": { bg: "#242424", accent: "#e5e7eb", icon: "W" },
  "yu-gi-oh": { bg: "#342011", accent: "#f59e0b", icon: "Y" },
};

function esc(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
}

function slug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function GET(req: Request) {
  const url = new URL(req.url);
  const categoryParam = url.searchParams.get("category") || "Producto al azar";
  const categorySlug = slug(categoryParam);
  const variant = (url.searchParams.get("variant") || "150").toLowerCase();
  const theme = THEMES[categorySlug] || { bg: "#17212b", accent: "#fbbf24", icon: "?" };

  const label = variant === "10" ? "PRODUCTO AL AZAR 1" : variant === "50" ? "PRODUCTO AL AZAR 2" : "PRODUCTO AL AZAR";
  const price = variant === "10" ? "$10" : variant === "50" ? "$50" : "$150";
  const category = esc(categoryParam);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
  <defs>
    <radialGradient id="g" cx="50%" cy="35%" r="80%">
      <stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.32"/>
      <stop offset="100%" stop-color="${theme.bg}" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="16" stdDeviation="18" flood-opacity="0.35"/></filter>
  </defs>
  <rect width="900" height="900" rx="42" fill="${theme.bg}"/>
  <rect width="900" height="900" rx="42" fill="url(#g)"/>
  <path d="M70 180 L830 90 M50 310 L850 220 M40 440 L860 350 M20 570 L880 480 M30 700 L850 610" stroke="${theme.accent}" stroke-opacity="0.13" stroke-width="8"/>
  <g filter="url(#shadow)">
    <rect x="145" y="225" width="610" height="430" rx="34" fill="#10151c" stroke="${theme.accent}" stroke-width="7"/>
    <path d="M175 255 H725 V615 H175 Z" fill="#171d25"/>
    <circle cx="450" cy="420" r="116" fill="${theme.accent}" fill-opacity="0.12" stroke="${theme.accent}" stroke-width="6"/>
    <text x="450" y="457" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="150" font-weight="900" fill="${theme.accent}">${theme.icon}</text>
    <text x="450" y="540" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" fill="#ffffff" letter-spacing="4">LA COMARCA</text>
  </g>
  <text x="450" y="115" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="800" fill="${theme.accent}" letter-spacing="3">${category.toUpperCase()}</text>
  <text x="450" y="742" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="900" fill="#ffffff">${label}</text>
  <rect x="305" y="775" width="290" height="78" rx="25" fill="${theme.accent}"/>
  <text x="450" y="830" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="900" fill="#10151c">${price}</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
