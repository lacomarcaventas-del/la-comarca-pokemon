import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.WALLET_EMAIL_FROM;
  const to = process.env.WALLET_NOTIFICATION_EMAIL;
  if (!apiKey || !from || !to) {
    return NextResponse.json({ sent: false, reason: "EMAIL_NOT_CONFIGURED" }, { status: 202 });
  }

  const body = await req.json();
  const amount = Number(body.amount || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 });
  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto"><h2>Torre de los Magos</h2><p>Se registró una transferencia interna.</p><table><tr><td><b>Origen</b></td><td>${body.fromName}</td></tr><tr><td><b>Destino</b></td><td>${body.toName}</td></tr><tr><td><b>Importe</b></td><td>$${amount} MXN</td></tr><tr><td><b>Concepto</b></td><td>${body.note || "Movimiento interno"}</td></tr><tr><td><b>Fecha</b></td><td>${body.date}</td></tr><tr><td><b>ID</b></td><td>${body.transactionId}</td></tr></table></div>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject: `Wallet: ${body.fromName} → ${body.toName} · $${amount} MXN`, html }),
  });

  if (!response.ok) return NextResponse.json({ sent: false, reason: "EMAIL_SEND_FAILED" }, { status: 502 });
  const result = await response.json();
  return NextResponse.json({ sent: true, id: result.id });
}
