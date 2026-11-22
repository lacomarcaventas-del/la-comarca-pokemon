import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedEvents = new Set([
  "page_view", "product_view", "search", "category_view",
  "add_to_cart", "cart_open", "checkout_started", "purchase",
]);

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const cleanText = (value: unknown, max = 100) =>
  typeof value === "string" ? value.replace(/[<>\u0000-\u001f]/g, "").trim().slice(0, max) : "";

function safePayload(input: Record<string, unknown>, request: NextRequest) {
  const page = typeof input.page === "string" && input.page.startsWith("/")
    ? input.page.split("?")[0].split("#")[0].slice(0, 160)
    : "/";
  const payload: Record<string, string | number> = { page };

  for (const key of ["source", "medium", "campaign", "device", "category_name"] as const) {
    const value = cleanText(input[key], key === "campaign" ? 80 : 100);
    if (value) payload[key] = value;
  }
  const internalDevice = input.internal_device;
  if (internalDevice === "store_pc" || internalDevice === "marco_mobile_chrome") {
    payload.internal_device = internalDevice;
    payload.traffic_class = "internal";
  }
  for (const key of ["product_id", "category_id"] as const) {
    const value = cleanText(input[key], 36);
    if (uuidPattern.test(value)) payload[key] = value;
  }
  if (Number.isInteger(input.query_length)) {
    payload.query_length = Math.max(0, Math.min(120, Number(input.query_length)));
  }
  if (typeof input.value === "number" && Number.isFinite(input.value) && input.value >= 0 && input.value <= 1000000) {
    payload.value = Math.round(input.value * 100) / 100;
    payload.currency = "MXN";
  }

  const city = cleanText(request.headers.get("x-vercel-ip-city"), 80);
  const region = cleanText(request.headers.get("x-vercel-ip-country-region"), 80);
  const country = cleanText(request.headers.get("x-vercel-ip-country"), 2).toUpperCase();
  if (city) payload.city = city;
  if (region) payload.region = region;
  if (country) payload.country = country;
  return payload;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body || !allowedEvents.has(body.event) || !uuidPattern.test(body.sessionId || "")) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    if (!body.payload || typeof body.payload !== "object" || Array.isArray(body.payload)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wwqkeeducvxxvdpdxxnu.supabase.co";
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_kPyc-lUnT2-pL9yUF-ITlg_Kr6Ylnwh";
    const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await supabase.from("analytics_events").insert({
      event: body.event,
      session_id: body.sessionId,
      payload: safePayload(body.payload, request),
    });
    if (error) {
      console.error("Analytics insert failed:", error.message);
      return NextResponse.json({ ok: false }, { status: 503 });
    }
    return NextResponse.json({ ok: true }, { status: 202 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
