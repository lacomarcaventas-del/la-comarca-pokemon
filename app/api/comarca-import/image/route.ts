import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(value: string | null) {
  return String(value || "").trim().replace(/[^a-zA-Z0-9-]/g, "");
}

export async function GET(request: NextRequest) {
  const set = clean(request.nextUrl.searchParams.get("set")).toLowerCase();
  const numberRaw = clean(request.nextUrl.searchParams.get("number"));
  const format = (request.nextUrl.searchParams.get("format") || "webp").toLowerCase();

  if (!set || !numberRaw) {
    return NextResponse.json({ error: "Faltan set o number." }, { status: 400 });
  }

  if (!/^(jpg|png|webp)$/.test(format)) {
    return NextResponse.json({ error: "Formato inválido." }, { status: 400 });
  }

  const number = /^\d+$/.test(numberRaw) ? numberRaw.padStart(3, "0") : numberRaw;
  const series = set.startsWith("me") ? "me" : null;

  if (!series) {
    return NextResponse.json(
      { error: "Set no compatible todavía con el motor de imágenes." },
      { status: 400 }
    );
  }

  const url = `https://assets.tcgdex.net/en/${series}/${set}/${number}/high.${format}`;
  const upstream = await fetch(url, {
    headers: { "User-Agent": "La-Comarca-COMARCA_IMPORT/1.0" },
    next: { revalidate: 86400 },
  });

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "No se encontró la imagen de la carta.", url },
      { status: upstream.status }
    );
  }

  const contentType = upstream.headers.get("content-type") || `image/${format}`;
  const body = await upstream.arrayBuffer();

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "X-Comarca-Source": "TCGdex",
      "X-Comarca-Card": `${set}-${number}`,
    },
  });
}
