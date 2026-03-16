import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { StudentProvider } from "@/lib/student-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Profe PAES — Tu preuniversitario gratis",
  description: "Tutor IA gratuito para preparar la PAES 2026. Para estudiantes de todo Chile.",
};

export const viewport = {
  themeColor: "#1E3A8A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} antialiased bg-gray-50 text-gray-900`}>
        <StudentProvider>
          {children}
        </StudentProvider>
      </body>
    </html>
  );
}
