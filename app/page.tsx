"use client";

import { useState, useEffect } from "react";
import { useStudent } from "@/lib/student-context";
import DailyMission from "@/components/DailyMission";
import BottomNav from "@/components/BottomNav";
import { ChevronRight } from "lucide-react";

export default function Home() {
  const { student, updateStudent } = useStudent();
  const [nameInput, setNameInput] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (!student.onboardingComplete) {
      setShowWelcome(true);
    }
  }, [student.onboardingComplete]);

  const handleStartOnboarding = () => {
    if (nameInput.trim()) {
      updateStudent({ name: nameInput.trim(), onboardingComplete: true });
    } else {
      updateStudent({ onboardingComplete: true });
    }
    setShowWelcome(false);
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 flex flex-col items-center justify-center p-6">
        <div className="text-center mb-8 fade-in">
          <div className="text-6xl mb-4">🎓</div>
          <h1 className="text-3xl font-bold text-white mb-2">Profe PAES</h1>
          <p className="text-blue-200 text-lg">Tu preuniversitario gratis</p>
          <p className="text-blue-300 text-sm mt-2">Para estudiantes de todo Chile 🇨🇱</p>
        </div>

        <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl fade-in">
          <h2 className="text-xl font-bold text-gray-800 mb-1">¡Hola! ¿Cómo te llamas?</h2>
          <p className="text-gray-500 text-sm mb-5">
            Voy a ser tu tutor personal para la PAES. Puedes escribirme, hablarme y mandarme fotos de tus ejercicios.
          </p>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleStartOnboarding()}
            placeholder="Escribe tu nombre (opcional)"
            className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none border-2 border-transparent focus:border-blue-300 mb-4"
            autoFocus
          />
          <button
            onClick={handleStartOnboarding}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            ¡Empecemos!
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="mt-6 text-center text-blue-300 text-xs max-w-xs">
          Gratis, sin publicidad, sin datos personales. Solo tú y tu Profe PAES.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-blue-900">Profe PAES 🎓</h1>
            <p className="text-xs text-gray-400">Tu preu gratis, siempre contigo</p>
          </div>
          <div className="text-2xl">🇨🇱</div>
        </div>
        <DailyMission />
      </div>
      <BottomNav />
    </div>
  );
}
