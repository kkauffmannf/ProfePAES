"use client";

import { useState, useEffect } from "react";
import { Flame, Calendar, Clock, ChevronRight, Trophy } from "lucide-react";
import { useStudent } from "@/lib/student-context";
import { getSubjectColor, getSubjectName, getDaysUntilPAES } from "@/lib/paes-content";
import Link from "next/link";

const SUBJECT_EMOJI: Record<string, string> = {
  M1: "🔢",
  M2: "📐",
  CL: "📚",
  CIENCIAS: "🔬",
  HIST: "🗺️",
};

export default function DailyMission() {
  const { student } = useStudent();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const daysUntilPAES = getDaysUntilPAES();
  const todayMission = student.studyPlan?.[student.currentDay - 1];
  const progress = student.studyPlan?.length
    ? Math.round((student.currentDay / student.studyPlan.length) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold">
              {mounted && student.name ? `¡Hola, ${student.name}!` : "¡Hola! 👋"}
            </h2>
            <p className="text-blue-200 text-sm">Tu preuniversitario gratis</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
              <Flame size={16} className="text-orange-300" />
              <span className="font-bold text-sm">{student.streak}</span>
              <span className="text-xs text-blue-200">días</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Calendar size={14} className="text-blue-300" />
          <span className="text-sm text-blue-200">
            {daysUntilPAES > 0
              ? `${daysUntilPAES} días para la PAES de Verano`
              : "¡Es día de PAES!"}
          </span>
        </div>

        <div className="progress-bar bg-white/20">
          <div
            className="progress-fill bg-white/80"
            style={{ width: `${Math.max(1, ((365 - daysUntilPAES) / 365) * 100)}%` }}
          />
        </div>
      </div>

      {mounted && todayMission ? (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Misión del día {student.currentDay}
            </span>
            <span
              className="text-xs font-medium px-2 py-1 rounded-full"
              style={{
                backgroundColor: getSubjectColor(todayMission.subject) + "20",
                color: getSubjectColor(todayMission.subject),
              }}
            >
              {SUBJECT_EMOJI[todayMission.subject]} {getSubjectName(todayMission.subject)}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">{todayMission.topic}</h3>
          <p className="text-gray-500 text-sm mb-4">{todayMission.mission}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <Clock size={14} />
              <span>{todayMission.duration} minutos</span>
            </div>
            <Link
              href={`/lesson?subject=${todayMission.subject}&topic=${encodeURIComponent(todayMission.topic)}`}
              className="flex items-center gap-1 btn-primary text-sm py-2 px-4"
            >
              Empezar
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
          <div className="text-4xl mb-3">📝</div>
          <h3 className="font-bold text-gray-800 mb-1">Completa tu diagnóstico</h3>
          <p className="text-gray-500 text-sm mb-4">
            Primero veamos cuál es tu nivel para crear tu plan personalizado.
          </p>
          <Link href="/diagnostic" className="btn-primary inline-flex items-center gap-2">
            Hacer diagnóstico
            <ChevronRight size={16} />
          </Link>
        </div>
      )}

      {mounted && student.targetSubjects?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Trophy size={16} className="text-amber-500" />
              Mis materias
            </span>
            {student.studyPlan?.length > 0 && (
              <span className="text-xs text-gray-400">
                Día {student.currentDay} de {student.studyPlan.length}
              </span>
            )}
          </div>
          <div className="space-y-2">
            {student.targetSubjects.map((s) => {
              const level = student.gaps[s] || 0;
              const levelPct = (level / 5) * 100;
              const nextMission = student.studyPlan?.find(
                (m, idx) => idx >= student.currentDay - 1 && m.subject === s
              );
              const defaultTopic = s === "M1" ? "Álgebra y funciones" : s === "M2" ? "Geometría y medición" : s === "CL" ? "Comprensión lectora" : s === "CIENCIAS" ? "Ciencias naturales" : "Historia y ciencias sociales";
              const lessonTopic = nextMission?.topic || defaultTopic;
              return (
                <Link
                  key={s}
                  href={`/lesson?subject=${s}&topic=${encodeURIComponent(lessonTopic)}`}
                  className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:border-blue-200 transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                    style={{ backgroundColor: getSubjectColor(s) + "15" }}
                  >
                    {SUBJECT_EMOJI[s]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-800">{getSubjectName(s)}</span>
                      <span className="text-xs font-bold" style={{ color: getSubjectColor(s) }}>
                        Nv. {level}/5
                      </span>
                    </div>
                    <div className="progress-bar mt-1 h-1.5">
                      <div
                        className="progress-fill h-1.5"
                        style={{ width: `${Math.max(5, levelPct)}%`, backgroundColor: getSubjectColor(s) }}
                      />
                    </div>
                    {nextMission && (
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        Siguiente: {nextMission.topic}
                      </p>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/chat"
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:border-blue-200 transition-colors"
        >
          <span className="text-2xl">💬</span>
          <span className="text-sm font-medium text-gray-700">Preguntarle al Profe</span>
        </Link>
        <Link
          href="/plan"
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:border-blue-200 transition-colors"
        >
          <span className="text-2xl">📅</span>
          <span className="text-sm font-medium text-gray-700">Ver mi plan</span>
        </Link>
      </div>
    </div>
  );
}
