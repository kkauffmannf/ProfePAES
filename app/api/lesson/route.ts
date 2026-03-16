import { NextRequest, NextResponse } from "next/server";
import { chatWithNova, NOVA_LITE } from "@/lib/bedrock";
import { getSubjectContext } from "@/lib/paes-content";

export async function POST(req: NextRequest) {
  try {
    const { subject, topic } = await req.json();

    if (!subject || !topic) {
      return NextResponse.json({ error: "subject and topic required" }, { status: 400 });
    }

    const subjectContext = getSubjectContext([subject]);

    const prompt = `Crea una mini-clase de preuniversitario sobre "${topic}" para la materia ${subject} de la PAES.

CONTEXTO PAES:
${subjectContext}

Responde en JSON con este formato exacto:
{
  "title": "${topic}",
  "intro": "Una oración motivadora para empezar la clase",
  "sections": [
    {
      "heading": "Nombre de la sección",
      "content": "Explicación clara y breve (3-5 oraciones). Usa ejemplos cotidianos chilenos."
    }
  ],
  "keyPoints": ["Punto clave 1", "Punto clave 2", "Punto clave 3"],
  "exercises": [
    {
      "id": "e1",
      "question": "Pregunta de nivel PAES con contexto aplicado",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "answer": "A",
      "explanation": "Explicación breve de por qué es esa la respuesta"
    }
  ],
  "tip": "Un consejo práctico para recordar este tema en la PAES"
}

REGLAS:
- La clase debe tener 2-3 secciones cortas (como si fuera un profe de preu explicando en la pizarra)
- Incluye exactamente 3 ejercicios de nivel PAES real con selección múltiple A-D
- Usa español chileno cercano, sin tecnicismos innecesarios
- Usa analogías de la vida diaria (la feria, el almacén, la micro, etc.)
- NO uses formato LaTeX. Escribe ecuaciones con ², ³, √, π, ×, ÷ directamente
- NO uses markdown (###, **, etc.)

REGLAS CRÍTICAS PARA EJERCICIOS (MUY IMPORTANTE):
- ANTES de escribir cada ejercicio, RESUELVE el problema tú mismo paso a paso mentalmente.
- El campo "answer" DEBE ser la letra de la opción MATEMÁTICAMENTE CORRECTA. VERIFICA con cálculo.
- Ejemplo: si la pregunta es "2/3 + 1/4", la respuesta es 8/12 + 3/12 = 11/12, NO 7/12.
- La "explanation" debe mostrar el cálculo paso a paso que llega a la respuesta correcta.
- Si una opción no coincide con tu cálculo, CAMBIA las opciones para que la correcta esté incluida.
- NUNCA pongas una respuesta incorrecta en el campo "answer". Esto confunde a los estudiantes.`;

    const result = await chatWithNova(
      [{ role: "user", content: prompt }],
      "Eres un profesor de preuniversitario chileno experto en la PAES. Responde SOLO con JSON válido, sin texto antes ni después.",
      NOVA_LITE,
      3000
    );

    // Parse JSON from response
    try {
      const parsed = JSON.parse(result.trim());
      return NextResponse.json(parsed);
    } catch {
      try {
        const codeBlock = result.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlock) {
          return NextResponse.json(JSON.parse(codeBlock[1].trim()));
        }
      } catch { /* continue */ }

      try {
        const start = result.indexOf("{");
        const end = result.lastIndexOf("}");
        if (start !== -1 && end > start) {
          return NextResponse.json(JSON.parse(result.substring(start, end + 1)));
        }
      } catch {
        console.error("Lesson JSON parse failed:", result.substring(0, 300));
      }
    }

    return NextResponse.json({ error: "No se pudo generar la clase" }, { status: 500 });
  } catch (error) {
    console.error("Lesson API error:", error);
    return NextResponse.json({ error: "Error al generar la clase" }, { status: 500 });
  }
}
