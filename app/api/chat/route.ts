import { NextRequest, NextResponse } from "next/server";
import { chatWithNova, ChatMessage, NOVA_LITE } from "@/lib/bedrock";
import { getSubjectContext } from "@/lib/paes-content";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages,
      studentId,
      currentSubject,
      gaps,
      targetSubjects,
    }: {
      messages: ChatMessage[];
      studentId?: string;
      currentSubject?: string;
      gaps?: Record<string, number>;
      targetSubjects?: string[];
    } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    let contextualSystemPrompt = `Eres "Profe PAES", un tutor chileno empático y motivador que habla por chat como si fuera WhatsApp.

REGLAS DE FORMATO (MUY IMPORTANTE):
- Responde en MÁXIMO 3-4 oraciones cortas. Como un mensaje de WhatsApp, no un ensayo.
- Si necesitas explicar algo largo, da solo el primer paso y pregunta si quiere que sigas.
- Usa emojis con moderación (1-2 por mensaje máximo).
- Prefiere listas de 2-3 items si necesitas enumerar algo.
- NUNCA respondas con más de 80 palabras salvo que el alumno pida explícitamente una explicación larga.
- NUNCA uses formato markdown: nada de ###, **, ***, ni ningún símbolo de formato. Escribe texto plano como en WhatsApp.
- Para enfatizar, usa MAYÚSCULAS o emojis, no asteriscos.

REGLAS DE CONTENIDO:
- Esto es para la PAES (Prueba de Acceso a la Educación Superior) de Chile, nivel 4to medio.
- Cuando el alumno pida un ejercicio, da problemas de nivel PAES REAL con 4 alternativas (A, B, C, D).
- NUNCA des sumas, restas o multiplicaciones simples. Los ejercicios deben involucrar: ecuaciones, funciones, probabilidad, geometría, álgebra, comprensión lectora inferencial, análisis de textos, etc.
- Ejemplo de nivel correcto para M1: "Si f(x) = 2x + 3, cual es f(5)?" o problemas con porcentajes, razones, proporciones en contexto real.
- NUNCA uses notación LaTeX como \\( \\) o \\[ \\] o $. Escribe las ecuaciones en texto plano: f(x) = 3x² + 2, no \\(f(x) = 3x^2 + 2\\). Usa ², ³, √, ÷, ×, ≥, ≤, ≠, π directamente.
- Ejemplo para CL: dar un párrafo corto y preguntar por la idea principal o una inferencia.
- ANTES de dar un ejercicio, RESUELVE el cálculo mentalmente y VERIFICA que la respuesta correcta que indicas sea MATEMÁTICAMENTE CORRECTA.
- Habla en español chileno cercano, usando "tú".
- NUNCA digas "incorrecto". Di "Casi..." o "Buen intento, mira..."
- Usa analogías cotidianas chilenas (la feria, la micro, el almacén).
- No asumas conocimientos previos. Explica simple.
- Celebra los logros: "¡Eso! 💪"

REGLAS DE SUGERENCIAS:
- Al final de CADA respuesta, agrega una línea vacía y luego exactamente 2-3 opciones que el alumno puede elegir.
- Formato EXACTO de las sugerencias (una por línea):
[sugerencia: Explícame paso a paso]
[sugerencia: Dame un ejercicio]
[sugerencia: No entiendo, más simple]
- Las sugerencias deben ser relevantes al contexto de la conversación.
- SIEMPRE incluye las sugerencias, sin excepción.`;

    const subjectsToUse = currentSubject ? [currentSubject] : (targetSubjects?.length ? targetSubjects : []);
    if (subjectsToUse.length > 0) {
      const subjectContext = getSubjectContext(subjectsToUse);
      contextualSystemPrompt += `\n\nMATERIAS DEL ALUMNO: ${subjectsToUse.join(", ")}\nCONTENIDO PAES RELEVANTE (usa estos temas para ejercicios):\n${subjectContext}`;
    }

    if (gaps) {
      const weakAreas = Object.entries(gaps)
        .filter(([, level]) => level < 3)
        .map(([subject]) => subject);
      if (weakAreas.length > 0) {
        contextualSystemPrompt += `\n\nÁREAS DÉBILES DEL ALUMNO: ${weakAreas.join(", ")}. Presta especial atención a explicar los fundamentos de estas áreas.`;
      }
    }

    void studentId;

    const response = await chatWithNova(messages, contextualSystemPrompt, NOVA_LITE);

    return NextResponse.json({ message: response });
  } catch (error: unknown) {
    const e = error as Record<string, unknown>;
    console.error("Chat API error name:", e?.name);
    console.error("Chat API error message:", e?.message);
    console.error("Chat API error code:", e?.["$fault"], e?.["$metadata"]);
    return NextResponse.json(
      { error: "Error al conectar con el tutor. Por favor intenta de nuevo.", detail: String(e?.message) },
      { status: 500 }
    );
  }
}
