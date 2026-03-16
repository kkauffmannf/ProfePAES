"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, Calendar, ClipboardList } from "lucide-react";

const tabs = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/chat", label: "Profe", icon: MessageCircle },
  { href: "/plan", label: "Mi Plan", icon: Calendar },
  { href: "/diagnostic", label: "Test", icon: ClipboardList },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 max-w-lg mx-auto">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-colors min-w-[60px] ${
                active ? "text-blue-700" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-xs ${active ? "font-semibold" : ""}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
