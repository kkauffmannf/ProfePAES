import { NextRequest, NextResponse } from "next/server";
import { runDiagnosticAnalysis } from "@/lib/bedrock";
import { diagnosticQuestions } from "@/lib/paes-content";

export async function GET() {
  return NextResponse.json({ questions: diagnosticQuestions });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { answers }: { answers: Record<string, string> } = body;

    if (!answers) {
      return NextResponse.json({ error: "No answers provided" }, { status: 400 });
    }

    const evaluatedAnswers = diagnosticQuestions.map((q) => ({
      questionId: q.id,
      subject: q.subject,
      correct: answers[q.id] === q.answer,
      topic: q.gap_if_wrong,
      explanation: q.explanation,
    }));

    const result = await runDiagnosticAnalysis(evaluatedAnswers);

    const wrongDetails = evaluatedAnswers
      .filter((a) => !a.correct)
      .map((a) => {
        const q = diagnosticQuestions.find((q) => q.id === a.questionId);
        return {
          questionId: a.questionId,
          subject: a.subject,
          topic: a.topic,
          explanation: q?.explanation || "",
        };
      });

    return NextResponse.json({
      ...result,
      wrongDetails,
      totalQuestions: diagnosticQuestions.length,
      correctCount: evaluatedAnswers.filter((a) => a.correct).length,
    });
  } catch (error) {
    console.error("Diagnostic API error:", error);
    return NextResponse.json(
      { error: "Error al procesar el diagnóstico." },
      { status: 500 }
    );
  }
}
