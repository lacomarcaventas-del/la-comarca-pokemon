import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const { code, targetUserId, action } = await req.json();
  if (!code || !targetUserId || action !== "edit_user_role") return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.WALLET_EMAIL_FROM || process.env.EMAIL_FROM;
  if (!apiKey || !from) return NextResponse.json({ error: "Correo no configurado" }, { status: 503 });
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: authData } = await supabase.auth.admin.getUserById(targetUserId);
  const { data: adminUsers } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const admin = adminUsers.users.find(u => u.app_metadata?.role === "admin" || u.user_metadata?.role === "admin");
  if (!admin?.email) return NextResponse.json({ error: "No se encontró correo de administrador" }, { status: 503 });
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [admin.email], subject: "Código de confirmación — La Comarca", html: `<div style="font-family:Arial,sans-serif"><h2>Confirmación de administrador</h2><p>Se solicitó modificar el rol de un usuario en La Comarca.</p><p style="font-size:30px;font-weight:bold;letter-spacing:8px">${code}</p><p>Este código vence en 10 minutos y es de un solo uso.</p></div>` }) });
  if (!response.ok) return NextResponse.json({ error: "No se pudo enviar el correo" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
