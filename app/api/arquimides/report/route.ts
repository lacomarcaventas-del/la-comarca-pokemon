import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TO = "lacomarcaventas@gmail.com";
const EPOCH = Date.UTC(2026, 7, 27);

function shouldSendToday() {
  const today = new Date();
  const utcDay = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const days = Math.floor((utcDay - EPOCH) / 86_400_000);
  return days >= 0 && days % 5 === 0;
}

async function buildReport() {
  const generatedAt = new Date().toLocaleString("es-MX", { dateStyle: "full", timeStyle: "short", timeZone: "America/Mexico_City" });
  return {
    generatedAt,
    summary: [
      "ARQUÍMEDES se encuentra operativo.",
      "El canal de reporte automático está activo.",
      "Las fuentes de datos adicionales se incorporarán progresivamente al núcleo de análisis.",
    ],
  };
}

function authorized(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  return Boolean(cronSecret && request.headers.get("authorization") === `Bearer ${cronSecret}`);
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!shouldSendToday()) return NextResponse.json({ ok: true, sent: false, reason: "Fuera del ciclo de 5 días" });
  return sendReport();
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return sendReport();
}

async function sendReport() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "ARQUÍMEDES <onboarding@resend.dev>";
  if (!apiKey) return NextResponse.json({ error: "RESEND_API_KEY no está configurada" }, { status: 500 });

  const report = await buildReport();
  const rows = report.summary.map((item, index) => `<li><strong>${String(index + 1).padStart(2, "0")}</strong> ${item}</li>`).join("");
  const robot = process.env.ARQUIMIDES_ROBOT_IMAGE_URL
    ? `<img src="${process.env.ARQUIMIDES_ROBOT_IMAGE_URL}" alt="ARQUÍMEDES" style="max-width:180px;height:auto;display:block;margin:0 auto 16px" />`
    : `<div style="width:72px;height:72px;border:1px solid #6ee7a0;border-radius:50%;margin:0 auto 16px;display:grid;place-items:center;font-size:34px;color:#6ee7a0">A</div>`;

  const html = `<div style="margin:0;padding:32px;background:#090d0c;color:#e9efe9;font-family:Arial,sans-serif"><div style="max-width:680px;margin:auto;border:1px solid #26342e;background:#101714"><div style="padding:28px 32px;border-bottom:1px solid #26342e;text-align:center">${robot}<div style="letter-spacing:4px;font-size:12px;color:#6ee7a0">SISTEMA OPERATIVO</div><h1 style="margin:10px 0 0;font-size:32px;letter-spacing:3px">ARQUÍMEDES</h1></div><div style="padding:32px"><div style="font-size:12px;color:#8b9a90;letter-spacing:2px">REPORTE ARQUIMIDES</div><h2 style="margin:8px 0 24px;font-size:22px">Información compilada y procesada</h2><ul style="padding:0;margin:0;list-style:none">${rows}</ul><p style="margin-top:32px;padding-top:20px;border-top:1px solid #26342e;color:#8b9a90;font-size:13px">Generado: ${report.generatedAt}</p></div></div></div>`;

  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [TO], subject: "Reporte Arquimides", html }) });
  const data = await response.json();
  if (!response.ok) return NextResponse.json({ error: data }, { status: response.status });
  return NextResponse.json({ ok: true, sent: true, id: data.id });
}
