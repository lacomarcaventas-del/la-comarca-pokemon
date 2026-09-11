import { NextRequest, NextResponse } from "next/server";

function esc(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
}

function colorFromName(name: string) {
  const n = name.toLowerCase();
  if (n.includes("black") || n.includes("negro")) return "#202124";
  if (n.includes("white") || n.includes("blanco")) return "#eeeeea";
  if (n.includes("grey") || n.includes("gris")) return "#85898d";
  if (n.includes("dark brown") || n.includes("brown")) return "#704a35";
  if (n.includes("dark red") || n.includes("red")) return "#a53c36";
  if (n.includes("orange") || n.includes("dorado")) return "#d17a27";
  if (n.includes("yellow")) return "#d6b32f";
  if (n.includes("green")) return "#3d8252";
  if (n.includes("blue")) return "#4678b5";
  if (n.includes("purple")) return "#70558f";
  return "#c8c8c2";
}

function artFor(name: string) {
  const n = name.toLowerCase();
  const fill = colorFromName(name);

  if (n.includes("paint marker") || n.includes("brush pen") || n.includes("glue pen") || n.includes("model marker") || n.includes("ms047")) {
    return `<g><rect x="125" y="145" width="310" height="70" rx="30" fill="#242629"/><rect x="180" y="145" width="180" height="70" rx="8" fill="${fill}"/><rect x="360" y="145" width="75" height="70" rx="28" fill="#17191c"/><polygon points="125,180 75,180 125,166" fill="#bfc1bd"/><rect x="190" y="158" width="150" height="44" rx="5" fill="#f4f4ef" opacity=".16"/></g>`;
  }

  if (n.includes("cement") || n.includes("welder") || n.includes("panel line") || n.includes("weather fx")) {
    return `<g><rect x="177" y="72" width="206" height="62" rx="20" fill="#25272a"/><rect x="153" y="113" width="254" height="250" rx="32" fill="#f1f1ed" stroke="#c8c9c4" stroke-width="4"/><rect x="178" y="175" width="204" height="115" rx="12" fill="${fill}"/><rect x="178" y="175" width="204" height="115" rx="12" fill="#ffffff" opacity=".08"/><circle cx="280" cy="323" r="18" fill="#d0d1cc"/></g>`;
  }

  return `<g><rect x="165" y="86" width="230" height="54" rx="20" fill="#202226"/><rect x="145" y="120" width="270" height="245" rx="35" fill="#ecece7" stroke="#c6c7c2" stroke-width="4"/><rect x="172" y="176" width="216" height="122" rx="14" fill="${fill}"/><rect x="172" y="176" width="216" height="122" rx="14" fill="#ffffff" opacity=".1"/></g>`;
}

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name")?.trim() || "Producto de modelismo";
  const subtitle = name.length > 46 ? `${name.slice(0, 43)}...` : name;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="420" viewBox="0 0 560 420"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f8f8f5"/><stop offset="1" stop-color="#e9e9e5"/></linearGradient><filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-opacity=".18"/></filter></defs><rect width="560" height="420" fill="url(#bg)"/><text x="280" y="38" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" letter-spacing="3" fill="#767873">MODELISMO</text><ellipse cx="280" cy="370" rx="150" ry="18" fill="#bfc0bb" opacity=".42"/> <g filter="url(#shadow)">${artFor(name)}</g><rect x="62" y="390" width="436" height="1" fill="#d0d1cc"/><text x="280" y="407" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" fill="#858681">${esc(subtitle)}</text></svg>`;
  return new NextResponse(svg, { headers: { "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": "public, max-age=31536000, immutable" } });
}
