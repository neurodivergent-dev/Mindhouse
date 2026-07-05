/** Canonical difficulty values stored in DB / localStorage for AI-generated subjects. */
export const AI_SUBJECT_DIFFICULTIES = ["Başlangıç", "Orta", "İleri"] as const;

export type AiSubjectDifficulty = (typeof AI_SUBJECT_DIFFICULTIES)[number];

export interface AIGeneratedSubject {
  name: string;
  description: string;
  category: string;
  difficulty: AiSubjectDifficulty;
  topics: string[];
  learningObjectives: string[];
  estimatedDuration: string;
  prerequisites: string[];
  keywords: string[];
}