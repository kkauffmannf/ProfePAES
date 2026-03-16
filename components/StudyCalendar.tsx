"use client";

import { useStudent } from "@/lib/student-context";
import { getSubjectColor, getSubjectName } from "@/lib/paes-content";
import { CheckCircle, Lock, PlayCircle, ChevronRight } from "lucide-react";
import Link from "next/link";

const TYPE_LABEL: Record<string, string> = {
  lesson: "Lección",
  practice: "Práctica",
  review: "Repaso",
};

const SUBJECT_EMOJI: Record<string, string> = {
  M1: "🔢",
  M2: "📐",
  CL: "📚",
  CIENCIAS: "🔬",
  HIST: "🗺️",
};

export default function StudyCalendar() {
  const { student } = useStudent();
  const { studyPlan, currentDay } = student;

  if (!studyPlan || studyPlan.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="text-5xl mb-4">📅</div>
        <h3 className="font-bold text-gray-800 mb-2">Tu plan está en camino</h3>
        <p className="text-gray-500 text-sm">
          Completa el diagnóstico y selecciona tus materias para generar tu plan personalizado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {studyPlan.map((day, index) => {
        const isCompleted = day.dayNumber < currentDay;
        const isToday = day.dayNumber === currentDay;
        const isLocked = day.dayNumber > currentDay;
        const color = getSubjectColor(day.subject);

        const inner = (
          <>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
              style={{
                backgroundColor: isCompleted ? "#10B981" : isToday ? color : "#E5E7EB",
                color: isCompleted || isToday ? "white" : "#6B7280",
              }}
            >
              {isCompleted ? (
                <CheckCircle size={20} />
              ) : isToday ? (
                <PlayCircle size={20} />
              ) : (
                day.dayNumber
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-medium" style={{ color: isLocked ? "#9CA3AF" : color }}>
                  {SUBJECT_EMOJI[day.subject]} {getSubjectName(day.subject)}
                </span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-400">{TYPE_LABEL[day.type]}</span>
              </div>
              <p
                className={`text-sm font-medium truncate ${
                  isLocked ? "text-gray-400" : "text-gray-800"
                }`}
              >
                {day.topic}
              </p>
              {isToday && (
                <p className="text-xs text-blue-600 mt-0.5">{day.mission}</p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-gray-400">{day.duration}m</span>
              {isLocked ? (
                <Lock size={12} className="text-gray-300" />
              ) : (
                <ChevronRight size={14} className="text-gray-300" />
              )}
            </div>
          </>
        );

        const classes = `flex items-center gap-3 p-3 rounded-xl border transition-all ${
          isToday
            ? "bg-blue-50 border-blue-200 shadow-sm"
            : isCompleted
            ? "bg-gray-50 border-gray-100"
            : "bg-white border-gray-100"
        }`;

        if (isLocked) {
          return (
            <div key={`${day.dayNumber}-${index}`} className={classes}>
              {inner}
            </div>
          );
        }

        return (
          <Link
            key={`${day.dayNumber}-${index}`}
            href={`/lesson?subject=${day.subject}&topic=${encodeURIComponent(day.topic)}`}
            className={`${classes} hover:border-blue-300`}
          >
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
