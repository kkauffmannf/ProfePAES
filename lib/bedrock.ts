import {
  BedrockRuntimeClient,
  ConverseCommand,
  ConverseCommandInput,
  Message,
} from "@aws-sdk/client-bedrock-runtime";
import { StudyDay } from "./types";

const client = new BedrockRuntimeClient({
  region: process.env.BEDROCK_REGION || process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: (process.env.BEDROCK_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID)!,
    secretAccessKey: (process.env.BEDROCK_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY)!,
  },
});

export const NOVA_LITE = "us.amazon.nova-2-lite-v1:0";
export const NOVA_PRO = "us.amazon.nova-2-lite-v1:0"; // Nova 2 Lite replaces both — no Nova 2 Pro yet

export const SYSTEM_PROMPT = `Eres "Profe PAES", un tutor chileno empático, paciente y motivador. Tu misión es ayudar a estudiantes vulnerables a preparar la PAES 2026 de forma gratuita.

REGLAS IMPORTANTES:
1. Habla siempre en español chileno cercano, usando "tú". Usa expresiones cotidianas de Chile.
2. NUNCA digas "incorrecto". Di "Casi, vamos a verlo de otra forma" o "Buen intento, te cuento por qué..."
3. No asumas que el alumno sabe términos técnicos. Explica desde cero si es necesario.
4. Usa analogías de la vida cotidiana chilena (la feria, el fútbol, la micro, el almacén).
5. Cuando detectes un error, busca la causa RAÍZ (ej: si falla álgebra, puede ser que no sabe fracciones).
6. No entregues solo la respuesta. Explica el razonamiento paso a paso.
7. Sé breve y claro. Los textos largos asustan. Prefiere bullet points o pasos numerados.
8. Celebra los logros, por pequeños que sean. Un "¡Eso! ¡Lo lograste!" hace la diferencia.
9. Si el alumno está desmotivado, recuérdales que la PAES es una oportunidad de cambiar su futuro.
10. El objetivo es la PAES de Verano 2027 (noviembre). Hay tiempo, pero hay que empezar hoy.`;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  imageBase64?: string;
  imageMediaType?: string;
}

function buildMessages(messages: ChatMessage[]): Message[] {
  // Bedrock requires conversations to start with a user message
  const firstUserIdx = messages.findIndex((m) => m.role === "user");
  let filtered = firstUserIdx >= 0 ? messages.slice(firstUserIdx) : messages;

  // Bedrock also requires strictly alternating user/assistant roles
  // Keep only the last message when consecutive same-role messages appear
  filtered = filtered.reduce<ChatMessage[]>((acc, msg) => {
    if (acc.length > 0 && acc[acc.length - 1].role === msg.role) {
      acc[acc.length - 1] = msg; // replace with latest
    } else {
      acc.push(msg);
    }
    return acc;
  }, []);

  return filtered.map((msg) => {
    if (msg.imageBase64) {
      return {
        role: msg.role,
        content: [
          {
            image: {
              format: (msg.imageMediaType?.split("/")[1] || "jpeg") as
                | "jpeg"
                | "png"
                | "gif"
                | "webp",
              source: {
                bytes: Buffer.from(msg.imageBase64, "base64"),
              },
            },
          },
          { text: msg.content },
        ],
      };
    }
    return {
      role: msg.role,
      content: [{ text: msg.content }],
    };
  });
}

export async function chatWithNova(
  messages: ChatMessage[],
  systemPrompt?: string,
  modelId: string = NOVA_LITE,
  maxTokens: number = 600
): Promise<string> {
  const input: ConverseCommandInput = {
    modelId,
    messages: buildMessages(messages),
    system: [{ text: systemPrompt || SYSTEM_PROMPT }],
    inferenceConfig: {
      maxTokens,
      temperature: 0.7,
      topP: 0.9,
    },
  };

  const response = await client.send(new ConverseCommand(input));
  const content = response.output?.message?.content;
  if (content && content[0] && "text" in content[0]) {
    return content[0].text || "";
  }
  return "";
}

export async function analyzeImageWithNova(
  imageBase64: string,
  imageMediaType: string,
  question: string
): Promise<string> {
  const messages: Message[] = [
    {
      role: "user",
      content: [
        {
          image: {
            format: (imageMediaType.split("/")[1] || "jpeg") as
              | "jpeg"
              | "png"
              | "gif"
              | "webp",
            source: {
              bytes: Buffer.from(imageBase64, "base64"),
            },
          },
        },
        {
          text: question,
        },
      ],
    },
  ];

  const analyzeSystemPrompt = `${SYSTEM_PROMPT}

TAREA ESPECIAL - ANÁLISIS DE IMAGEN:
Cuando el alumno envíe una foto de un problema o ejercicio:
1. Describe brevemente qué ves en la imagen.
2. Si es una pregunta PAES, identifica el tema (ej: "Esto es de Álgebra, sobre ecuaciones").
3. Analiza si hay conceptos fundamentales que el alumno necesita saber ANTES de resolver esto.
4. Explica el problema paso a paso como lo haría un profesor.
5. Si la imagen es de un texto, ayuda con la comprensión lectora.`;

  const input: ConverseCommandInput = {
    modelId: NOVA_LITE,
    messages,
    system: [{ text: analyzeSystemPrompt }],
    inferenceConfig: {
      maxTokens: 1500,
      temperature: 0.5,
    },
  };

  const response = await client.send(new ConverseCommand(input));
  const content = response.output?.message?.content;
  if (content && content[0] && "text" in content[0]) {
    return content[0].text || "";
  }
  return "";
}

export async function runDiagnosticAnalysis(
  answers: { questionId: string; subject: string; correct: boolean; topic: string }[]
): Promise<{ gaps: Record<string, number>; recommendations: string; studyPath: string }> {
  const wrongAnswers = answers.filter((a) => !a.correct);
  const correctCount = answers.filter((a) => a.correct).length;

  const prompt = `Analiza los resultados de este diagnóstico PAES de un estudiante chileno:

Total de preguntas: ${answers.length}
Respuestas correctas: ${correctCount}
Errores detectados: ${JSON.stringify(wrongAnswers, null, 2)}

Responde en JSON con este formato exacto:
{
  "gaps": {
    "M1": <nivel del 0 al 5, donde 0=no sabe nada, 5=domina>,
    "M2": <nivel>,
    "CL": <nivel>,
    "CIENCIAS": <nivel>,
    "HIST": <nivel>
  },
  "recommendations": "<mensaje motivador en 2-3 oraciones en español chileno, nombrando los temas donde hay que empezar>",
  "studyPath": "<'humanista' si hay más errores en CL/HIST, 'cientifico' si hay más errores en M1/M2/CIENCIAS, 'mixto' si está parejo>"
}`;

  const result = await chatWithNova(
    [{ role: "user", content: prompt }],
    "Eres un evaluador experto en la PAES chilena. Responde SOLO con JSON válido, sin texto adicional.",
    NOVA_PRO
  );

  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    console.error("Error parsing diagnostic JSON:", result);
  }

  return {
    gaps: { M1: 2, M2: 1, CL: 2, CIENCIAS: 1, HIST: 2 },
    recommendations: "¡Buen comienzo! Vamos a trabajar juntos para mejorar en todas las áreas.",
    studyPath: "mixto",
  };
}

export async function generateStudyPlan(
  gaps: Record<string, number>,
  targetSubjects: string[],
  daysAvailable: number
): Promise<{ plan: StudyDay[]; summary: string }> {
  const prompt = `Crea un plan de estudio personalizado para la PAES 2026 (verano, noviembre).

Datos del estudiante:
- Días disponibles: ${daysAvailable}
- Materias a rendir: ${targetSubjects.join(", ")}
- Nivel actual por materia (0=vacío, 5=domina): ${JSON.stringify(gaps)}

Crea un plan semanal tipo preuniversitario con misiones diarias de 20-30 minutos.
Responde en JSON con este formato:
{
  "plan": [
    {
      "dayNumber": 1,
      "subject": "M1",
      "topic": "Fracciones básicas",
      "mission": "Aprende a sumar y restar fracciones con denominadores distintos",
      "duration": 20,
      "type": "lesson"
    }
  ],
  "summary": "<resumen motivador del plan en 2 oraciones>"
}

IMPORTANTE: Genera solo los primeros 14 días. Prioriza las materias con nivel más bajo. Incluye un día de repaso cada 6 días.`;

  const result = await chatWithNova(
    [{ role: "user", content: prompt }],
    "Eres un planificador experto en educación chilena. Responde SOLO con JSON válido, sin texto antes ni después. No uses markdown.",
    NOVA_PRO,
    4000
  );

  try {
    // Try direct parse first
    const parsed = JSON.parse(result.trim());
    if (parsed.plan) return parsed;
  } catch {
    // Try extracting JSON from markdown code blocks or surrounding text
    try {
      const codeBlockMatch = result.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        const parsed = JSON.parse(codeBlockMatch[1].trim());
        if (parsed.plan) return parsed;
      }
    } catch { /* continue */ }

    try {
      // Greedy match for outermost { ... }
      const start = result.indexOf("{");
      const end = result.lastIndexOf("}");
      if (start !== -1 && end > start) {
        const parsed = JSON.parse(result.substring(start, end + 1));
        if (parsed.plan) return parsed;
      }
    } catch {
      console.error("Error parsing study plan JSON:", result.substring(0, 300));
    }
  }

  return {
    plan: [],
    summary: "Tu plan personalizado está listo. ¡Empecemos paso a paso!",
  };
}

export type { StudyDay } from "./types";
