import { NextRequest, NextResponse } from "next/server";
import { analyzeImageWithNova } from "@/lib/bedrock";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, imageMediaType, question } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const prompt =
      question ||
      "Analiza esta imagen. Si es una pregunta o ejercicio de la PAES, explícame qué tema es, qué conceptos necesito saber y cómo se resuelve paso a paso. Si es un texto, ayúdame a entenderlo.";

    const response = await analyzeImageWithNova(
      imageBase64,
      imageMediaType || "image/jpeg",
      prompt
    );

    return NextResponse.json({ message: response });
  } catch (error) {
    console.error("Analyze API error:", error);
    return NextResponse.json(
      { error: "Error al analizar la imagen. Por favor intenta de nuevo." },
      { status: 500 }
    );
  }
}
