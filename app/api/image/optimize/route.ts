import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_BYTES = 15 * 1024 * 1024;
const MAX_PIXELS = 40_000_000;
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp", "tiff", "heif", "avif"]);

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization") || "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    if (!token) return NextResponse.json({ error: "Se requiere una sesión activa." }, { status: 401 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "El servicio de imágenes no está configurado." }, { status: 503 });
    }
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: auth, error: authError } = await supabase.auth.getUser(token);
    if (authError || !auth.user) return NextResponse.json({ error: "Sesión no válida." }, { status: 401 });

    const { data: profile, error: profileError } = await supabase
      .from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
    if (profileError || !profile || !["admin", "agent"].includes(profile.role)) {
      return NextResponse.json({ error: "Acceso no autorizado." }, { status: 403 });
    }

    // Reject oversized multipart requests before buffering the body in memory.
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_BYTES + 1024 * 1024) {
      return NextResponse.json({ error: "La solicitud supera el límite permitido de 15 MB." }, { status: 413 });
    }

    const data = await request.formData();
    const file = data.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "No se recibió una imagen." }, { status: 400 });
    if (file.size <= 0 || file.size > MAX_BYTES) {
      return NextResponse.json({ error: "La imagen debe pesar entre 1 byte y 15 MB." }, { status: 413 });
    }

    const input = Buffer.from(await file.arrayBuffer());
    const image = sharp(input, { failOn: "error", limitInputPixels: MAX_PIXELS, animated: true });
    const metadata = await image.metadata();
    if (!metadata.format || !ALLOWED_FORMATS.has(metadata.format)) {
      return NextResponse.json({ error: "Formato no compatible. Utiliza JPEG, PNG, WebP, TIFF, HEIC o AVIF." }, { status: 415 });
    }
    if ((metadata.pages || 1) > 1) {
      return NextResponse.json({ error: "No se admiten imágenes animadas o multipágina. Exporta una fotografía fija." }, { status: 415 });
    }
    if (!metadata.width || !metadata.height || metadata.width * metadata.height > MAX_PIXELS) {
      return NextResponse.json({ error: "La resolución de la imagen supera el límite permitido." }, { status: 413 });
    }

    const output = await image.rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();

    return new NextResponse(new Uint8Array(output), {
      headers: {
        "Content-Type": "image/webp",
        "Content-Length": String(output.byteLength),
        "Cache-Control": "no-store",
        "X-Original-Bytes": String(file.size),
        "X-Optimized-Bytes": String(output.byteLength),
      },
    });
  } catch {
    return NextResponse.json({ error: "No se pudo procesar la imagen. Verifica que el archivo sea válido." }, { status: 422 });
  }
}
