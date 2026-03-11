import { NextResponse } from "next/server";
import { parseWhatsAppCapture } from "@/lib/placeholders/whatsapp";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const rawText = typeof body?.rawText === "string" ? body.rawText : "";

  return NextResponse.json({
    ok: true,
    message: "Placeholder listo para futura integración de WhatsApp.",
    parsed: parseWhatsAppCapture(rawText)
  });
}


