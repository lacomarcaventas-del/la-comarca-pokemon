import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function db() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase no está configurado en Arquimides");
  return createClient(url, key, { auth: { persistSession: false } });
}

async function sendReceptionEmail(to: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ARQUIMIDES_EMAIL_FROM || process.env.EMAIL_FROM;
  const receptionImage = "https://bdcmkqpfcmudjemsqjvb.supabase.co/storage/v1/object/public/email-assets/arquimides-recepcion-listas.png.png";

  if (!apiKey || !from) return;

  const imageResponse = await fetch(receptionImage);
  if (!imageResponse.ok) {
    throw new Error(`No se pudo descargar la imagen de recepción: ${imageResponse.status}`);
  }

  const imageBuffer = await imageResponse.arrayBuffer();
  const imageBase64 = Buffer.from(imageBuffer).toString("base64");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "¡Gracias por tu mensaje! — ARQUÍMIDES",
      html: `<!doctype html><html><body style="margin:0;padding:0;background:#0b0d0e;"></body></html>`,
      attachments: [{
        filename: "arquimides-recepcion-listas.png",
        content: imageBase64,
        content_type: "image/png",
      }],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`No se pudo enviar el correo de recepción: ${detail}`);
  }
}

export async function GET() {
  try {
    const supabase = db();
    const { data, error } = await supabase
      .from("inbound_emails")
      .select("id,from_email,subject,body_text,received_at,status,classification")
      .order("received_at", { ascending: false })
      .limit(20);
    if (error) throw error;
    return NextResponse.json({ ok: true, messages: data || [] });
  } catch (error) {
    return NextResponse.json({ ok: false, messages: [], error: error instanceof Error ? error.message : "Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.ARQUIMIDES_INBOUND_SECRET;
    if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const payload = await request.json();
    const from = String(payload.from_email || payload.from || "").trim().toLowerCase();
    if (!from) return NextResponse.json({ error: "from_email es obligatorio" }, { status: 400 });

    const supabase = db();
    const now = new Date().toISOString();
    const { data: contact, error: contactError } = await supabase
      .from("contacts")
      .upsert({ email: from, name: payload.from_name || null, last_seen_at: now }, { onConflict: "email" })
      .select("id")
      .single();
    if (contactError) throw contactError;

    const { data: email, error: emailError } = await supabase
      .from("inbound_emails")
      .upsert({
        provider_message_id: payload.message_id || payload.provider_message_id || null,
        contact_id: contact.id,
        from_email: from,
        subject: payload.subject || null,
        body_text: payload.body_text || payload.text || null,
        body_html: payload.body_html || payload.html || null,
        received_at: payload.received_at || now,
        status: "received",
        raw_metadata: payload.metadata || {},
      }, { onConflict: "provider_message_id", ignoreDuplicates: true })
      .select("id")
      .maybeSingle();
    if (emailError) throw emailError;

    if (email?.id) {
      const { error: queueError } = await supabase.from("processing_queue").insert({
        email_id: email.id,
        job_type: "classify_and_compile",
        payload: { source: "inbound_email" },
      });
      if (queueError) throw queueError;

      await sendReceptionEmail(from);
    }

    return NextResponse.json({ ok: true, email_id: email?.id || null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 });
  }
}
