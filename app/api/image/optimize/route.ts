import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization") || "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    if (!token) return NextResponse.json({ error: "Se requiere una sesión activa." }, { status: 401 });
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wwqkeeducvxxvdpdxxnu.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_kPyc-lUnT2-pL9yUF-ITlg_Kr6Ylnwh"
    );
    const { data: auth, error: authError } = await supabase.auth.getUser(token);
    if (authError || !auth.user) return NextResponse.json({ error: "Sesión no válida." }, { status: 401 });
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
    if (!profile || !["admin", "agent"].includes(profile.role)) return NextResponse.json({ error: "Acceso no autorizado." }, { status: 403 });
    const data = await request.formData();
    const file = data.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "No se recibió una imagen." }, { status: 400 });
    if (file.size <= 0 || file.size > 15 * 1024 * 1024) return NextResponse.json({ error: "La imagen debe pesar entre 1 byte y 15 MB." }, { status: 413 });
    const input = Buffer.from(await file.arrayBuffer());
    const image = sharp(input, { failOn: "error", limitInputPixels: 40000000 });
    const metadata = await image.metadata();
    if (!metadata.format || !["jpeg", "png", "webp", "tiff", "gif", "heif", "avif", "svg"].includes(metadata.format)) {
      return NextResponse.json({ error: "Formato de imagen no compatible." }, { status: 415 });
    }
    const output = await image.rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 82, effort: 4 }).toBuffer();
    return new NextResponse(new Uint8Array(output), {
      headers: {
        "Content-Type": "image/webp",
        "Content-Length": String(output.byteLength),
        "Cache-Control": "no-store",
        "X-Original-Bytes": String(file.size),
        "X-Optimized-Bytes": String(output.byteLength),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "No se pudo procesar la imagen." }, { status: 422 });
  }
}
