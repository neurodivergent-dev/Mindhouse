import type { Subject } from "@/types/question-manager";

// Demo Data - Mindhouse AI-Powered Education Platform
// Rich demo data for jury presentation

export interface DemoPerformanceData {
  subject: string;
  averageScore: number;
  totalTests: number;
  weakTopics: string[];
  strongTopics: string[];
  lastUpdated: string;
}

export interface DemoQuizResult {
  id: string;
  subject: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  weakTopics: string[];
  createdAt: string;
}

export interface DemoTotalStats {
  totalTests: number;
  averageScore: number;
  totalTimeSpent: number;
  totalSubjects: number;
}

// Turkish Education System compatible demo subjects
export const demoSubjects: Subject[] = [
  {
    id: "subj_matematik_001",
    name: "Matematik",
    description: "Temel matematik konuları: Cebir, Geometri, Analiz",
    category: "Fen Bilimleri",
    difficulty: "Orta",
    questionCount: 3, // Actual demo questions count
    isActive: true,
  },
  {
    id: "subj_fizik_002",
    name: "Fizik",
    description: "Mekanik, Termodinamik, Elektrik ve Manyetizma",
    category: "Fen Bilimleri",
    difficulty: "Orta",
    questionCount: 3, // Actual demo questions count
    isActive: true,
  },
  {
    id: "subj_kimya_003",
    name: "Kimya",
    description: "Genel Kimya, Organik ve Anorganik Kimya",
    category: "Fen Bilimleri",
    difficulty: "Zor",
    questionCount: 2, // Actual demo questions count
    isActive: true,
  },
  {
    id: "subj_biyoloji_004",
    name: "Biyoloji",
    description: "Hücre Biyolojisi, Genetik, Ekoloji",
    category: "Fen Bilimleri",
    difficulty: "Orta",
    questionCount: 2, // Actual demo questions count
    isActive: true,
  },
  {
    id: "subj_tarih_005",
    name: "Tarih",
    description: "Türk Tarihi, Dünya Tarihi, Çağdaş Tarih",
    category: "Sosyal Bilimler",
    difficulty: "Kolay",
    questionCount: 2, // Actual demo questions count
    isActive: true,
  },
  {
    id: "subj_edebiyat_006",
    name: "Türk Dili ve Edebiyatı",
    description: "Dil Bilgisi, Klasik Edebiyat, Çağdaş Edebiyat",
    category: "Dil ve Edebiyat",
    difficulty: "Orta",
    questionCount: 2, // Actual demo questions count
    isActive: true,
  },
  {
    id: "subj_ingilizce_007",
    name: "İngilizce",
    description: "Grammar, Vocabulary, Reading Comprehension",
    category: "Yabancı Dil",
    difficulty: "Orta",
    questionCount: 2, // Actual demo questions count
    isActive: true,
  },
];

// Rich performance data
export const demoPerformanceData: DemoPerformanceData[] = [
  {
    subject: "Matematik",
    averageScore: 87,
    totalTests: 24,
    weakTopics: ["Türev Uygulamaları", "İntegral Hesabı", "Logaritma"],
    strongTopics: ["Geometri", "Cebir", "Analiz"],
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    subject: "Fizik",
    averageScore: 73,
    totalTests: 18,
    weakTopics: ["Elektrik ve Manyetizma", "Dalga Hareketi", "Modern Fizik"],
    strongTopics: ["Mekanik", "Termodinamik", "Elektrik"],
    lastUpdated: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },
  {
    subject: "Kimya",
    averageScore: 91,
    totalTests: 15,
    weakTopics: ["Organik Kimya", "Elektrokimya"],
    strongTopics: ["Kimyasal Reaksiyonlar", "Anorganik Kimya", "Kimyasal Bağlar"],
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    subject: "Biyoloji",
    averageScore: 82,
    totalTests: 21,
    weakTopics: ["Genetik", "Ekoloji", "Hücre Bölünmesi"],
    strongTopics: ["Hücre Biyolojisi", "Sistemler", "Dokular"],
    lastUpdated: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
  },
  {
    subject: "Tarih",
    averageScore: 95,
    totalTests: 32,
    weakTopics: ["Osmanlı Duraklama Dönemi"],
    strongTopics: ["Tarih", "Tarihsel Olaylar", "Tarihsel Süreçler"],
    lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
  },
  {
    subject: "Türk Dili ve Edebiyatı",
    averageScore: 89,
    totalTests: 28,
    weakTopics: ["Divan Edebiyatı", "Çağdaş Türk Edebiyatı"],
    strongTopics: ["Dil Bilgisi", "Edebiyat", "Çağdaş Edebiyat"],
    lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
  },
  {
    subject: "İngilizce",
    averageScore: 78,
    totalTests: 19,
    weakTopics: ["Grammar Tenses", "Reading Comprehension", "Vocabulary"],
    strongTopics: ["Yabancı Dil", "Gramatik", "Okuma"],
    lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
  },
];

// Final test results - Various performance levels
export const demoRecentResults: DemoQuizResult[] = [
  {
    id: "demo_res_1",
    subject: "Matematik",
    score: 19,
    totalQuestions: 20,
    timeSpent: 1800, // 30 minutes
    weakTopics: ["Türev Uygulamaları"],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: "demo_res_2",
    subject: "Tarih",
    score: 15,
    totalQuestions: 15,
    timeSpent: 900, // 15 dakika
    weakTopics: [],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },
  {
    id: "demo_res_3",
    subject: "Fizik",
    score: 12,
    totalQuestions: 20,
    timeSpent: 2400, // 40 dakika
    weakTopics: ["Elektrik ve Manyetizma", "Modern Fizik"],
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
  },
  {
    id: "demo_res_4",
    subject: "Kimya",
    score: 18,
    totalQuestions: 20,
    timeSpent: 1500, // 25 dakika
    weakTopics: ["Organik Kimya"],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: "demo_res_5",
    subject: "Biyoloji",
    score: 16,
    totalQuestions: 20,
    timeSpent: 1200, // 20 dakika
    weakTopics: ["Genetik", "Ekoloji"],
    createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(), // 1.5 days ago
  },
  {
    id: "demo_res_6",
    subject: "Türk Dili ve Edebiyatı",
    score: 17,
    totalQuestions: 20,
    timeSpent: 1800, // 30 dakika
    weakTopics: ["Divan Edebiyatı"],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: "demo_res_7",
    subject: "İngilizce",
    score: 14,
    totalQuestions: 20,
    timeSpent: 2100, // 35 dakika
    weakTopics: ["Grammar Tenses", "Vocabulary"],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
];

// Total stats
export const demoTotalStats: DemoTotalStats = {
  totalTests: 157, // High usage indicator
  averageScore: 84.2, // Good success rate
  totalTimeSpent: 4680, // 78 hours (in minutes)
  totalSubjects: 7, // Various subject areas
};

// AI Recommendations - Show AI features
export const demoAIRecommendations = [
  {
    id: "ai_rec_1",
    subject: "Matematik",
    recommendedDifficulty: "Orta" as const,
    reasoning:
      "Türev konusunda zorlandığınız gözlemlendi. Orta seviye sorularla pratik yapmanız önerilir.",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ai_rec_2",
    subject: "Fizik",
    recommendedDifficulty: "Kolay" as const,
    reasoning:
      "Elektrik konusunda temel kavramları pekiştirmeniz gerekiyor. Kolay sorularla başlayın.",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ai_rec_3",
    subject: "Tarih",
    recommendedDifficulty: "Zor" as const,
    reasoning:
      "Tarih konusunda çok başarılısınız! Zor seviye sorularla kendinizi daha da geliştirebilirsiniz.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Flashcard İlerleme Verileri
export const demoFlashcardProgress = {
  matematik_turev: {
    id: "flash_1",
    subject: "Matematik",
    cardId: "turev_temel",
    isKnown: true,
    reviewCount: 2,
    lastReviewed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  fizik_elektrik: {
    id: "flash_2",
    subject: "Fizik",
    cardId: "elektrik_temel",
    isKnown: false,
    reviewCount: 2,
    lastReviewed: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    nextReview: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
  },
  kimya_organik: {
    id: "flash_3",
    subject: "Kimya",
    cardId: "organik_baglanti",
    isKnown: true,
    reviewCount: 2,
    lastReviewed: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    nextReview: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
};

// Demo user profile
export const demoUser = {
  id: "demo_user_btk_2025",
  name: "Demo",
  email: "demo@mindhouse.com",
  isGuest: true,
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
  preferences: {
    defaultSubject: demoSubjects[0]?.name || "Matematik",
    questionsPerQuiz: 20,
    difficulty: "Orta" as const,
    theme: "system" as const,
  },
};

// Analytics Demo Data
export interface DemoAnalyticsData {
  totalQuestions: number;
  correctAnswers: number;
  averageScore: number;
  studyTime: number;
  streak: number;
  rank: number;
  totalUsers: number;
  improvement: number;
  weakTopics: string[];
  strongTopics: string[];
  topicsNeedingImprovement: string[];
  recentActivity: Array<{
    type: string;
    score: number;
    timestamp: string;
    subject?: string;
  }>;
  weeklyProgress: Array<{
    day: string;
    score: number;
    tests: number;
  }>;
  subjectDistribution: Array<{
    subject: string;
    percentage: number;
    color: string;
  }>;
  timeDistribution: Array<{
    hour: number;
    minutes: number;
  }>;
  difficultyBreakdown: Array<{
    level: string;
    correct: number;
    total: number;
  }>;
}

export const demoAnalyticsData: DemoAnalyticsData = {
  totalQuestions: 1247, // Impressive number
  correctAnswers: 1049, // 84.1% success rate
  averageScore: 84.2,
  studyTime: 4680, // 78 hours (in minutes)
  streak: 12, // 12 day study streak
  rank: 23, // Top 25
  totalUsers: 15847, // Platform user count
  improvement: 18.5, // 18.5% improvement
  weakTopics: [
    "Türev Uygulamaları",
    "Elektrik ve Manyetizma",
    "Organik Kimya",
    "Grammar Tenses",
    "Divan Edebiyatı",
  ],
  strongTopics: ["Tarih", "Geometri", "Anorganik Kimya", "Coğrafya", "Türk Dili"],
  topicsNeedingImprovement: ["Türev Uygulamaları", "Elektrik ve Manyetizma", "Organik Kimya"],
  recentActivity: [
    {
      type: "quiz",
      score: 95,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      subject: "Matematik",
    },
    {
      type: "flashcard",
      score: 88,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      subject: "Fizik",
    },
    {
      type: "quiz",
      score: 100,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      subject: "Tarih",
    },
    {
      type: "ai_chat",
      score: 92,
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      subject: "Kimya",
    },
    {
      type: "quiz",
      score: 75,
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      subject: "İngilizce",
    },
  ],
  weeklyProgress: [
    { day: "Pazartesi", score: 78, tests: 3 },
    { day: "Salı", score: 82, tests: 4 },
    { day: "Çarşamba", score: 85, tests: 5 },
    { day: "Perşembe", score: 88, tests: 4 },
    { day: "Cuma", score: 91, tests: 6 },
    { day: "Cumartesi", score: 87, tests: 3 },
    { day: "Pazar", score: 84, tests: 2 },
  ],
  subjectDistribution: [
    { subject: "Matematik", percentage: 28, color: "#3b82f6" },
    { subject: "Tarih", percentage: 22, color: "#10b981" },
    { subject: "Fizik", percentage: 18, color: "#f59e0b" },
    { subject: "Kimya", percentage: 15, color: "#ef4444" },
    { subject: "Türk Dili", percentage: 12, color: "#8b5cf6" },
    { subject: "İngilizce", percentage: 5, color: "#06b6d4" },
  ],
  timeDistribution: [
    { hour: 9, minutes: 45 }, // Morning work
    { hour: 14, minutes: 120 }, // Afternoon work
    { hour: 19, minutes: 90 }, // Evening work
    { hour: 21, minutes: 60 }, // Night work
  ],
  difficultyBreakdown: [
    { level: "Kolay", correct: 387, total: 425 }, // 91% success
    { level: "Orta", correct: 456, total: 542 }, // 84% success
    { level: "Zor", correct: 206, total: 280 }, // 74% success
  ],
};

// Utility functions
export const getDemoDataForUser = (userId: string) => ({
  performanceData: demoPerformanceData,
  recentResults: demoRecentResults,
  totalStats: demoTotalStats,
  aiRecommendations: demoAIRecommendations,
  flashcardProgress: demoFlashcardProgress,
  user: { ...demoUser, id: userId },
});

export const shouldUseDemoData = (): boolean => {
  if (typeof window === "undefined") {
    return false; // Return false during SSR for API mode
  }

  const urlParams = new URLSearchParams(window.location.search);
  const demoParam = urlParams.get("demo") === "true";
  const localStorageDemo = localStorage.getItem("demo_mode");

  // Default to false if no localStorage value is set - use API instead
  const shouldUseDemo = demoParam || localStorageDemo === "true";

  return shouldUseDemo;
};

// Demo mode on/off
export const toggleDemoMode = (enabled: boolean) => {
  if (typeof window !== "undefined") {
    if (enabled) {
      localStorage.setItem("demo_mode", "true");
      // Demo açıldığında demo sayfasındaki Start'ı da tetikle
      localStorage.setItem("demo_playing", "true");
    } else {
      // Demo kapatıldığında hem mode'u hem de demo sayfasındaki play state'ini sıfırla
      localStorage.removeItem("demo_mode");
      localStorage.setItem("demo_playing", "false");
      // Clear demo subjects and questions from localStorage to prevent them from showing up
      try {
        const subjects = localStorage.getItem("mindhouse_subjects");
        if (subjects) {
          const parsed = JSON.parse(subjects);
          const filtered = parsed.filter(
            (s: { createdBy?: string; id: string }) => s.createdBy !== "demo_user_btk_2025" && !s.id.startsWith("subj_"),
          );
          localStorage.setItem("mindhouse_subjects", JSON.stringify(filtered));
        }
        const questions = localStorage.getItem("mindhouse_questions");
        if (questions) {
          const parsed = JSON.parse(questions);
          const filtered = parsed.filter(
            (q: { id: string; createdBy?: string }) => !q.id.startsWith("q_") && q.createdBy !== "demo_user_btk_2025",
          );
          localStorage.setItem("mindhouse_questions", JSON.stringify(filtered));
        }
        // Force reload/rehydrate page to propagate cleaned storage changes
        window.location.reload();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }
  }
};

// Demo data loading function
export const loadDemoDataToLocalStorage = () => {
  if (typeof window === "undefined") {
    return;
  }

  const demoData = getDemoDataForUser(demoUser.id);

  // Demo data to localStorage
  localStorage.setItem("guestUser", JSON.stringify(demoData.user));
  localStorage.setItem("guestQuizResults", JSON.stringify(demoData.recentResults));
  localStorage.setItem("guestPerformanceData", JSON.stringify(demoData.performanceData));
  localStorage.setItem("guestFlashcardProgress", JSON.stringify(demoData.flashcardProgress));
  localStorage.setItem("guestAIRecommendations", JSON.stringify(demoData.aiRecommendations));
};

// Demo Questions
export const demoQuestions = {
  subj_matematik_001: [
    {
      id: "q_mat_001",
      subjectId: "subj_matematik_001",
      question: "f(x) = 2x + 3 fonksiyonunun f(5) değeri kaçtır?",
      options: ["11", "13", "15", "17"],
      correctAnswer: 1, // 13
      explanation: "f(5) = 2(5) + 3 = 10 + 3 = 13",
      difficulty: "Orta",
      tags: ["fonksiyon", "cebir"],
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "q_mat_002",
      subjectId: "subj_matematik_001",
      question: "Bir üçgenin iç açıları toplamı kaç derecedir?",
      options: ["90°", "180°", "270°", "360°"],
      correctAnswer: 1, // 180°
      explanation: "Üçgenin iç açıları toplamı her zaman 180 derecedir.",
      difficulty: "Başlangıç",
      tags: ["geometri", "üçgen"],
      createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "q_mat_003",
      subjectId: "subj_matematik_001",
      question: "∫(2x + 1)dx integralinin sonucu nedir?",
      options: ["x² + x + C", "2x² + x + C", "x² + C", "2x + C"],
      correctAnswer: 0, // x² + x + C
      explanation: "∫(2x + 1)dx = ∫2x dx + ∫1 dx = x² + x + C",
      difficulty: "İleri",
      tags: ["integral", "analiz"],
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  subj_fizik_002: [
    {
      id: "q_fiz_001",
      subjectId: "subj_fizik_002",
      question: "Newton'un ikinci yasası hangi formülle ifade edilir?",
      options: ["F = ma", "E = mc²", "P = mv", "W = Fd"],
      correctAnswer: 0, // F = ma
      explanation: "Newton'un ikinci yasası: Kuvvet = kütle × ivme (F = ma)",
      difficulty: "Orta",
      tags: ["newton", "kuvvet", "mekanik"],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "q_fiz_002",
      subjectId: "subj_fizik_002",
      question: "Işığın boşluktaki hızı yaklaşık kaç m/s'dir?",
      options: ["3×10⁶ m/s", "3×10⁷ m/s", "3×10⁸ m/s", "3×10⁹ m/s"],
      correctAnswer: 2, // 3×10⁸ m/s
      explanation: "Işığın boşluktaki hızı yaklaşık 3×10⁸ m/s (300.000.000 m/s)'dir.",
      difficulty: "Başlangıç",
      tags: ["ışık", "hız", "optik"],
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "q_fiz_003",
      subjectId: "subj_fizik_002",
      question: "Termodinamiğin birinci yasası hangi kavramı ifade eder?",
      options: ["Entropi artışı", "Enerji korunumu", "Momentum korunumu", "Kütle korunumu"],
      correctAnswer: 1, // Energy conservation
      explanation: "Termodinamiğin birinci yasası enerji korunumu ilkesini ifade eder.",
      difficulty: "İleri",
      tags: ["termodinamik", "enerji", "korunum"],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  subj_kimya_003: [
    {
      id: "q_kim_001",
      subjectId: "subj_kimya_003",
      question: "Periyodik tabloda 1. grupta bulunan elementler hangi isimle bilinir?",
      options: ["Halojenler", "Alkali metaller", "Soy gazlar", "Alkali toprak metaller"],
      correctAnswer: 1, // Alkali metals
      explanation: "1. grup elementleri alkali metaller olarak bilinir (Li, Na, K, Rb, Cs, Fr).",
      difficulty: "Orta",
      tags: ["periyodik tablo", "alkali metaller"],
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "q_kim_002",
      subjectId: "subj_kimya_003",
      question: "H₂O molekülünün geometrik şekli nedir?",
      options: ["Doğrusal", "Üçgen düzlemsel", "Bükülmüş", "Tetrahedron"],
      correctAnswer: 2, // Twisted
      explanation: "Su molekülü (H₂O) bükülmüş (angular) geometriye sahiptir.",
      difficulty: "İleri",
      tags: ["molekül geometrisi", "su", "hibridizasyon"],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  subj_tarih_005: [
    {
      id: "q_tar_001",
      subjectId: "subj_tarih_005",
      question: "Osmanlı İmparatorluğu hangi yılda kurulmuştur?",
      options: ["1299", "1326", "1354", "1389"],
      correctAnswer: 0, // 1299
      explanation: "Osmanlı İmparatorluğu 1299 yılında Osman Gazi tarafından kurulmuştur.",
      difficulty: "Başlangıç",
      tags: ["osmanlı", "kuruluş", "osman gazi"],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "q_tar_002",
      subjectId: "subj_tarih_005",
      question: "Türkiye Cumhuriyeti hangi tarihte ilan edilmiştir?",
      options: ["19 Mayıs 1919", "23 Nisan 1920", "30 Ağustos 1922", "29 Ekim 1923"],
      correctAnswer: 3, // 29 October 1923
      explanation: "Türkiye Cumhuriyeti 29 Ekim 1923 tarihinde ilan edilmiştir.",
      difficulty: "Orta",
      tags: ["cumhuriyet", "atatürk", "kuruluş"],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  subj_biyoloji_004: [
    {
      id: "q_bio_001",
      subjectId: "subj_biyoloji_004",
      question: "Fotosentez hangi organellerde gerçekleşir?",
      options: ["Mitokondri", "Kloroplast", "Ribozom", "Golgi cisimciği"],
      correctAnswer: 1, // Chloroplast
      explanation: "Fotosentez bitki hücrelerindeki kloroplastlarda gerçekleşir.",
      difficulty: "Orta",
      tags: ["fotosentez", "kloroplast", "bitki"],
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: "q_bio_002",
      subjectId: "subj_biyoloji_004",
      question: "DNA'nın yapısını ilk kez kim keşfetmiştir?",
      options: ["Darwin", "Mendel", "Watson ve Crick", "Pasteur"],
      correctAnswer: 2, // Watson ve Crick
      explanation: "DNA'nın çift sarmal yapısı Watson ve Crick tarafından keşfedilmiştir.",
      difficulty: "İleri",
      tags: ["dna", "watson", "crick", "genetik"],
      createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    },
  ],
  subj_edebiyat_006: [
    {
      id: "q_ede_001",
      subjectId: "subj_edebiyat_006",
      question: '"Kırmızı Saçlı Kadın" romanının yazarı kimdir?',
      options: ["Orhan Pamuk", "Yaşar Kemal", "Nazim Hikmet", "Sabahattin Ali"],
      correctAnswer: 0, // Orhan Pamuk
      explanation: '"Kırmızı Saçlı Kadın" romanı Nobel ödüllü yazar Orhan Pamuk\'a aittir.',
      difficulty: "Orta",
      tags: ["roman", "orhan pamuk", "çağdaş edebiyat"],
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
    {
      id: "q_ede_002",
      subjectId: "subj_edebiyat_006",
      question: "Divan Edebiyatı'nın en önemli nazım şekli hangisidir?",
      options: ["Gazel", "Koşma", "Türkü", "Mani"],
      correctAnswer: 0, // Gazel
      explanation: "Divan Edebiyatı'nın en önemli ve yaygın nazım şekli gazeldir.",
      difficulty: "İleri",
      tags: ["divan edebiyatı", "gazel", "nazım"],
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
  ],
  subj_ingilizce_007: [
    {
      id: "q_ing_001",
      subjectId: "subj_ingilizce_007",
      question: "Which sentence is grammatically correct?",
      options: [
        "She don't like coffee",
        "She doesn't likes coffee",
        "She doesn't like coffee",
        "She not like coffee",
      ],
      correctAnswer: 2, // She doesn't like coffee
      explanation: 'Third person singular uses "doesn\'t" and base form of verb.',
      difficulty: "Orta",
      tags: ["grammar", "present simple", "negative"],
      createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    },
    {
      id: "q_ing_002",
      subjectId: "subj_ingilizce_007",
      question: 'What is the past tense of "go"?',
      options: ["goed", "went", "gone", "going"],
      correctAnswer: 1, // went
      explanation: '"Go" is an irregular verb. Its past tense is "went".',
      difficulty: "Başlangıç",
      tags: ["irregular verbs", "past tense"],
      createdAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    },
  ],
};

// Map subject names to IDs
const subjectNameToId: Record<string, string> = {
  Matematik: "subj_matematik_001",
  Fizik: "subj_fizik_002",
  Kimya: "subj_kimya_003",
  Biyoloji: "subj_biyoloji_004",
  Tarih: "subj_tarih_005",
  "Türk Dili ve Edebiyatı": "subj_edebiyat_006",
  İngilizce: "subj_ingilizce_007",
  Mathematics: "subj_matematik_001",
  Physics: "subj_fizik_002",
  Chemistry: "subj_kimya_003",
  Biology: "subj_biyoloji_004",
  History: "subj_tarih_005",
  "Turkish Literature": "subj_edebiyat_006",
  English: "subj_ingilizce_007",
};

// Get demo questions for a specific subject (by name or ID)

const tMap: Record<string, string> = {
  "f(x) = 2x + 3 fonksiyonunun f(5) değeri kaçtır?":
    "What is the value of f(5) for the function f(x) = 2x + 3?",
  "Bir üçgenin iç açıları toplamı kaç derecedir?":
    "What is the sum of the interior angles of a triangle?",
  "∫(2x + 1)dx integralinin sonucu nedir?": "What is the result of the integral ∫(2x + 1)dx?",
  "Newton'un ikinci yasası hangi formülle ifade edilir?":
    "What formula expresses Newton's second law?",
  "Işığın boşluktaki hızı yaklaşık kaç m/s'dir?":
    "What is the approximate speed of light in a vacuum in m/s?",
  "Termodinamiğin birinci yasası hangi kavramı ifade eder?":
    "What concept does the first law of thermodynamics express?",
  "Periyodik tabloda 1. grupta bulunan elementler hangi isimle bilinir?":
    "What are the elements in group 1 of the periodic table called?",
  "H₂O molekülünün geometrik şekli nedir?": "What is the geometric shape of the H₂O molecule?",
  "pH değeri 2 olan bir çözelti nasıldır?": "What is a solution with a pH of 2?",
  "Fotosentez hangi organellerde gerçekleşir?": "In which organelles does photosynthesis occur?",
  "İnsan vücudundaki en uzun kemik hangisidir?": "What is the longest bone in the human body?",
  "DNA'nın yapısını ilk kez kim keşfetmiştir?": "Who first discovered the structure of DNA?",
  "Osmanlı İmparatorluğu hangi yılda kurulmuştur?": "In what year was the Ottoman Empire founded?",
  "Türkiye Cumhuriyeti hangi tarihte ilan edilmiştir?":
    "On what date was the Republic of Turkey proclaimed?",
  "Fransız İhtilali hangi yılda başlamıştır?": "In what year did the French Revolution begin?",
  '"Kırmızı Saçlı Kadın" romanının yazarı kimdir?':
    'Who is the author of the novel "The Red-Haired Woman"?',
  "Divan Edebiyatı'nın en önemli nazım şekli hangisidir?":
    "What is the most important verse form in Divan Literature?",
  "Aşağıdakilerden hangisi bir edebi akım değildir?":
    "Which of the following is not a literary movement?",
  "Which sentence is grammatically correct?": "Which sentence is grammatically correct?",
  'What is the past tense of "go"?': 'What is the past tense of "go"?',
  'Choose the correct synonym for "happy".': 'Choose the correct synonym for "happy".',
  fonksiyon: "function",
  cebir: "algebra",
  geometri: "geometry",
  üçgen: "triangle",
  integral: "integral",
  analiz: "calculus",
  newton: "newton",
  kuvvet: "force",
  mekanik: "mechanics",
  ışık: "light",
  hız: "speed",
  optik: "optics",
  termodinamik: "thermodynamics",
  enerji: "energy",
  korunum: "conservation",
  "periyodik tablo": "periodic table",
  "alkali metaller": "alkali metals",
  "molekül geometrisi": "molecular geometry",
  bağlar: "bonds",
  "asitler ve bazlar": "acids and bases",
  ph: "ph",
  fotosentez: "photosynthesis",
  hücre: "cell",
  anatomi: "anatomy",
  iskelet: "skeleton",
  genetik: "genetics",
  dna: "dna",
  osmanlı: "ottoman",
  kuruluş: "foundation",
  türkiye: "turkey",
  cumhuriyet: "republic",
  "avrupa tarihi": "european history",
  ihtilal: "revolution",
  "türk edebiyatı": "turkish literature",
  roman: "novel",
  "divan edebiyatı": "divan literature",
  şiir: "poetry",
  "edebi akımlar": "literary movements",
  teori: "theory",
  grammar: "grammar",
  tenses: "tenses",
  vocabulary: "vocabulary",
  synonyms: "synonyms",

  // Flashcard translations for English locale
  "Bir fonksiyonun türevi nedir?": "What is the derivative of a function?",
  "Bir fonksiyonun değişim hızını gösteren matematiksel kavramdır":
    "A mathematical concept that shows the rate of change of a function",
  "Türev, bir fonksiyonun belirli bir noktadaki anlık değişim hızını verir. f'(x) = lim(h→0) [f(x+h) - f(x)]/h":
    "The derivative gives the instantaneous rate of change of a function at a specific point. f'(x) = lim(h→0) [f(x+h) - f(x)]/h",
  "Pisagor teoremi nedir?": "What is the Pythagorean theorem?",
  "a² + b² = c² (dik üçgende hipotenüsün karesi, diğer kenarların karelerinin toplamına eşittir)":
    "a² + b² = c² (the square of the hypotenuse in a right triangle equals the sum of the squares of the other two sides)",
  "Dik üçgenlerde, hipotenüsün uzunluğunun karesi, diğer iki kenarın uzunluklarının karelerinin toplamına eşittir.":
    "In right triangles, the square of the hypotenuse equals the sum of the squares of the other two sides.",
  "Limit kavramı neyi ifade eder?": "What does the concept of a limit express?",
  "Bir fonksiyonun belirli bir değere yaklaşırken aldığı değeri ifade eder":
    "The value that a function approaches as it gets close to a specific value",
  "Limit, x değeri a'ya yaklaşırken f(x) fonksiyonunun yaklaştığı değerdir. Süreklilik ve türev kavramlarının temelini oluşturur.":
    "The limit is the value f(x) approaches as x approaches a. It is the foundation of continuity and derivatives.",
  "Fonksiyonun değişim hızı": "The rate of change of the function",
  "Fonksiyonun integrali": "The integral of the function",
  "Fonksiyonun tersi": "The inverse of the function",
  "Fonksiyonun kökü": "The root of the function",
  "a² + b² = c²": "a² + b² = c²",
  "a + b = c": "a + b = c",
  "a² - b² = c²": "a² - b² = c²",
  "a × b = c": "a × b = c",
  "Fonksiyonun yaklaştığı değer": "The value the function approaches",
  "Fonksiyonun maksimum değeri": "The maximum value of the function",
  "Fonksiyonun minimum değeri": "The minimum value of the function",
  "Fonksiyonun ortalama değeri": "The average value of the function",
  "Newton'un birinci yasası nedir?": "What is Newton's first law?",
  "Eylemsizlik yasası: Bir cisim üzerine net kuvvet etki etmediği sürece durgun halde durur veya düzgün doğrusal hareket yapar":
    "Law of inertia: An object remains at rest or in uniform straight-line motion unless acted upon by a net force",
  "Eylemsizlik yasası olarak da bilinir. Cisimler mevcut hareket durumlarını koruma eğilimindedir.":
    "Also known as the law of inertia. Objects tend to maintain their current state of motion.",
  "Eylemsizlik yasası": "Law of inertia",
  "F = ma": "F = ma",
  "Etki-tepki yasası": "Action-reaction law",
  "Kütle çekim yasası": "Law of universal gravitation",
  "Elektrik akımı nedir?": "What is electric current?",
  "Yüklü parçacıkların düzenli hareketi sonucu oluşan elektrik yükü akışıdır":
    "The flow of electric charge resulting from the orderly movement of charged particles",
  "Akım, birim zamanda bir kesiten geçen elektrik yükü miktarıdır. I = Q/t formülü ile hesaplanır.":
    "Current is the amount of electric charge passing through a cross-section per unit time. Calculated with I = Q/t.",
  "Yüklü parçacıkların hareketi": "Movement of charged particles",
  "Elektronların durması": "Electrons stopping",
  "Manyetik alan": "Magnetic field",
  "Işık hızı": "Speed of light",
  "Atom nedir?": "What is an atom?",
  "Maddenin kimyasal özelliklerini koruyan en küçük parçacığıdır":
    "The smallest particle that retains the chemical properties of matter",
  "Atom, proton, nötron ve elektronlardan oluşur. Kimyasal reaksiyonlarda bölünmez.":
    "An atom consists of protons, neutrons, and electrons. It is indivisible in chemical reactions.",
  "Maddenin en küçük parçacığı": "The smallest particle of matter",
  "Molekülün yarısı": "Half of a molecule",
  "Elektronun çekirdeği": "The nucleus of an electron",
  "İyonun tersi": "The opposite of an ion",
  "Fatih Sultan Mehmet hangi şehri fethetti?": "Which city did Fatih Sultan Mehmet conquer?",
  "İstanbul (Konstantinopolis) - 1453": "Istanbul (Constantinople) - 1453",
  "29 Mayıs 1453'te Konstantinopolis'i fethederek Bizans İmparatorluğu'na son verdi.":
    "On May 29, 1453, he conquered Constantinople and ended the Byzantine Empire.",
  İstanbul: "Istanbul",
  Ankara: "Ankara",
  Bursa: "Bursa",
  İzmir: "Izmir",
  "Hücrenin enerji merkezi hangisidir?": "What is the energy center of the cell?",
  Mitokondri: "Mitochondria",
  "Mitokondri, hücresel solunumla ATP üretir ve hücrenin enerji ihtiyacını karşılar.":
    "Mitochondria produce ATP through cellular respiration and meet the cell's energy needs.",
  Kloroplast: "Chloroplast",
  Ribozom: "Ribosome",
  Çekirdek: "Nucleus",
  "Türk edebiyatının ilk romanı hangisidir?": "What is the first novel in Turkish literature?",
  "Taaşşuk-u Talat ve Fitnat (Şemsettin Sami)": "Taaşşuk-u Talat ve Fitnat (Şemsettin Sami)",
  "1872'de yazılan bu eser, Türk edebiyatının ilk romanı kabul edilir.":
    "Written in 1872, this work is considered the first novel in Turkish literature.",
  "Araba Sevdası": "Araba Sevdası",
  "Mai ve Siyah": "Mai ve Siyah",
  "Aşk-ı Memnu": "Aşk-ı Memnu",
  'What is the past tense of "bring"?': 'What is the past tense of "bring"?',
  Brought: "Brought",
  '"Bring" is an irregular verb. Past tense: brought, Past participle: brought':
    '"Bring" is an irregular verb. Past tense: brought, Past participle: brought',
  Bringed: "Bringed",
  Brung: "Brung",
  Brang: "Brang",
};

export const translateDemoData = <T>(data: T, locale?: string): T => {
  if (locale !== "en" || !data) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => translateDemoData(item, locale)) as unknown as T;
  }
  if (typeof data === "object") {
    const translated = { ...data } as Record<string, unknown>;
    if (translated.question && typeof translated.question === "string" && tMap[translated.question]) {
      translated.question = tMap[translated.question];
    }
    if (translated.answer && typeof translated.answer === "string" && tMap[translated.answer]) {
      translated.answer = tMap[translated.answer];
    }
    if (translated.explanation && typeof translated.explanation === "string" && tMap[translated.explanation]) {
      translated.explanation = tMap[translated.explanation];
    }
    if (translated.tags && Array.isArray(translated.tags)) {
      translated.tags = translated.tags.map((tag: string) => tMap[tag] || tag);
    }
    if (
      translated.topic &&
      typeof translated.topic === "string" &&
      tMap[translated.topic.toLowerCase()]
    ) {
      translated.topic = tMap[translated.topic.toLowerCase()];
    }
    if (translated.options && Array.isArray(translated.options)) {
      translated.options = translated.options.map((opt: Record<string, unknown>) => {
        if (opt?.text && typeof opt.text === "string" && tMap[opt.text]) {
          return { ...opt, text: tMap[opt.text] };
        }
        return opt;
      });
    }
    return translated as unknown as T;
  }
  return data;
};

export const getDemoQuestions = (subjectNameOrId: string, locale?: string) => {
  // If it's already an ID, use it directly
  let subjectId = subjectNameOrId;

  // If it's a name, convert to ID
  if (subjectNameToId[subjectNameOrId]) {
    subjectId = subjectNameToId[subjectNameOrId];
  }

  return translateDemoData(demoQuestions[subjectId as keyof typeof demoQuestions] || [], locale);
};

// Get all demo questions
export const getAllDemoQuestions = (locale?: string) =>
  translateDemoData(Object.values(demoQuestions).flat(), locale);

// Get localized demo subjects (for empty states / subject lists in Question Manager etc.)
export const getDemoSubjects = (locale?: string): Subject[] => {
  if (locale !== "en") {
    return demoSubjects;
  }

  // English translations for demo subject metadata (name stays as canonical key
  // so that useTranslations("Subjects") can resolve the display name)
  const descriptionTranslations: Record<string, string> = {
    "Temel matematik konuları: Cebir, Geometri, Analiz":
      "Fundamental math topics: Algebra, Geometry, Calculus",
    "Mekanik, Termodinamik, Elektrik ve Manyetizma":
      "Mechanics, Thermodynamics, Electricity and Magnetism",
    "Genel Kimya, Organik ve Anorganik Kimya": "General Chemistry, Organic and Inorganic Chemistry",
    "Hücre Biyolojisi, Genetik, Ekoloji": "Cell Biology, Genetics, Ecology",
    "Türk Tarihi, Dünya Tarihi, Çağdaş Tarih":
      "Turkish History, World History, Contemporary History",
    "Dil Bilgisi, Klasik Edebiyat, Çağdaş Edebiyat":
      "Grammar, Classical Literature, Contemporary Literature",
    "Grammar, Vocabulary, Reading Comprehension": "Grammar, Vocabulary, Reading Comprehension",
  };

  const categoryTranslations: Record<string, string> = {
    "Fen Bilimleri": "Science",
    "Sosyal Bilimler": "Social Sciences",
    "Dil ve Edebiyat": "Language and Literature",
    "Yabancı Dil": "Foreign Language",
  };

  const difficultyTranslations: Record<string, string> = {
    Kolay: "Easy",
    Orta: "Medium",
    Zor: "Hard",
    İleri: "Advanced",
  };

  return demoSubjects.map((subject) => ({
    ...subject,
    // Keep canonical name (e.g. "Matematik") so t("Subjects.xxx") lookups work
    // Display name comes from Subjects translations
    name: subject.name,
    description: descriptionTranslations[subject.description] || subject.description,
    category: categoryTranslations[subject.category] || subject.category,
    difficulty: difficultyTranslations[subject.difficulty] || subject.difficulty,
  }));
};

// Demo Flashcards
export const demoFlashcards = {
  Matematik: [
    {
      id: "fc_mat_001",
      question: "Bir fonksiyonun türevi nedir?",
      answer: "Bir fonksiyonun değişim hızını gösteren matematiksel kavramdır",
      explanation:
        "Türev, bir fonksiyonun belirli bir noktadaki anlık değişim hızını verir. f'(x) = lim(h→0) [f(x+h) - f(x)]/h",
      topic: "Türev",
      difficulty: "Orta",
      reviewCount: 2,
      confidence: 4,
      options: [
        { text: "Fonksiyonun değişim hızı", isCorrect: true },
        { text: "Fonksiyonun integrali", isCorrect: false },
        { text: "Fonksiyonun tersi", isCorrect: false },
        { text: "Fonksiyonun kökü", isCorrect: false },
      ],
    },
    {
      id: "fc_mat_002",
      question: "Pisagor teoremi nedir?",
      answer:
        "a² + b² = c² (dik üçgende hipotenüsün karesi, diğer kenarların karelerinin toplamına eşittir)",
      explanation:
        "Dik üçgenlerde, hipotenüsün uzunluğunun karesi, diğer iki kenarın uzunluklarının karelerinin toplamına eşittir.",
      topic: "Geometri",
      difficulty: "Başlangıç",
      reviewCount: 2,
      confidence: 3,
      options: [
        { text: "a² + b² = c²", isCorrect: true },
        { text: "a + b = c", isCorrect: false },
        { text: "a² - b² = c²", isCorrect: false },
        { text: "a × b = c", isCorrect: false },
      ],
    },
    {
      id: "fc_mat_003",
      question: "Limit kavramı neyi ifade eder?",
      answer: "Bir fonksiyonun belirli bir değere yaklaşırken aldığı değeri ifade eder",
      explanation:
        "Limit, x değeri a'ya yaklaşırken f(x) fonksiyonunun yaklaştığı değerdir. Süreklilik ve türev kavramlarının temelini oluşturur.",
      topic: "Limit",
      difficulty: "İleri",
      reviewCount: 1,
      confidence: 3,
      options: [
        { text: "Fonksiyonun yaklaştığı değer", isCorrect: true },
        { text: "Fonksiyonun maksimum değeri", isCorrect: false },
        { text: "Fonksiyonun minimum değeri", isCorrect: false },
        { text: "Fonksiyonun ortalama değeri", isCorrect: false },
      ],
    },
  ],
  Fizik: [
    {
      id: "fc_fiz_001",
      question: "Newton'un birinci yasası nedir?",
      answer:
        "Eylemsizlik yasası: Bir cisim üzerine net kuvvet etki etmediği sürece durgun halde durur veya düzgün doğrusal hareket yapar",
      explanation:
        "Eylemsizlik yasası olarak da bilinir. Cisimler mevcut hareket durumlarını koruma eğilimindedir.",
      topic: "Mekanik",
      difficulty: "Orta",
      reviewCount: 3,
      confidence: 4,
      options: [
        { text: "Eylemsizlik yasası", isCorrect: true },
        { text: "F = ma", isCorrect: false },
        { text: "Etki-tepki yasası", isCorrect: false },
        { text: "Kütle çekim yasası", isCorrect: false },
      ],
    },
    {
      id: "fc_fiz_002",
      question: "Elektrik akımı nedir?",
      answer: "Yüklü parçacıkların düzenli hareketi sonucu oluşan elektrik yükü akışıdır",
      explanation:
        "Akım, birim zamanda bir kesiten geçen elektrik yükü miktarıdır. I = Q/t formülü ile hesaplanır.",
      topic: "Elektrik",
      difficulty: "Orta",
      reviewCount: 2,
      confidence: 3,
      options: [
        { text: "Yüklü parçacıkların hareketi", isCorrect: true },
        { text: "Elektronların durması", isCorrect: false },
        { text: "Manyetik alan", isCorrect: false },
        { text: "Işık hızı", isCorrect: false },
      ],
    },
  ],
  Kimya: [
    {
      id: "fc_kim_001",
      question: "Atom nedir?",
      answer: "Maddenin kimyasal özelliklerini koruyan en küçük parçacığıdır",
      explanation:
        "Atom, proton, nötron ve elektronlardan oluşur. Kimyasal reaksiyonlarda bölünmez.",
      topic: "Atom Yapısı",
      difficulty: "Başlangıç",
      reviewCount: 1,
      confidence: 2,
      options: [
        { text: "Maddenin en küçük parçacığı", isCorrect: true },
        { text: "Molekülün yarısı", isCorrect: false },
        { text: "Elektronun çekirdeği", isCorrect: false },
        { text: "İyonun tersi", isCorrect: false },
      ],
    },
  ],
  Tarih: [
    {
      id: "fc_tar_001",
      question: "Fatih Sultan Mehmet hangi şehri fethetti?",
      answer: "İstanbul (Konstantinopolis) - 1453",
      explanation:
        "29 Mayıs 1453'te Konstantinopolis'i fethederek Bizans İmparatorluğu'na son verdi.",
      topic: "Osmanlı Tarihi",
      difficulty: "Başlangıç",
      reviewCount: 1,
      confidence: 2,
      options: [
        { text: "İstanbul", isCorrect: true },
        { text: "Ankara", isCorrect: false },
        { text: "Bursa", isCorrect: false },
        { text: "İzmir", isCorrect: false },
      ],
    },
  ],
  Biyoloji: [
    {
      id: "fc_bio_001",
      question: "Hücrenin enerji merkezi hangisidir?",
      answer: "Mitokondri",
      explanation:
        "Mitokondri, hücresel solunumla ATP üretir ve hücrenin enerji ihtiyacını karşılar.",
      topic: "Hücre Biyolojisi",
      difficulty: "Orta",
      reviewCount: 3,
      confidence: 4,
      options: [
        { text: "Mitokondri", isCorrect: true },
        { text: "Kloroplast", isCorrect: false },
        { text: "Ribozom", isCorrect: false },
        { text: "Çekirdek", isCorrect: false },
      ],
    },
  ],
  "Türk Dili ve Edebiyatı": [
    {
      id: "fc_ede_001",
      question: "Türk edebiyatının ilk romanı hangisidir?",
      answer: "Taaşşuk-u Talat ve Fitnat (Şemsettin Sami)",
      explanation: "1872'de yazılan bu eser, Türk edebiyatının ilk romanı kabul edilir.",
      topic: "Türk Romanı",
      difficulty: "İleri",
      reviewCount: 1,
      confidence: 2,
      options: [
        { text: "Taaşşuk-u Talat ve Fitnat", isCorrect: true },
        { text: "Araba Sevdası", isCorrect: false },
        { text: "Mai ve Siyah", isCorrect: false },
        { text: "Aşk-ı Memnu", isCorrect: false },
      ],
    },
  ],
  İngilizce: [
    {
      id: "fc_ing_001",
      question: 'What is the past tense of "bring"?',
      answer: "Brought",
      explanation: '"Bring" is an irregular verb. Past tense: brought, Past participle: brought',
      topic: "Irregular Verbs",
      difficulty: "Orta",
      reviewCount: 2,
      confidence: 3,
      options: [
        { text: "Brought", isCorrect: true },
        { text: "Bringed", isCorrect: false },
        { text: "Brung", isCorrect: false },
        { text: "Brang", isCorrect: false },
      ],
    },
  ],
};

// Get demo flashcards for a specific subject (with locale support for English translation)
export const getDemoFlashcards = (subject: string, locale?: string) => {
  const cards = demoFlashcards[subject as keyof typeof demoFlashcards] || [];
  return translateDemoData(cards, locale);
};

// Get all demo flashcards (with locale support)
export const getAllDemoFlashcards = (locale?: string) =>
  translateDemoData(Object.values(demoFlashcards).flat(), locale);
