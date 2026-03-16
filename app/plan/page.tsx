"use client";

import { useState } from "react";
import { useStudent } from "@/lib/student-context";
import StudyCalendar from "@/components/StudyCalendar";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, RefreshCw, Loader2 } from "lucide-react";
import Link from "next/link";
import { getDaysUntilPAES } from "@/lib/paes-content";

export default function PlanPage() {
  const { student, updateStudent } = useStudent();
  const [regenerating, setRegenerating] = useState(false);
  const daysUntilPAES = getDaysUntilPAES();

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const res = await fetch("/api/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gaps: student.gaps,
          targetSubjects: student.targetSubjects,
        }),
      });
      const data = await res.json();
      updateStudent({ studyPlan: data.plan || [], currentDay: 1 });
    } catch (err) {
      console.error("Regenerate plan failed", err);
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 px-4 py-3 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-blue-900">Mi Plan de Estudio</h1>
            <p className="text-xs text-gray-400">{daysUntilPAES} días para la PAES de Verano</p>
          </div>
          {student.studyPlan?.length > 0 && (
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              title="Regenerar plan"
            >
              {regenerating ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <RefreshCw size={18} />
              )}
            </button>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4">
        {student.studyPlan?.length > 0 ? (
          <>
            <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700 font-medium">
                  📅 Día {student.currentDay} de {student.studyPlan.length}
                </span>
                <span className="text-blue-500">
                  Racha: 🔥 {student.streak} días
                </span>
              </div>
              <div className="progress-bar mt-2">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.round(
                      (student.currentDay / student.studyPlan.length) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
            <StudyCalendar />
          </>
        ) : (
          <div className="text-center py-16 px-4">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Tu plan está vacío
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Completa el diagnóstico primero y crearé un plan personalizado para ti.
            </p>
            <Link href="/diagnostic" className="btn-primary inline-flex items-center gap-2">
              Hacer diagnóstico
            </Link>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
