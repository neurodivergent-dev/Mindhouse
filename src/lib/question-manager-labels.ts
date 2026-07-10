type TranslateFn = (key: string) => string;

export const normalizeDifficulty = (difficulty: string): string => {
  const mapping: Record<string, string> = {
    Easy: "Kolay",
    Medium: "Orta",
    Hard: "Zor",
    Kolay: "Kolay",
    Orta: "Orta",
    Zor: "Zor",
  };
  return mapping[difficulty] || difficulty;
};

export const mapDifficulty = (difficulty: string, t: TranslateFn): string => {
  const mapping: Record<string, string> = {
    Easy: t("difficultyEasy"),
    Medium: t("difficultyMedium"),
    Hard: t("difficultyHard"),
    Kolay: t("difficultyEasy"),
    Orta: t("difficultyMedium"),
    Zor: t("difficultyHard"),
  };
  return mapping[difficulty] || difficulty;
};

export const mapQuestionType = (type: string, t: TranslateFn): string => {
  const mapping: Record<string, string> = {
    "multiple-choice": t("typeMultipleChoice"),
    "true-false": t("typeTrueFalse"),
    calculation: t("typeCalculation"),
    "case-study": t("typeCaseStudy"),
    "Çoktan Seçmeli": t("typeMultipleChoice"),
    "Doğru/Yanlış": t("typeTrueFalse"),
    Hesaplama: t("typeCalculation"),
    "Vaka Çalışması": t("typeCaseStudy"),
  };
  return mapping[type] || type;
};

export const getFormTypeLabel = (type: string, t: TranslateFn): string => {
  const mapping: Record<string, string> = {
    "Çoktan Seçmeli": t("typeMultipleChoice"),
    "Doğru/Yanlış": t("typeTrueFalse"),
    Hesaplama: t("typeCalculation"),
    "Vaka Çalışması": t("typeCaseStudy"),
  };
  return mapping[type] || type;
};

export const getFormDifficultyLabel = (difficulty: string, t: TranslateFn): string => {
  const mapping: Record<string, string> = {
    Kolay: t("difficultyEasy"),
    Orta: t("difficultyMedium"),
    Zor: t("difficultyHard"),
  };
  return mapping[difficulty] || difficulty;
};

export const mapAiDifficulty = (difficulty: string, t: TranslateFn): string => {
  const mapping: Record<string, string> = {
    Başlangıç: t("difficultyBeginner"),
    Orta: t("difficultyMedium"),
    İleri: t("difficultyAdvanced"),
  };
  return mapping[difficulty] || difficulty;
};

export const getSubjectName = (name: string, tSubjects: TranslateFn): string => {
  const demoSubjectNames = [
    "Matematik",
    "Fizik",
    "Kimya",
    "Biyoloji",
    "Tarih",
    "Türk Dili ve Edebiyatı",
    "İngilizce",
  ];
  if (demoSubjectNames.includes(name)) {
    try {
      return tSubjects(name);
    } catch {
      return name;
    }
  }
  return name;
};
