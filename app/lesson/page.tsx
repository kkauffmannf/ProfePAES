"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useStudent } from "@/lib/student-context";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, CheckCircle, XCircle, Loader2, MessageCircle, ChevronRight, Lightbulb, BookOpen } from "lucide-react";
import Link from "next/link";
import { getSubjectName } from "@/lib/paes-content";

const SUBJECT_EMOJI: Record<string, string> = {
  M1: "🔢", M2: "📐", CL: "📚", CIENCIAS: "🔬", HIST: "🗺️",
};

const SUBJECT_COLORS: Record<string, { from: string; to: string; accent: string }> = {
  M1: { from: "#1e40af", to: "#3b82f6", accent: "#93c5fd" },
  M2: { from: "#7c3aed", to: "#8b5cf6", accent: "#c4b5fd" },
  CL: { from: "#b45309", to: "#f59e0b", accent: "#fde68a" },
  CIENCIAS: { from: "#047857", to: "#10b981", accent: "#6ee7b7" },
  HIST: { from: "#be123c", to: "#f43f5e", accent: "#fda4af" },
};

function SubjectIllustration({ subject }: { subject: string }) {
  const colors = SUBJECT_COLORS[subject] || SUBJECT_COLORS.M1;
  const emoji = SUBJECT_EMOJI[subject] || "📖";

  return (
    <div
      className="relative rounded-2xl overflow-hidden mb-4"
      style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}
    >
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 160">
        <circle cx="350" cy="20" r="80" fill="white" />
        <circle cx="30" cy="140" r="50" fill="white" />
        <circle cx="200" cy="80" r="30" fill="white" />
        {subject === "M1" && (
          <>
            <text x="50" y="60" fontSize="24" fill="white" opacity="0.4" fontFamily="serif">∑</text>
            <text x="150" y="120" fontSize="20" fill="white" opacity="0.3" fontFamily="serif">∫</text>
            <text x="280" y="50" fontSize="28" fill="white" opacity="0.4" fontFamily="serif">π</text>
            <text x="320" y="130" fontSize="18" fill="white" opacity="0.3" fontFamily="serif">√x</text>
          </>
        )}
        {subject === "M2" && (
          <>
            <polygon points="180,30 220,110 140,110" fill="none" stroke="white" strokeWidth="2" opacity="0.3" />
            <rect x="280" y="60" width="50" height="50" fill="none" stroke="white" strokeWidth="2" opacity="0.3" transform="rotate(15 305 85)" />
            <circle cx="80" cy="80" r="30" fill="none" stroke="white" strokeWidth="2" opacity="0.3" />
          </>
        )}
        {subject === "CL" && (
          <>
            <rect x="40" y="40" width="60" height="80" rx="4" fill="none" stroke="white" strokeWidth="2" opacity="0.3" />
            <line x1="50" y1="60" x2="90" y2="60" stroke="white" strokeWidth="2" opacity="0.2" />
            <line x1="50" y1="72" x2="85" y2="72" stroke="white" strokeWidth="2" opacity="0.2" />
            <line x1="50" y1="84" x2="90" y2="84" stroke="white" strokeWidth="2" opacity="0.2" />
            <line x1="50" y1="96" x2="78" y2="96" stroke="white" strokeWidth="2" opacity="0.2" />
            <text x="200" y="90" fontSize="40" fill="white" opacity="0.3" fontFamily="serif">&quot;</text>
            <text x="300" y="70" fontSize="40" fill="white" opacity="0.3" fontFamily="serif">&quot;</text>
          </>
        )}
        {subject === "CIENCIAS" && (
          <>
            <circle cx="100" cy="80" r="15" fill="none" stroke="white" strokeWidth="2" opacity="0.3" />
            <circle cx="130" cy="60" r="10" fill="none" stroke="white" strokeWidth="2" opacity="0.3" />
            <line x1="112" y1="70" x2="122" y2="65" stroke="white" strokeWidth="2" opacity="0.3" />
            <path d="M260,120 L270,60 L280,120 Z" fill="none" stroke="white" strokeWidth="2" opacity="0.3" />
            <ellipse cx="270" cy="120" rx="15" ry="5" fill="none" stroke="white" strokeWidth="2" opacity="0.3" />
          </>
        )}
        {subject === "HIST" && (
          <>
            <path d="M60,110 L80,50 L100,80 L120,40 L140,70 L160,110" fill="none" stroke="white" strokeWidth="2" opacity="0.3" />
            <rect x="250" y="50" width="40" height="60" rx="2" fill="none" stroke="white" strokeWidth="2" opacity="0.3" />
            <line x1="270" y1="50" x2="270" y2="35" stroke="white" strokeWidth="2" opacity="0.3" />
            <rect x="265" y="30" width="10" height="8" fill="white" opacity="0.3" />
          </>
        )}
      </svg>
      <div className="relative px-5 py-6 flex items-center gap-4">
        <div className="text-5xl">{emoji}</div>
        <div>
          <div className="text-white/70 text-xs font-medium uppercase tracking-wider">Clase PAES</div>
          <div className="text-white font-bold text-lg leading-tight">{SUBJECT_EMOJI[subject]} {subject === "M1" ? "Matemática M1" : subject === "M2" ? "Matemática M2" : subject === "CL" ? "Comp. Lectora" : subject === "CIENCIAS" ? "Ciencias" : "Historia"}</div>
        </div>
      </div>
    </div>
  );
}

interface Exercise {
  id: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface Lesson {
  title: string;
  intro: string;
  sections: { heading: string; content: string }[];
  keyPoints: string[];
  exercises: Exercise[];
  tip: string;
}

function cleanText(text: string): string {
  return text
    .replace(/^#{1,4}\s+/gm, "")
    .replace(/\*\*\*(.+?)\*\*\*/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/\\\(|\\\)/g, "")
    .replace(/\\\[|\\\]/g, "")
    .replace(/\$\$?/g, "")
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "$1/$2")
    .replace(/\\sqrt\{([^}]*)\}/g, "√($1)")
    .replace(/\\pi/g, "π")
    .replace(/\\geq/g, "≥").replace(/\\leq/g, "≤").replace(/\\neq/g, "≠")
    .replace(/\\times/g, "×").replace(/\\div/g, "÷").replace(/\\cdot/g, "·")
    .replace(/\^2/g, "²").replace(/\^3/g, "³")
    .replace(/\^{2}/g, "²").replace(/\^{3}/g, "³")
    .replace(/\^{([^}]*)}/g, "^$1")
    .replace(/_{([^}]*)}/g, "$1");
}

function LessonContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { student, updateStudent } = useStudent();

  const subject = searchParams.get("subject") || "M1";
  const topic = searchParams.get("topic") || "";

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [step, setStep] = useState<"lecture" | "exercises" | "done">("lecture");
  const [currentExercise, setCurrentExercise] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    async function loadLesson() {
      try {
        const res = await fetch("/api/lesson", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject, topic }),
        });
        const data = await res.json();
        if (data.error) {
          setError(true);
        } else {
          setLesson(data);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadLesson();
  }, [subject, topic]);

  const handleAnswer = (letter: string) => {
    if (showExplanation || !lesson) return;
    setSelectedAnswer(letter);
    setShowExplanation(true);
    if (letter === lesson.exercises[currentExercise].answer) {
      setScore((s) => s + 1);
    }
  };

  const handleNextExercise = () => {
    if (!lesson) return;
    setSelectedAnswer(null);
    setShowExplanation(false);
    if (currentExercise < lesson.exercises.length - 1) {
      setCurrentExercise((i) => i + 1);
    } else {
      setStep("done");
      // Advance the student's current day
      updateStudent({ currentDay: student.currentDay + 1, streak: student.streak + 1 });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
        <h2 className="text-lg font-bold text-gray-800">Preparando tu clase...</h2>
        <p className="text-gray-500 text-sm mt-2">{SUBJECT_EMOJI[subject]} {topic}</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-lg font-bold text-gray-800 mb-2">No pude generar la clase</h2>
        <p className="text-gray-500 text-sm mb-6 text-center">
          Intenta de nuevo o pregúntale directo al Profe PAES.
        </p>
        <div className="flex gap-3">
          <button onClick={() => window.location.reload()} className="btn-primary text-sm py-2 px-4">
            Reintentar
          </button>
          <Link
            href={`/chat?subject=${subject}&topic=${encodeURIComponent(topic)}`}
            className="bg-white border-2 border-blue-200 text-blue-700 font-semibold py-2 px-4 rounded-xl text-sm"
          >
            💬 Ir al chat
          </Link>
        </div>
      </div>
    );
  }

  // DONE screen
  if (step === "done") {
    const total = lesson.exercises.length;
    const pct = Math.round((score / total) * 100);
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white border-b border-gray-200 px-4 py-3 max-w-lg mx-auto flex items-center gap-3">
          <Link href="/" className="text-gray-500"><ArrowLeft size={20} /></Link>
          <h1 className="font-bold text-blue-900">Clase completada</h1>
        </div>
        <div className="max-w-lg mx-auto px-4 pt-8 text-center fade-in">
          <div className="text-6xl mb-4">{pct >= 70 ? "🌟" : pct >= 40 ? "💪" : "🚀"}</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {pct >= 70 ? "¡Excelente clase!" : pct >= 40 ? "¡Buen trabajo!" : "¡Seguimos avanzando!"}
          </h2>
          <p className="text-gray-500 mb-1">{score} de {total} ejercicios correctos</p>
          <p className="text-sm text-gray-400 mb-6">
            {SUBJECT_EMOJI[subject]} {cleanText(lesson.title)}
          </p>

          {lesson.tip && (
            <div className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-100 text-left">
              <div className="flex items-start gap-2">
                <Lightbulb size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800">{cleanText(lesson.tip)}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push("/")}
              className="btn-primary text-sm py-3 flex items-center justify-center gap-2"
            >
              🏠 Volver al inicio
            </button>
            <Link
              href={`/chat?subject=${subject}&topic=${encodeURIComponent(topic)}`}
              className="bg-white border-2 border-blue-200 text-blue-700 font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2"
            >
              <MessageCircle size={16} />
              Preguntar dudas
            </Link>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // EXERCISES screen
  if (step === "exercises") {
    const ex = lesson.exercises[currentExercise];
    const isCorrect = selectedAnswer === ex.answer;
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white border-b border-gray-200 px-4 py-3 max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => setStep("lecture")} className="text-gray-500"><ArrowLeft size={20} /></button>
          <div className="flex-1">
            <h1 className="font-bold text-blue-900 text-sm">Ejercicios</h1>
            <p className="text-xs text-gray-400">{currentExercise + 1} de {lesson.exercises.length}</p>
          </div>
        </div>
        <div className="max-w-lg mx-auto px-4 pt-4">
          <div className="progress-bar mb-4">
            <div className="progress-fill" style={{ width: `${((currentExercise) / lesson.exercises.length) * 100}%` }} />
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-4 fade-in">
            <p className="text-gray-800 font-medium leading-relaxed text-sm">{cleanText(ex.question)}</p>
          </div>

          <div className="space-y-2 mb-4">
            {ex.options.map((opt) => {
              const letter = opt.charAt(0);
              let cls = "w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ";
              if (!showExplanation) {
                cls += "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50";
              } else if (letter === ex.answer) {
                cls += "border-green-400 bg-green-50 text-green-800";
              } else if (letter === selectedAnswer) {
                cls += "border-red-300 bg-red-50 text-red-700";
              } else {
                cls += "border-gray-100 bg-gray-50 text-gray-400";
              }

              return (
                <button key={opt} className={cls} onClick={() => handleAnswer(letter)}>
                  <div className="flex items-center gap-2">
                    {showExplanation && letter === ex.answer && <CheckCircle size={16} className="text-green-500" />}
                    {showExplanation && letter === selectedAnswer && letter !== ex.answer && <XCircle size={16} className="text-red-400" />}
                    {cleanText(opt)}
                  </div>
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div className={`rounded-xl p-4 mb-4 text-sm fade-in ${isCorrect ? "bg-green-50 border border-green-200 text-green-800" : "bg-amber-50 border border-amber-200 text-amber-800"}`}>
              <p className="font-medium mb-1">
                {isCorrect ? "✅ ¡Correcto!" : "💡 Veamos por qué:"}
              </p>
              <p>{cleanText(ex.explanation)}</p>
            </div>
          )}

          {showExplanation && (
            <button onClick={handleNextExercise} className="w-full btn-primary flex items-center justify-center gap-2">
              {currentExercise < lesson.exercises.length - 1 ? (
                <>Siguiente ejercicio <ChevronRight size={18} /></>
              ) : (
                <>Ver resultados <ChevronRight size={18} /></>
              )}
            </button>
          )}
        </div>
        <BottomNav />
      </div>
    );
  }

  // LECTURE screen (default)
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 px-4 py-3 max-w-lg mx-auto flex items-center gap-3">
        <Link href="/" className="text-gray-500"><ArrowLeft size={20} /></Link>
        <div className="flex-1">
          <h1 className="font-bold text-blue-900 text-sm">{SUBJECT_EMOJI[subject]} {getSubjectName(subject)}</h1>
          <p className="text-xs text-gray-400">{cleanText(lesson.title)}</p>
        </div>
        <div className="flex items-center gap-1 bg-blue-50 rounded-full px-2 py-1">
          <BookOpen size={12} className="text-blue-600" />
          <span className="text-xs text-blue-600 font-medium">Clase</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Hero illustration */}
        <SubjectIllustration subject={subject} />

        {/* Intro */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100 fade-in">
          <p className="text-sm text-gray-700 leading-relaxed">{cleanText(lesson.intro)}</p>
        </div>

        {/* Sections */}
        {lesson.sections.map((sec, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-3 fade-in">
            <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs text-blue-700 font-bold flex-shrink-0">
                {i + 1}
              </span>
              {cleanText(sec.heading)}
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {cleanText(sec.content)}
            </p>
          </div>
        ))}

        {/* Key Points */}
        {lesson.keyPoints && lesson.keyPoints.length > 0 && (
          <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100">
            <h3 className="text-sm font-bold text-blue-800 mb-2">📌 Puntos clave para recordar:</h3>
            <ul className="space-y-1">
              {lesson.keyPoints.map((p, i) => (
                <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  {cleanText(p)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tip */}
        {lesson.tip && (
          <div className="bg-amber-50 rounded-xl p-4 mb-5 border border-amber-100">
            <div className="flex items-start gap-2">
              <Lightbulb size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">{cleanText(lesson.tip)}</p>
            </div>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => setStep("exercises")}
          className="w-full btn-primary flex items-center justify-center gap-2 mb-3"
        >
          ¡A practicar! ({lesson.exercises.length} ejercicios)
          <ChevronRight size={18} />
        </button>

        <Link
          href={`/chat?subject=${subject}&topic=${encodeURIComponent(topic)}`}
          className="w-full bg-white border-2 border-blue-200 text-blue-700 font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
        >
          <MessageCircle size={16} />
          No entiendo, quiero preguntar
        </Link>
      </div>
      <BottomNav />
    </div>
  );
}

export default function LessonPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    }>
      <LessonContent />
    </Suspense>
  );
}
