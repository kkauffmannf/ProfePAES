import contentData from "@/data/paes-content.json";

export interface Unit {
  id: string;
  title: string;
  topics: string[];
  prerequisites: string[];
  daily_order: number;
  difficulty: string;
  paes_frequency: string;
}

export interface Subject {
  name: string;
  color: string;
  units: Unit[];
}

export interface Career {
  id: string;
  name: string;
  subjects: string[];
  category: string;
}

export interface DiagnosticQuestion {
  id: string;
  subject: string;
  level: string;
  question: string;
  options: string[];
  answer: string;
  gap_if_wrong: string;
  explanation: string;
}

export const subjects: Record<string, Subject> = contentData.subjects as Record<string, Subject>;
export const careers: Career[] = contentData.careers as Career[];
export const diagnosticQuestions: DiagnosticQuestion[] = contentData.diagnosticQuestions as DiagnosticQuestion[];

export function getSubjectContext(subjectIds: string[]): string {
  return subjectIds
    .map((id) => {
      const subject = subjects[id];
      if (!subject) return "";
      const units = subject.units
        .map((u) => `  - ${u.title}: ${u.topics.join(", ")}`)
        .join("\n");
      return `${subject.name}:\n${units}`;
    })
    .filter(Boolean)
    .join("\n\n");
}

export function getDaysUntilPAES(): number {
  const paesDate = new Date("2026-11-15");
  const today = new Date();
  const diff = Math.floor(
    (paesDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(diff, 0);
}

export function getSubjectColor(subjectId: string): string {
  return subjects[subjectId]?.color || "#6B7280";
}

export function getSubjectName(subjectId: string): string {
  return subjects[subjectId]?.name || subjectId;
}

export function getCareersForSubjects(subjectIds: string[]): Career[] {
  return careers.filter((career) =>
    subjectIds.some((s) => career.subjects.includes(s))
  );
}
