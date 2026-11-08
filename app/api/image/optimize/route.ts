import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
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
