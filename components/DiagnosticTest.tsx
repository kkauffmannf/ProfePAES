"use client";

import { useState } from "react";
import { ChevronRight, CheckCircle, XCircle, Loader2, BookOpen } from "lucide-react";
import { useStudent } from "@/lib/student-context";
import { DiagnosticQuestion } from "@/lib/paes-content";

const SUBJECT_LABELS: Record<string, string> = {
  M1: "Matemática M1",
  M2: "Matemática M2",
  CL: "Competencia Lectora",
  CIENCIAS: "Ciencias",
  HIST: "Historia",
};

const SUBJECT_EMOJI: Record<string, string> = {
  M1: "🔢",
  M2: "📐",
  CL: "📚",
  CIENCIAS: "🔬",
  HIST: "🗺️",
};

interface DiagnosticResult {
  gaps: Record<string, number>;
  recommendations: string;
  studyPath: string;
  wrongDetails: { questionId: string; subject: string; topic: string; explanation: string }[];
  totalQuestions: number;
  correctCount: number;
}

export default function DiagnosticTest({
  questions,
  onComplete,
}: {
  questions: DiagnosticQuestion[];
  onComplete: (result: DiagnosticResult) => void;
}) {
  const { updateStudent } = useStudent();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  const current = questions[currentIndex];
  const isAnswered = selectedOption !== null;
  const isCorrect = selectedOption === current?.answer;
  const progress = ((currentIndex) / questions.length) * 100;

  const handleSelect = (option: string) => {
    if (showExplanation) return;
    setSelectedOption(option);
    setShowExplanation(true);
    setAnswers((prev) => ({ ...prev, [current.id]: option }));
  };

  const handleNext = async () => {
    setSelectedOption(null);
    setShowExplanation(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/diagnostic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        });
        const raw = await res.json();
        if (raw.error) {
          alert(`Error diagnóstico: ${raw.detail || raw.error}`);
          return;
        }
        const data: DiagnosticResult = raw;
        setResult(data);
        updateStudent({
          gaps: data.gaps,
          studyPath: data.studyPath,
          diagnosticComplete: true,
        });
        onComplete(data);
      } catch (err) {
        console.error("Diagnostic submission failed", err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!current && !result) return null;

  if (result) {
    const score = Math.round((result.correctCount / result.totalQuestions) * 100);
    return (
      <div className="p-6 max-w-lg mx-auto fade-in">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">
            {score >= 70 ? "🌟" : score >= 40 ? "💪" : "🚀"}
          </div>
          <h2 className="text-2xl font-bold text-blue-900">
            {score >= 70 ? "¡Excelente base!" : score >= 40 ? "¡Buen punto de partida!" : "¡Por aquí empezamos!"}
          </h2>
          <p className="text-gray-500 mt-1">
            {result.correctCount} de {result.totalQuestions} correctas
          </p>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 mb-5 border border-blue-100">
          <p className="text-blue-800 text-sm leading-relaxed">{result.recommendations}</p>
        </div>

        <h3 className="font-semibold text-gray-700 mb-3">Tu nivel por materia:</h3>
        <div className="space-y-3 mb-6">
          {Object.entries(result.gaps).map(([subject, level]) => (
            <div key={subject}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">
                  {SUBJECT_EMOJI[subject]} {SUBJECT_LABELS[subject]}
                </span>
                <span className="text-gray-500">{level}/5</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(level / 5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {result.wrongDetails.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <BookOpen size={16} />
              Temas a reforzar:
            </h3>
            <div className="space-y-2">
              {result.wrongDetails.slice(0, 4).map((d) => (
                <div
                  key={d.questionId}
                  className="flex items-start gap-2 bg-amber-50 rounded-lg p-3 border border-amber-100"
                >
                  <span className="text-amber-500 mt-0.5">⚠️</span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{d.topic}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{d.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Pregunta {currentIndex + 1} de {questions.length}</span>
          <span>
            {SUBJECT_EMOJI[current.subject]} {SUBJECT_LABELS[current.subject]}
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-4 fade-in">
        <p className="text-gray-800 font-medium leading-relaxed">{current.question}</p>
      </div>

      <div className="space-y-3 mb-4">
        {current.options.map((option) => {
          const letter = option.split(")")[0].trim();
          let style =
            "w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ";
          if (!showExplanation) {
            style += "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50";
          } else if (letter === current.answer) {
            style += "border-green-400 bg-green-50 text-green-800";
          } else if (letter === selectedOption && letter !== current.answer) {
            style += "border-red-300 bg-red-50 text-red-700";
          } else {
            style += "border-gray-100 bg-gray-50 text-gray-400";
          }

          return (
            <button key={option} className={style} onClick={() => handleSelect(letter)}>
              <div className="flex items-center gap-3">
                {showExplanation && letter === current.answer && (
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                )}
                {showExplanation && letter === selectedOption && letter !== current.answer && (
                  <XCircle size={16} className="text-red-400 flex-shrink-0" />
                )}
                {(!showExplanation ||
                  (letter !== current.answer && letter !== selectedOption)) && (
                  <span className="w-4 flex-shrink-0" />
                )}
                {option}
              </div>
            </button>
          );
        })}
      </div>

      {showExplanation && (
        <div
          className={`rounded-xl p-4 mb-4 text-sm fade-in ${
            isAnswered && isCorrect
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-amber-50 border border-amber-200 text-amber-800"
          }`}
        >
          <p className="font-medium mb-1">
            {isCorrect ? "✅ ¡Correcto!" : "💡 Casi, vamos a verlo de otra forma:"}
          </p>
          <p>{current.explanation}</p>
        </div>
      )}

      {showExplanation && (
        <button
          onClick={handleNext}
          disabled={isSubmitting}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Analizando resultados...
            </>
          ) : currentIndex < questions.length - 1 ? (
            <>
              Siguiente pregunta
              <ChevronRight size={18} />
            </>
          ) : (
            <>
              Ver mi diagnóstico
              <ChevronRight size={18} />
            </>
          )}
        </button>
      )}
    </div>
  );
}
