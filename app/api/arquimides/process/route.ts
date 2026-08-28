import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function db() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase no está configurado en Arquimides");
  return createClient(url, key, { auth: { persistSession: false } });
}

function classify(subject: string, body: string) {
  const text = `${subject}\n${body}`.toLowerCase();
  if (/precio|cotiz|cuanto|costo|vendes|busco|quiero|necesito|disponible/.test(text)) return "request";
  if (/venta|comprar|ofrezco|tengo para vender/.test(text)) return "offer";
  return "message";
}

export async function POST() {
  try {
    const supabase = db();
    const { data: jobs, error } = await supabase
      .from("processing_queue")
      .select("id,email_id,attempts")
      .eq("status", "pending")
      .lte("available_at", new Date().toISOString())
      .order("created_at", { ascending: true })
      .limit(20);
    if (error) throw error;

    let processed = 0;
    for (const job of jobs || []) {
      try {
        const { data: email, error: emailError } = await supabase
          .from("inbound_emails")
          .select("id,contact_id,subject,body_text,from_email")
          .eq("id", job.email_id)
          .single();
        if (emailError) throw emailError;

        const subject = email.subject || "";
        const body = email.body_text || "";
        const type = classify(subject, body);
        const classification = { type, processed_at: new Date().toISOString(), processor: "arquimides-rules-v1" };

        await supabase.from("inbound_emails").update({ classification }).eq("id", email.id);

        if (type === "request") {
          const { data: request, error: requestError } = await supabase
            .from("requests")
            .insert({ contact_id: email.contact_id, source_email_id: email.id, notes: `${subject}\n${body}`.trim() || null })
            .select("id").single();
          if (requestError) throw requestError;

          const itemName = subject.trim() || body.split("\n").find(Boolean)?.slice(0, 160) || "Solicitud sin título";
          const { error: itemError } = await supabase.from("requested_items").insert({
            request_id: request.id,
            item_name: itemName,
            quantity: 1,
            source_text: `${subject}\n${body}`.trim(),
            extraction_confidence: 0.35,
            missing_fields: ["game", "set_name", "condition"],
          });
          if (itemError) throw itemError;
        }

        await supabase.from("processing_queue").update({ status: "completed", completed_at: new Date().toISOString(), attempts: (job.attempts || 0) + 1 }).eq("id", job.id);
        processed++;
      } catch (jobError) {
        await supabase.from("processing_queue").update({ status: "failed", attempts: (job.attempts || 0) + 1 }).eq("id", job.id);
      }
    }

    return NextResponse.json({ ok: true, processed, queued: jobs?.length || 0 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Error" }, { status: 500 });
  }
}
