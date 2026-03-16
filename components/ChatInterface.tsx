"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Camera, Send, Loader2, Volume2, X } from "lucide-react";
import { useStudent } from "@/lib/student-context";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  imagePreview?: string;
  timestamp: Date;
  suggestions?: string[];
}

function parseSuggestions(text: string): { cleanText: string; suggestions: string[] } {
  const suggestions: string[] = [];
  let cleanText = text
    .replace(/\[sugerencia:\s*(.+?)\]/gi, (_, s) => {
      suggestions.push(s.trim());
      return "";
    })
    .trim();

  // Strip any remaining markdown formatting
  cleanText = cleanText
    .replace(/^#{1,4}\s+/gm, "")        // ### headers → plain text
    .replace(/\*\*\*(.+?)\*\*\*/g, "$1") // ***bold italic*** → plain
    .replace(/\*\*(.+?)\*\*/g, "$1")     // **bold** → plain
    .replace(/\*(.+?)\*/g, "$1")         // *italic* → plain
    .replace(/`{1,3}[^`]*`{1,3}/g, (m) => m.replace(/`/g, "")) // `code` → plain
    .replace(/^[-*]\s+/gm, "• ")         // markdown bullets → bullet char
    .trim();

  // Strip LaTeX notation and convert to readable unicode
  cleanText = cleanText
    .replace(/\\\(|\\\)/g, "")           // \( and \) → remove
    .replace(/\\\[|\\\]/g, "")           // \[ and \] → remove
    .replace(/\$\$?/g, "")              // $ and $$ → remove
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "$1/$2") // \frac{a}{b} → a/b
    .replace(/\\sqrt\{([^}]*)\}/g, "√($1)")  // \sqrt{x} → √(x)
    .replace(/\\pi/g, "π")
    .replace(/\\geq/g, "≥").replace(/\\leq/g, "≤").replace(/\\neq/g, "≠")
    .replace(/\\times/g, "×").replace(/\\div/g, "÷").replace(/\\cdot/g, "·")
    .replace(/\^2/g, "²").replace(/\^3/g, "³")
    .replace(/\^{2}/g, "²").replace(/\^{3}/g, "³")
    .replace(/\^{([^}]*)}/g, "^$1")     // ^{n} → ^n
    .replace(/_{([^}]*)}/g, "$1")        // _{n} → n (subscript as plain)
    .replace(/\\\\/g, "")               // leftover backslashes
    .trim();

  return { cleanText, suggestions };
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any;
  }
}

export default function ChatInterface({ currentSubject }: { currentSubject?: string }) {
  const { student } = useStudent();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `¡Hola${student.name ? ` ${student.name}` : ""}! 👋 Soy tu Profe PAES. Puedes escribirme, hablarme o mandarme una foto. ¿En qué te ayudo?`,
      suggestions: ["Tengo una duda de mate", "Practicar ejercicios", "Explicame algo de lenguaje"],
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [pendingImage, setPendingImage] = useState<{ base64: string; preview: string; mediaType: string } | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string, imageBase64?: string, imageMediaType?: string, imagePreview?: string) => {
    if (!text.trim() && !imageBase64) return;
    setIsLoading(true);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text || "📷 Envié una imagen",
      imagePreview,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setPendingImage(null);

    try {
      let responseText = "";

      if (imageBase64) {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64, imageMediaType, question: text }),
        });
        const data = await res.json();
        responseText = data.message || data.error;
      } else {
        const history = messages.slice(-8).map((m) => ({
          role: m.role,
          content: m.content,
        }));
        history.push({ role: "user", content: text });

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history,
            studentId: student.studentId,
            currentSubject,
            gaps: student.gaps,
            targetSubjects: student.targetSubjects,
          }),
        });
        const data = await res.json();
        responseText = data.message || data.error;
      }

      const { cleanText, suggestions } = parseSuggestions(responseText);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: cleanText,
        suggestions,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Ups, tuve un problema de conexión. ¿Puedes intentarlo de nuevo?",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pendingImage) {
      sendMessage(input, pendingImage.base64, pendingImage.mediaType, pendingImage.preview);
    } else {
      sendMessage(input);
    }
  };

  const toggleVoice = () => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      alert("Tu navegador no soporta reconocimiento de voz. Prueba Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRec();
    recognition.lang = "es-CL";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.start();
    setIsListening(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const base64 = dataUrl.split(",")[1];
      setPendingImage({ base64, preview: dataUrl, mediaType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-CL";
      utterance.rate = 0.9;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex fade-in ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className="max-w-[85%]">
              {msg.role === "assistant" && (
                <div className="flex items-center gap-1 mb-1 ml-1">
                  <span className="text-xs text-gray-500">Profe PAES</span>
                </div>
              )}
              {msg.imagePreview && (
                <img
                  src={msg.imagePreview}
                  alt="Imagen enviada"
                  className="mb-2 rounded-lg max-w-[200px] border"
                />
              )}
              <div
                className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"
                }`}
              >
                {msg.content}
              </div>
              {msg.role === "assistant" && (
                <div className="flex items-center gap-2 mt-1 ml-1">
                  <button
                    onClick={() => speakText(msg.content)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    title="Escuchar respuesta"
                  >
                    <Volume2 size={14} className={isSpeaking ? "text-blue-600" : ""} />
                  </button>
                </div>
              )}
              {msg.role === "assistant" && msg.suggestions && msg.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 ml-1">
                  {msg.suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput("");
                        sendMessage(s);
                      }}
                      disabled={isLoading}
                      className="text-xs bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-colors disabled:opacity-40"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start fade-in">
            <div className="chat-bubble-ai px-4 py-3 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-blue-600" />
              <span className="text-sm text-gray-500">Profe PAES está pensando...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {pendingImage && (
        <div className="mx-4 mb-2 flex items-center gap-2 bg-blue-50 rounded-lg p-2 border border-blue-200">
          <img src={pendingImage.preview} alt="preview" className="h-12 w-12 object-cover rounded" />
          <span className="text-xs text-blue-700 flex-1">Imagen lista para enviar</span>
          <button onClick={() => setPendingImage(null)}>
            <X size={14} className="text-gray-400 hover:text-red-500" />
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="p-3 bg-white border-t border-gray-200 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0"
          title="Subir foto de ejercicio"
        >
          <Camera size={20} className="text-gray-600" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? "🎤 Escuchando..." : "Escríbeme tu duda..."}
          className={`flex-1 bg-gray-100 rounded-full px-4 py-3 text-sm outline-none border-2 transition-colors ${
            isListening ? "border-red-400 bg-red-50" : "border-transparent focus:border-blue-300"
          }`}
          disabled={isLoading}
        />

        <button
          type="button"
          onClick={toggleVoice}
          className={`p-3 rounded-full flex-shrink-0 transition-colors ${
            isListening
              ? "bg-red-500 text-white animate-pulse"
              : "bg-gray-100 hover:bg-gray-200 text-gray-600"
          }`}
          title={isListening ? "Parar grabación" : "Hablar con el tutor"}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        <button
          type="submit"
          disabled={isLoading || (!input.trim() && !pendingImage)}
          className="p-3 rounded-full bg-blue-700 text-white flex-shrink-0 disabled:opacity-40 hover:bg-blue-800 transition-colors"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
