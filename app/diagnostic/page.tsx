"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStudent } from "@/lib/student-context";
import DiagnosticTest from "@/components/DiagnosticTest";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { careers, subjects, DiagnosticQuestion } from "@/lib/paes-content";

const ALL_SUBJECTS = ["M1", "M2", "CL", "CIENCIAS", "HIST"];
const SUBJECT_EMOJI: Record<string, string> = {
  M1: "🔢", M2: "📐", CL: "📚", CIENCIAS: "🔬", HIST: "🗺️",
};

type Step = "intro" | "subjects" | "test" | "result" | "plan-generating";

export default function DiagnosticPage() {
  const router = useRouter();
  const { student, updateStudent } = useStudent();
  const [step, setStep] = useState<Step>("intro");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    student.targetSubjects.length > 0 ? student.targetSubjects : []
  );
  const [knowsCareer, setKnowsCareer] = useState<boolean | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<string>("");
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    if (step === "test" && questions.length === 0) {
      setLoadingQuestions(true);
      fetch("/api/diagnostic")
        .then((r) => r.json())
        .then((data) => {
          setQuestions(
            selectedSubjects.length > 0
              ? (data.questions as DiagnosticQuestion[]).filter((q) =>
                  selectedSubjects.includes(q.subject)
                )
              : data.questions
          );
        })
        .finally(() => setLoadingQuestions(false));
    }
  }, [step, selectedSubjects, questions.length]);

  const toggleSubject = (s: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleCareerSelect = (careerId: string) => {
    setSelectedCareer(careerId);
    const career = careers.find((c) => c.id === careerId);
    if (career) setSelectedSubjects(career.subjects);
  };

  const handleSubjectConfirm = () => {
    const subs =
      selectedSubjects.length > 0 ? selectedSubjects : ALL_SUBJECTS;
    updateStudent({ targetSubjects: subs });
    setSelectedSubjects(subs);
    setStep("test");
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDiagnosticComplete = async (result: any) => {
    setStep("plan-generating");
    try {
      const res = await fetch("/api/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gaps: result.gaps,
          targetSubjects:
            selectedSubjects.length > 0 ? selectedSubjects : ALL_SUBJECTS,
        }),
      });
      const planData = await res.json();
      updateStudent({
        studyPlan: planData.plan || [],
        gaps: result.gaps,
        studyPath: result.studyPath,
        currentDay: 1,
      });
    } catch (err) {
      console.error("Plan generation failed", err);
    } finally {
      setStep("result");
    }
  };

  if (step === "intro") {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 max-w-lg mx-auto">
          <Link href="/" className="text-gray-500"><ArrowLeft size={20} /></Link>
          <h1 className="font-bold text-blue-900">Diagnóstico</h1>
        </div>
        <div className="max-w-lg mx-auto px-4 pt-8 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Vamos a ver tu nivel</h2>
          <p className="text-gray-500 mb-2 leading-relaxed">
            7 preguntas rápidas para conocer tu nivel actual en cada materia.
          </p>
          <p className="text-gray-500 mb-8 text-sm leading-relaxed">
            No es una prueba de verdad — es para que yo sepa dónde empezar a ayudarte. No hay respuestas malas.
          </p>
          <button
            onClick={() => setStep("subjects")}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            Empecemos
            <ChevronRight size={18} />
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (step === "subjects") {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => setStep("intro")} className="text-gray-500"><ArrowLeft size={20} /></button>
          <h1 className="font-bold text-blue-900">¿Qué pruebas vas a dar?</h1>
        </div>
        <div className="max-w-lg mx-auto px-4 pt-6">
          {knowsCareer === null && (
            <div className="mb-6">
              <p className="text-gray-600 mb-4 text-sm">¿Ya sabes qué carrera quieres estudiar?</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setKnowsCareer(true)}
                  className="bg-white border-2 border-gray-200 rounded-xl p-4 text-sm font-medium hover:border-blue-300 transition-colors"
                >
                  ✅ Sí, ya sé
                </button>
                <button
                  onClick={() => setKnowsCareer(false)}
                  className="bg-white border-2 border-gray-200 rounded-xl p-4 text-sm font-medium hover:border-blue-300 transition-colors"
                >
                  🤔 No estoy seguro/a
                </button>
              </div>
            </div>
          )}

          {knowsCareer === true && (
            <div className="mb-6">
              <p className="text-gray-600 mb-3 text-sm">Elige la carrera y yo te digo qué pruebas necesitas:</p>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {careers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleCareerSelect(c.id)}
                    className={`text-left px-3 py-2 rounded-xl border-2 text-xs font-medium transition-colors ${
                      selectedCareer === c.id
                        ? "border-blue-400 bg-blue-50 text-blue-800"
                        : "border-gray-200 bg-white hover:border-blue-200"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
              {selectedCareer && (
                <div className="mt-3 bg-blue-50 rounded-xl p-3 text-sm text-blue-700">
                  Para {careers.find((c) => c.id === selectedCareer)?.name} necesitas:{" "}
                  <strong>{selectedSubjects.map((s) => subjects[s]?.name).join(", ")}</strong>
                </div>
              )}
              <button
                onClick={() => setKnowsCareer(null)}
                className="mt-3 text-xs text-gray-400 hover:text-gray-600"
              >
                ← Volver
              </button>
            </div>
          )}

          {knowsCareer === false && (
            <div className="mb-4">
              <p className="text-gray-600 mb-3 text-sm">No hay problema. Elige las materias que quieras preparar:</p>
              <div className="space-y-2">
                {ALL_SUBJECTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleSubject(s)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                      selectedSubjects.includes(s)
                        ? "border-blue-400 bg-blue-50 text-blue-800"
                        : "border-gray-200 bg-white hover:border-blue-200"
                    }`}
                  >
                    <span className="text-xl">{SUBJECT_EMOJI[s]}</span>
                    {subjects[s]?.name}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setKnowsCareer(null)}
                className="mt-3 text-xs text-gray-400 hover:text-gray-600"
              >
                ← Volver
              </button>
            </div>
          )}

          {(knowsCareer !== null) && (
            <button
              onClick={handleSubjectConfirm}
              disabled={selectedSubjects.length === 0}
              className="w-full btn-primary flex items-center justify-center gap-2 mt-4 disabled:opacity-40"
            >
              {selectedSubjects.length === 0 ? "Selecciona al menos una materia" : "Continuar al diagnóstico"}
              <ChevronRight size={18} />
            </button>
          )}
        </div>
        <BottomNav />
      </div>
    );
  }

  if (step === "test") {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => setStep("subjects")} className="text-gray-500"><ArrowLeft size={20} /></button>
          <h1 className="font-bold text-blue-900">Diagnóstico rápido</h1>
        </div>
        <div className="max-w-lg mx-auto">
          {loadingQuestions || questions.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-blue-600" />
            </div>
          ) : (
            <DiagnosticTest questions={questions} onComplete={handleDiagnosticComplete} />
          )}
        </div>
        <BottomNav />
      </div>
    );
  }

  if (step === "plan-generating") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
        <h2 className="text-lg font-bold text-gray-800">Creando tu plan personalizado...</h2>
        <p className="text-gray-500 text-sm mt-2">Un momentito, estoy analizando tus resultados 🧠</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 max-w-lg mx-auto">
        <h1 className="font-bold text-blue-900">Tu diagnóstico</h1>
      </div>
      <div className="max-w-lg mx-auto px-4 pt-4">
        <div className="bg-green-50 rounded-2xl p-5 mb-4 border border-green-100 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h2 className="text-xl font-bold text-green-800 mb-1">¡Tu plan está listo!</h2>
          <p className="text-green-700 text-sm">
            Creé un plan de estudio personalizado con misiones diarias basado en tus resultados.
          </p>
        </div>
        {student.studyPlan?.[0] && (
          <button
            onClick={() => router.push(`/lesson?subject=${student.studyPlan[0].subject}&topic=${encodeURIComponent(student.studyPlan[0].topic)}`)}
            className="w-full btn-primary flex items-center justify-center gap-2 text-sm mb-3 py-3"
          >
            🚀 Empezar primera clase: {student.studyPlan[0].topic}
          </button>
        )}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push("/plan")}
            className="bg-white border-2 border-blue-200 text-blue-700 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-blue-50 transition-colors"
          >
            📅 Ver mi plan
          </button>
          <button
            onClick={() => router.push("/chat")}
            className="bg-white border-2 border-blue-200 text-blue-700 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-blue-50 transition-colors"
          >
            💬 Hablar con el Profe
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
