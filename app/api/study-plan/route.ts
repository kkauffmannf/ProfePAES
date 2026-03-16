import { NextRequest, NextResponse } from "next/server";
import { generateStudyPlan } from "@/lib/bedrock";
import { getDaysUntilPAES } from "@/lib/paes-content";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      gaps,
      targetSubjects,
    }: {
      gaps: Record<string, number>;
      targetSubjects: string[];
    } = body;

    if (!gaps || !targetSubjects || targetSubjects.length === 0) {
      return NextResponse.json(
        { error: "gaps and targetSubjects are required" },
        { status: 400 }
      );
    }

    const daysAvailable = getDaysUntilPAES();
    const result = await generateStudyPlan(gaps, targetSubjects, daysAvailable);

    return NextResponse.json({
      ...result,
      daysUntilPAES: daysAvailable,
    });
  } catch (error) {
    console.error("Study plan API error:", error);
    return NextResponse.json(
      { error: "Error al generar el plan de estudio." },
      { status: 500 }
    );
  }
}
