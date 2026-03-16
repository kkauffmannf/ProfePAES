"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { StudyDay } from "./types";

export interface StudentState {
  studentId: string;
  name: string;
  gaps: Record<string, number>;
  targetSubjects: string[];
  studyPath: string;
  studyPlan: StudyDay[];
  currentDay: number;
  streak: number;
  onboardingComplete: boolean;
  diagnosticComplete: boolean;
}

const DEFAULT_STATE: Omit<StudentState, "studentId"> = {
  name: "",
  gaps: { M1: 0, M2: 0, CL: 0, CIENCIAS: 0, HIST: 0 },
  targetSubjects: [],
  studyPath: "mixto",
  studyPlan: [],
  currentDay: 1,
  streak: 0,
  onboardingComplete: false,
  diagnosticComplete: false,
};

interface StudentContextType {
  student: StudentState;
  updateStudent: (updates: Partial<StudentState>) => void;
  resetStudent: () => void;
}

const StudentContext = createContext<StudentContextType | null>(null);

function generateId(): string {
  return "stu_" + Math.random().toString(36).substring(2, 11);
}

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const [student, setStudent] = useState<StudentState>({
    studentId: "temp",
    ...DEFAULT_STATE,
  });
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage after mount (SSR-safe)
  useEffect(() => {
    const stored = localStorage.getItem("profe-paes-student");
    if (stored) {
      try {
        setStudent(JSON.parse(stored));
      } catch {
        setStudent({ studentId: generateId(), ...DEFAULT_STATE });
      }
    } else {
      setStudent({ studentId: generateId(), ...DEFAULT_STATE });
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage after hydration
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem("profe-paes-student", JSON.stringify(student));
    }
  }, [student, hydrated]);

  const updateStudent = (updates: Partial<StudentState>) => {
    setStudent((prev) => ({ ...prev, ...updates }));
  };

  const resetStudent = () => {
    const newState = { studentId: generateId(), ...DEFAULT_STATE };
    setStudent(newState);
    localStorage.removeItem("profe-paes-student");
  };

  return (
    <StudentContext.Provider value={{ student, updateStudent, resetStudent }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error("useStudent must be used inside StudentProvider");
  return ctx;
}
