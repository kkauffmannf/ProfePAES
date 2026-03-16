"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ChatInterface from "@/components/ChatInterface";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getSubjectName } from "@/lib/paes-content";

function ChatContent() {
  const searchParams = useSearchParams();
  const subject = searchParams.get("subject") || undefined;
  const topic = searchParams.get("topic") || undefined;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-16">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 max-w-lg mx-auto w-full">
        <Link href="/" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="font-bold text-blue-900 text-sm">Profe PAES</h1>
          {subject && (
            <p className="text-xs text-gray-500">
              {getSubjectName(subject)}{topic ? ` · ${topic}` : ""}
            </p>
          )}
          {!subject && (
            <p className="text-xs text-gray-500">Escribe, habla o manda una foto</p>
          )}
        </div>
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">
          🎓
        </div>
      </div>
      <div className="flex-1 max-w-lg mx-auto w-full">
        <ChatInterface currentSubject={subject} />
      </div>
      <BottomNav />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Cargando...</div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
