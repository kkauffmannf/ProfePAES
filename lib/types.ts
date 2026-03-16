export interface StudyDay {
  dayNumber: number;
  subject: string;
  topic: string;
  mission: string;
  duration: number;
  type: "lesson" | "practice" | "review";
}
