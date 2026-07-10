"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { getAiTutorHelp, type AiTutorOutput } from "../ai/flows/ai-tutor";
import { getStoredAiPreferences, isAiConfigured } from "@/lib/ai-preferences";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import VoiceAssistant from "./voice-assistant";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MobileNav from "./mobile-nav";
import { QuizResult } from "./quiz-result";
import LoadingSpinner from "./loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { QuestionService } from "@/services/supabase-service";
import { UnifiedStorageService } from "@/services/unified-storage-service";
import { getDemoQuestions } from "@/data/demo-data";
import AIFloatingChat from "./ai-floating-chat";

interface DemoQuestion {
  id: string;
  subjectId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: string;
  tags: string[];
  createdAt: string;
}

interface Question {
  id: string;
  subject: string;
  type: string;
  difficulty: string;
  text: string;
  topic: string;
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
  explanation: string;
}

interface QuizProps {
  subject: string;
  isDemoMode?: boolean;
}

interface UserSettings {
  studyPreferences: {
    defaultSubject: string;
    questionsPerQuiz: number;
    timeLimit: number;
    showTimer: boolean;
    autoSubmit: boolean;
  };
  notifications: {
    email: boolean;
    push: boolean;
    reminders: boolean;
    achievements: boolean;
  };
  appearance: {
    fontSize: "small" | "medium" | "large";
    compactMode: boolean;
    theme: "light" | "dark" | "system";
  };
}

const QuizComponent: React.FC<QuizProps> = ({
  subject,
  isDemoMode = false,
}) => {
  const { toast } = useToast();
  const t = useTranslations("Quiz");
  const locale = useLocale();
  const tSubjects = useTranslations("Subjects");

  const getDisplaySubject = (name: string) => {
    const demoSubjectNames = [
      "Matematik",
      "Fizik",
      "Kimya",
      "Biyoloji",
      "Tarih",
      "Türk Dili ve Edebiyatı",
      "İngilizce",
    ];
    if (!demoSubjectNames.includes(name)) {
      return name;
    }
    try {
      return tSubjects(name as any);
    } catch {
      return name;
    }
  };
  const displaySubject = getDisplaySubject(subject);

  // Translations for demo questions
  const DEMO_QUESTION_TRANSLATIONS: Record<string, { question: string; options: string[]; explanation: string; tags: string[] }> = {
    // Mathematics
    "q_mat_001": {
      question: "What is the value of f(5) for the function f(x) = 2x + 3?",
      options: ["11", "13", "15", "17"],
      explanation: "f(5) = 2(5) + 3 = 10 + 3 = 13",
      tags: ["function", "algebra"],
    },
    "q_mat_002": {
      question: "What is the sum of the interior angles of a triangle?",
      options: ["90°", "180°", "270°", "360°"],
      explanation: "The sum of the interior angles of a triangle is always 180 degrees.",
      tags: ["geometry", "triangle"],
    },
    "q_mat_003": {
      question: "What is the result of the integral ∫(2x + 1)dx?",
      options: ["x² + x + C", "2x² + x + C", "x² + C", "2x + C"],
      explanation: "∫(2x + 1)dx = ∫2x dx + ∫1 dx = x² + x + C",
      tags: ["integral", "calculus"],
    },
    // Physics
    "q_fiz_001": {
      question: "What is the formula for Newton's second law?",
      options: ["F = ma", "E = mc²", "P = mv", "W = Fd"],
      explanation: "Newton's second law: Force = mass × acceleration (F = ma)",
      tags: ["newton", "force", "mechanics"],
    },
    "q_fiz_002": {
      question: "What is the approximate speed of light in a vacuum?",
      options: ["3×10⁶ m/s", "3×10⁷ m/s", "3×10⁸ m/s", "3×10⁹ m/s"],
      explanation: "The speed of light in a vacuum is approximately 3×10⁸ m/s (300,000,000 m/s).",
      tags: ["light", "speed", "optics"],
    },
    "q_fiz_003": {
      question: "What concept does the first law of thermodynamics express?",
      options: ["Increase in entropy", "Conservation of energy", "Conservation of momentum", "Conservation of mass"],
      explanation: "The first law of thermodynamics states the principle of energy conservation.",
      tags: ["thermodynamics", "energy", "conservation"],
    },
    // Chemistry
    "q_kim_001": {
      question: "By what name are the elements in Group 1 of the periodic table known?",
      options: ["Halogens", "Alkali metals", "Noble gases", "Alkaline earth metals"],
      explanation: "Group 1 elements are known as alkali metals (Li, Na, K, Rb, Cs, Fr).",
      tags: ["periodic table", "alkali metals"],
    },
    "q_kim_002": {
      question: "What is the molecular geometry of H₂O?",
      options: ["Linear", "Trigonal planar", "Bent", "Tetrahedral"],
      explanation: "The water molecule (H₂O) has a bent (angular) geometry.",
      tags: ["molecular geometry", "water", "hybridization"],
    },
    // Biology
    "q_bio_001": {
      question: "In which organelles does photosynthesis occur?",
      options: ["Mitochondria", "Chloroplast", "Ribosome", "Golgi apparatus"],
      explanation: "Photosynthesis occurs in the chloroplasts of plant cells.",
      tags: ["photosynthesis", "chloroplast", "plant"],
    },
    "q_bio_002": {
      question: "Who first discovered the structure of DNA?",
      options: ["Darwin", "Mendel", "Watson and Crick", "Pasteur"],
      explanation: "The double helix structure of DNA was discovered by Watson and Crick.",
      tags: ["dna", "watson", "crick", "genetics"],
    },
    // History
    "q_tar_001": {
      question: "In what year was the Ottoman Empire founded?",
      options: ["1299", "1326", "1354", "1389"],
      explanation: "The Ottoman Empire was founded by Osman Gazi in 1299.",
      tags: ["ottoman", "foundation", "osman gazi"],
    },
    "q_tar_002": {
      question: "On what date was the Republic of Turkey proclaimed?",
      options: ["May 19, 1919", "April 23, 1920", "August 30, 1922", "October 29, 1923"],
      explanation: "The Republic of Turkey was proclaimed on October 29, 1923.",
      tags: ["republic", "ataturk", "foundation"],
    },
    // Literature
    "q_ede_001": {
      question: "Who is the author of the novel 'The Red-Haired Woman'?",
      options: ["Orhan Pamuk", "Yaşar Kemal", "Nazim Hikmet", "Sabahattin Ali"],
      explanation: "The novel 'The Red-Haired Woman' was written by Nobel laureate Orhan Pamuk.",
      tags: ["novel", "orhan pamuk", "contemporary literature"],
    },
    "q_ede_002": {
      question: "What is the most important poetic form in Divan Literature?",
      options: ["Ghazal", "Koshma", "Turku", "Mani"],
      explanation: "The most important and common poetic form in Divan Literature is the ghazal.",
      tags: ["divan literature", "ghazal", "poetry"],
    },
    // English
    "q_ing_001": {
      question: "Which sentence is grammatically correct?",
      options: ["She don't like coffee", "She doesn't likes coffee", "She doesn't like coffee", "She not like coffee"],
      explanation: "Third person singular uses \"doesn't\" and base form of verb.",
      tags: ["grammar", "present simple", "negative"],
    },
    "q_ing_002": {
      question: 'What is the past tense of "go"?',
      options: ["goed", "went", "gone", "going"],
      explanation: '"Go" is an irregular verb. Its past tense is "went".',
      tags: ["irregular verbs", "past tense"],
    }
  };

  // Save demo mode to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && isDemoMode) {
      localStorage.setItem("btk_demo_mode", "true");
    }
  }, [isDemoMode]);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [aiTutorHelp, setAiTutorHelp] = useState<AiTutorOutput | null>(null);
  const [isLoadingTutor, setIsLoadingTutor] = useState(false);
  const [tutorStep, setTutorStep] = useState<
    "hint" | "explanation" | "step-by-step" | "concept-review"
  >("hint");
  const [isSaving, setIsSaving] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [finalResult, setFinalResult] = useState({
    score: 0,
    totalQuestions: 0,
    timeSpent: 0,
    weakTopics: {},
  });
  const [userAnswers, setUserAnswers] = useState<
    Array<{ questionId: string; topic: string; isCorrect: boolean }>
  >([]);

  // Settings state
  const [userSettings, setUserSettings] = useState<UserSettings>({
    studyPreferences: {
      defaultSubject: "",
      questionsPerQuiz: 10,
      timeLimit: 30,
      showTimer: true,
      autoSubmit: false,
    },
    notifications: {
      email: true,
      push: false,
      reminders: true,
      achievements: true,
    },
    appearance: {
      fontSize: "medium",
      compactMode: false,
      theme: "system",
    },
  });

  // Timer states
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Generate a unique user ID for this session
  const userId = React.useMemo(() => {
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("userId");
      if (storedUserId) {
        return storedUserId;
      }

      const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("userId", newUserId);
      return newUserId;
    }
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Load user settings
  useEffect(() => {
    const loadUserSettings = () => {
      if (typeof window !== "undefined") {
        try {
          const saved = localStorage.getItem("userSettings");
          if (saved) {
            const parsed = JSON.parse(saved);
            setUserSettings((prev) => ({
              ...prev,
              ...parsed,
              studyPreferences: {
                ...prev.studyPreferences,
                ...parsed.studyPreferences,
              },
            }));
          }
        } catch {
          // Use default settings
        }
      }
    };

    loadUserSettings();
  }, []);

  // Load questions
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        // Check demo mode
        const demoModeActive =
          isDemoMode ||
          (typeof window !== "undefined" &&
            localStorage.getItem("btk_demo_mode") === "true");

        if (demoModeActive) {
          // Load demo questions from demo-data.ts
          const demoQuestionsFromData = getDemoQuestions(subject) as DemoQuestion[];

          // Convert demo questions to Quiz component format
          const convertedDemoQuestions: Question[] = demoQuestionsFromData.map(q => {
            const tr = (locale !== "tr" && DEMO_QUESTION_TRANSLATIONS[q.id]) ? DEMO_QUESTION_TRANSLATIONS[q.id] : null;
            return {
              id: q.id,
              subject, // Use the selected subject name directly
              type: "multiple-choice",
              difficulty: q.difficulty === "Başlangıç" ? "Easy" : q.difficulty === "Orta" ? "Medium" : "Hard",
              text: tr ? tr.question : q.question,
              topic: (tr ? tr.tags[0] : (q.tags && q.tags.length > 0 ? q.tags[0] : "Genel")) || "Genel",
              options: q.options.map((option, index) => ({
                text: (tr ? tr.options[index] : option) || option,
                isCorrect: index === q.correctAnswer
              })),
              explanation: tr ? tr.explanation : q.explanation
            };
          });

          const demoQuestions = convertedDemoQuestions;

          // Get real question count from actual demo questions
          const realQuestionCount = demoQuestions.length; // Real count from actual demo questions

          // Apply user settings for question count, but respect demo data limit
          const questionCount = Math.min(
            userSettings.studyPreferences.questionsPerQuiz,
            realQuestionCount,
            demoQuestions.length // Don't exceed available demo questions
          );
          const selectedQuestions = demoQuestions.slice(0, questionCount);

          setQuestions(selectedQuestions);
          setTotalQuestions(realQuestionCount); // Show real count from demo data
          setStartTime(new Date());

          // Set time limit if configured
          if (userSettings.studyPreferences.timeLimit > 0) {
            const timeLimitMinutes = userSettings.studyPreferences.timeLimit;
            setTimeLimit(timeLimitMinutes * 60); // Convert to seconds
            setTimeRemaining(timeLimitMinutes * 60);
          }

          return;
        }

        // Load questions from both IndexedDB (UnifiedStorageService) and Supabase
        const getQuestionsFromAllSources = async (): Promise<Question[]> => {
          if (typeof window === "undefined") {
            return [];
          }

          let allQuestions: Question[] = [];

          try {
            // Check authentication
            const guestUser = localStorage.getItem("guestUser");
            const supabaseToken = localStorage.getItem("sb-gjdjjwvhxlhlftjwykcj-auth-token");
            const isAuthenticated = Boolean(guestUser || supabaseToken);

            // Try to load from Supabase if authenticated
            if (isAuthenticated) {
              try {
                const dbQuestions = await QuestionService.getQuestionsBySubject(subject);
                const cloudQuestions = dbQuestions.map(question => ({
                  id: question.id,
                  subject: question.subject,
                  type: question.type,
                  difficulty: question.difficulty,
                  text: question.text,
                  options: JSON.parse(question.options || "[]"),
                  explanation: question.explanation,
                  topic: question.topic || "",
                }));
                allQuestions = [...cloudQuestions];

              } catch {
                //do nothing
              }
            }

            // Also check IndexedDB and merge
            await UnifiedStorageService.initialize();
            const localQuestions = UnifiedStorageService.getQuestionsBySubject(subject).map(q => ({
              ...q,
              topic: q.topic || "",
            })) as Question[];

            // Add local questions that don't exist in cloud questions
            localQuestions.forEach(localQ => {
              if (!allQuestions.find(cloudQ => cloudQ.id === localQ.id)) {
                allQuestions.push(localQ);
              }
            });

            return allQuestions;
          } catch {
            return [];
          }
        };

        const localQuestions = await getQuestionsFromAllSources();

        if (localQuestions.length === 0) {
          // Show error message and redirect back to quiz selection
          toast({
            title: t("errorTitle"),
            description: t("noQuestionsForSubject"),
            variant: "destructive",
          });
          window.location.href = "/quiz";
          return;
        }

        // Apply user settings for question count
        const questionCount = Math.min(
          userSettings.studyPreferences.questionsPerQuiz,
          localQuestions.length,
        );
        const quizQuestions = localQuestions.slice(0, questionCount);

        setQuestions(quizQuestions);
        setTotalQuestions(quizQuestions.length);
        setStartTime(new Date());

        // Set time limit if configured
        if (userSettings.studyPreferences.timeLimit > 0) {
          const timeLimitMinutes = userSettings.studyPreferences.timeLimit;
          setTimeLimit(timeLimitMinutes * 60); // Convert to seconds
          setTimeRemaining(timeLimitMinutes * 60);
        }
      } catch (error) {
        // Show user-friendly error message
        toast({
          title: t("errorTitle"),
          description: `${t("errorLoadingQuestions")} ${error instanceof Error ? error.message : t("unknownError")}`,
          variant: "destructive",
        });
        window.location.href = "/quiz";
      }
    };

    if (subject && userSettings) {
      loadQuestions();
    }
  }, [
    subject,
    userSettings,
    isDemoMode,
    locale,
    t,
    toast,
  ]);

  // Timer for elapsed time
  useEffect(() => {
    if (startTime) {
      const timer = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);

      return () => clearInterval(timer);
    }
    return undefined;
  }, [startTime]);

  // Helper function to calculate weak topics
  const getWeakTopics = useCallback(() => {
    const weakTopics: Record<string, number> = {};

    // Track actual wrong answers from user answers
    userAnswers.forEach((answer) => {
      if (!answer.isCorrect) {
        weakTopics[answer.topic] = (weakTopics[answer.topic] || 0) + 1;
      }
    });

    // Also include current question if answered incorrectly
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion && selectedAnswer !== null) {
      const isCorrect =
        currentQuestion.options[selectedAnswer]?.isCorrect ?? false;
      if (!isCorrect) {
        weakTopics[currentQuestion.topic] =
          (weakTopics[currentQuestion.topic] || 0) + 1;
      }
    }

    return weakTopics;
  }, [userAnswers, questions, currentQuestionIndex, selectedAnswer]);

  // Function to handle quiz completion
  const handleFinish = useCallback(async () => {
    const endTime = new Date();
    const totalTime = startTime
      ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
      : 0;

    // Get weak topics
    const weakTopics = getWeakTopics();

    setIsSaving(true);

    try {
      // SAVE TO LOCALSTORAGE

      // Save quiz result to localStorage
      const saveQuizResult = () => {
        if (typeof window === "undefined") {
          return;
        }

        try {
          // Use different localStorage keys for demo and real results
          const storageKey = isDemoMode
            ? "exam_training_demo_quiz_results"
            : "exam_training_quiz_results";
          const existingResults = localStorage.getItem(storageKey);
          const results = existingResults ? JSON.parse(existingResults) : [];

          const newResult = {
            id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            subject,
            score,
            totalQuestions,
            timeSpent: totalTime,
            weakTopics,
            createdAt: new Date().toISOString(),
            completedAt: endTime.toISOString(),
            isDemo: isDemoMode, // Add demo flag for identification
          };

          results.push(newResult);
          localStorage.setItem(storageKey, JSON.stringify(results));
        } catch {
          //do nothing
        }
      };

      saveQuizResult();

      setFinalResult({
        // Set the final result on success
        score,
        totalQuestions,
        timeSpent: totalTime,
        weakTopics,
      });
      setQuizFinished(true); // Show the result screen
    } catch {
      // Even if saving fails, show the result screen to the user
      setFinalResult({
        score,
        totalQuestions,
        timeSpent: totalTime,
        weakTopics,
      });
      setQuizFinished(true);
    } finally {
      setIsSaving(false);
    }
  }, [
    startTime,
    getWeakTopics,
    userId,
    subject,
    score,
    totalQuestions,
    isDemoMode,
    setFinalResult,
    setQuizFinished,
    setIsSaving,
  ]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (index: number) => {
    if (!showResult) {
      setSelectedAnswer(index);
    }
  };

  const handleSubmit = useCallback(() => {
    if (selectedAnswer !== null && currentQuestion) {
      const isCorrect =
        currentQuestion.options[selectedAnswer]?.isCorrect ?? false;
      if (isCorrect) {
        setScore(score + 1);
      }

      // Save user answer
      setUserAnswers((prev) => [
        ...prev,
        {
          questionId: currentQuestion.id,
          topic: currentQuestion.topic,
          isCorrect,
        },
      ]);

      setShowResult(true);

      // Otomatik olarak açıklamayı oku (2 saniye sonra)
      setTimeout(() => {
        if (currentQuestion.explanation) {
          // Voice assistant'a açıklama okuma sinyali gönder
          const event = new CustomEvent('readExplanation', {
            detail: { explanation: currentQuestion.explanation },
          });
          window.dispatchEvent(event);
        }
      }, 2000);
    }
  }, [selectedAnswer, currentQuestion, score]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setAiTutorHelp(null);
    }
  }, [currentQuestionIndex, questions.length]);

  // AutoSubmit fonksiyonu ekleyin
  const handleAutoSubmit = useCallback(() => {
    if (!showResult && currentQuestion) {
      // Eğer henüz cevap verilmemişse, random bir cevap seç
      if (selectedAnswer === null) {
        const randomAnswer = Math.floor(Math.random() * currentQuestion.options.length);
        setSelectedAnswer(randomAnswer);

        // State update'in tamamlanması için timeout kullan
        setTimeout(() => {
          const isCorrect = currentQuestion.options[randomAnswer]?.isCorrect ?? false;
          if (isCorrect) {
            setScore(prev => prev + 1);
          }

          setUserAnswers((prev) => [
            ...prev,
            {
              questionId: currentQuestion.id,
              topic: currentQuestion.topic,
              isCorrect,
            },
          ]);

          setShowResult(true);
        }, 100);
      } else {
        // Cevap seçilmişse direkt submit et
        handleSubmit();
      }
    } else if (showResult) {
      // Sonuç gösteriliyorsa bir sonraki soruya geç veya bitir
      if (currentQuestionIndex < questions.length - 1) {
        handleNext();
      } else {
        handleFinish();
      }
    } else {
      // Diğer durumlarda quiz'i bitir
      handleFinish();
    }
  }, [
    showResult,
    currentQuestion,
    selectedAnswer,
    handleSubmit,
    currentQuestionIndex,
    questions.length,
    handleNext,
    handleFinish,
  ]);

  // Timer for countdown (time limit)
  useEffect(() => {
    if (
      timeLimit &&
      timeRemaining !== null &&
      timeRemaining > 0 &&
      !quizFinished
    ) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            // AutoSubmit aktifse otomatik submit yap
            if (userSettings.studyPreferences.autoSubmit) {
              // Timer callback'i async olamayacağı için setTimeout kullan
              setTimeout(() => {
                handleAutoSubmit();
              }, 10);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
    return undefined;
  }, [
    timeLimit,
    timeRemaining,
    quizFinished,
    userSettings.studyPreferences.autoSubmit,
    handleAutoSubmit, // Bu önemli!
  ]);

  const handleRetake = () => {
    // Mevcut soruları sakla
    const currentQuestions = [...questions];

    // Reset all quiz-related state
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setTotalQuestions(0);
    setTimeSpent(0);
    setStartTime(null);
    setAiTutorHelp(null);
    setIsSaving(false);
    setQuizFinished(false);
    setUserAnswers([]);
    setFinalResult({
      score: 0,
      totalQuestions: 0,
      timeSpent: 0,
      weakTopics: {},
    });
    setTimeRemaining(null);
    setTimeLimit(null);

    // Soruları geri yükle
    setTimeout(() => {
      setQuestions(currentQuestions);
      setTotalQuestions(currentQuestions.length);
      setStartTime(new Date());

      // Set time limit if configured
      if (userSettings.studyPreferences.timeLimit > 0) {
        const timeLimitMinutes = userSettings.studyPreferences.timeLimit;
        setTimeLimit(timeLimitMinutes * 60); // Convert to seconds
        setTimeRemaining(timeLimitMinutes * 60);
      }
    }, 0);
  };

  // Handle voice commands
  const handleVoiceCommand = (command: string) => {
    switch (command) {
      case "next":
        if (currentQuestionIndex < questions.length - 1) {
          handleNext();
        }
        break;
      case "previous":
        if (currentQuestionIndex > 0) {
          setCurrentQuestionIndex(currentQuestionIndex - 1);
          setSelectedAnswer(null);
          setShowResult(false);
        }
        break;
      case "shuffle":
        // Shuffle questions
        const shuffled = [...questions].sort(() => Math.random() - 0.5);
        setQuestions(shuffled);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setShowResult(false);
        break;
      case "hint":
        // Request AI Tutor hint
        void requestAiTutorHelp("hint");
        break;
      case "explanation":
        // Request AI Tutor explanation
        void requestAiTutorHelp("explanation");
        break;
      case "step-by-step":
        // Request AI Tutor step-by-step
        void requestAiTutorHelp("step-by-step");
        break;
      case "concept-review":
        // Request AI Tutor concept review
        void requestAiTutorHelp("concept-review");
        break;
      default:
    }
  };

  const requestAiTutorHelp = async (
    step: "hint" | "explanation" | "step-by-step" | "concept-review",
  ) => {
    if (!currentQuestion) {
      return;
    }

    setIsLoadingTutor(true);
    setTutorStep(step);

    try {
      const aiPreferences = getStoredAiPreferences();
      if (!isAiConfigured(aiPreferences)) {
        setAiTutorHelp({
          help: t("aiTutorUnavailable") || "AI service configuration error. Please check your API key in Settings.",
        });
        return;
      }

      const result = await getAiTutorHelp({
        question: currentQuestion.text,
        subject: currentQuestion.subject,
        topic: currentQuestion.topic,
        difficulty: currentQuestion.difficulty as "Kolay" | "Orta" | "Zor" | undefined,
        options: currentQuestion.options,
        correctAnswer:
          currentQuestion.options.find((opt) => opt.isCorrect)?.text || "",
        explanation: currentQuestion.explanation,
        userAnswer:
          selectedAnswer !== null
            ? currentQuestion.options[selectedAnswer]?.text
            : undefined,
        step,
        language: locale === "en" ? "en" : "tr",
      }, aiPreferences);

      setAiTutorHelp(result);
    } catch {
      // Show user-friendly error message
      setAiTutorHelp({
        help: t("aiTutorUnavailable"),
        confidence: 0,
      });
    } finally {
      setIsLoadingTutor(false);
    }
  };

  // Format time display
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (questions.length === 0 || !currentQuestion) {
    return (
      <div className="flex flex-col min-h-screen">
        <MobileNav />
        <main className="flex-grow flex items-center justify-center">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  // Show result screen when quiz is finished
  if (quizFinished) {
    return (
      <div className="min-h-screen bg-background">
        <MobileNav />
        <QuizResult
          score={finalResult.score}
          totalQuestions={finalResult.totalQuestions}
          timeSpent={finalResult.timeSpent}
          weakTopics={finalResult.weakTopics}
          onRetake={handleRetake}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Responsive Navigation Bar */}
      <MobileNav />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Link href="/quiz">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t("backToTestPage")}
                </Button>
              </Link>
              <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                {displaySubject}
              </h1>
            </div>

            <div className="flex items-center gap-2.5">
              {userSettings.studyPreferences.showTimer && (
                <span className="bg-white/80 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 rounded-full px-4 py-2 text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2 backdrop-blur-sm shadow-sm shadow-slate-200/60">
                  <Clock className="w-4 h-4 text-blue-500" />
                  {formatTime(timeSpent)}
                </span>
              )}
              {timeLimit && timeRemaining !== null && (
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 backdrop-blur-sm shadow-sm border ${timeRemaining <= 60
                      ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                      : timeRemaining <= 300
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        : "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                    }`}
                >
                  <Clock className="w-4 h-4" />
                  {t("remaining")} {formatTime(timeRemaining)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider mb-2.5">
            <span>
              {t("questionCount", { current: currentQuestionIndex + 1, total: totalQuestions })}
            </span>
            <span>
              {totalQuestions > 0 ? Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100) : 0}% Complete
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/80 dark:bg-white/5 border border-slate-200/90 rounded-full h-2.5 overflow-hidden backdrop-blur-sm shadow-sm shadow-slate-200/60">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Time Warning */}
        {timeLimit &&
          timeRemaining !== null &&
          timeRemaining <= 60 &&
          timeRemaining > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-500/10 dark:bg-red-500/15 border border-red-500/20 rounded-2xl"
            >
              <p className="text-red-700 dark:text-red-400 font-bold text-center text-base">
                {t("timeWarning", { seconds: timeRemaining })}
              </p>
            </motion.div>
          )}

        {/* Question Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="apple-glass-card p-8 md:p-10 mb-6"
          >
            <div className="w-full relative z-10">
              <div className="flex items-center gap-2 mb-5">
                <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3.5 py-1.5 rounded-full text-xs font-bold">
                  {currentQuestion.topic}
                </span>
                <span
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold ${currentQuestion.difficulty === "Kolay" ||
                      currentQuestion.difficulty === "Easy"
                      ? "bg-green-500/10 text-green-700 dark:text-green-400"
                      : currentQuestion.difficulty === "Orta" ||
                        currentQuestion.difficulty === "Medium"
                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                        : "bg-red-500/10 text-red-700 dark:text-red-400"
                    }`}
                >
                  {currentQuestion.difficulty}
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-8 leading-relaxed">
                {currentQuestion.text}
              </h2>

              {/* Options */}
              <div className="space-y-4 mb-8">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  let optionStyle = "border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] shadow-sm shadow-slate-200/60";
                  let dotStyle = "border-slate-200/80 dark:border-white/20";
                  let checkMark = null;

                  if (isSelected) {
                    if (showResult) {
                      if (option.isCorrect) {
                        optionStyle = "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400";
                        dotStyle = "border-green-500 bg-green-500 text-white";
                        checkMark = "✓";
                      } else {
                        optionStyle = "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400";
                        dotStyle = "border-red-500 bg-red-500 text-white";
                        checkMark = "✗";
                      }
                    } else {
                      optionStyle = "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400";
                      dotStyle = "border-blue-500 bg-blue-500 text-white";
                      checkMark = "✓";
                    }
                  } else if (showResult && option.isCorrect) {
                    optionStyle = "border-green-500/30 bg-green-500/5 text-green-700 dark:text-green-400";
                    dotStyle = "border-green-500 bg-green-500 text-white";
                    checkMark = "✓";
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showResult}
                      className={`w-full p-5 text-left rounded-2xl border transition-all duration-200 backdrop-blur-sm flex items-center justify-between group ${optionStyle}`}
                    >
                      <div className="flex items-center gap-4 pr-4 flex-1">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${dotStyle}`}
                        >
                          {checkMark}
                        </div>
                        <span className="font-semibold text-base leading-relaxed">{option.text}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explanation Panel */}
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-8 p-5 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 shadow-sm shadow-slate-200/60 backdrop-blur-sm"
                >
                  <h3 className="font-bold text-base text-[#1d1d1f] dark:text-[#f5f5f7] mb-2 flex items-center gap-1.5">
                    📖 {t("explanationTitle")}
                  </h3>
                  <p className="text-sm text-[#86868b] dark:text-[#a1a1a6] leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </motion.div>
              )}

              {/* AI Tutor Integration */}
              <div className="mb-6 pt-4 border-t border-slate-200/90 dark:border-white/10">
                <h3 className="font-bold text-xs text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider mb-3">
                  ✨ {t("aiTutorHelpTitle")}
                </h3>

                <div className="flex flex-wrap gap-2 mb-4">
                  {!showResult ? (
                    <button
                      onClick={() => {
                        void requestAiTutorHelp("hint");
                      }}
                      disabled={isLoadingTutor}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-40"
                    >
                      💡 {t("hint")}
                    </button>
                  ) : (
                    (
                      [
                        "hint",
                        "explanation",
                        "step-by-step",
                        "concept-review",
                      ] as const
                    ).map((step) => (
                      <button
                        key={step}
                        onClick={() => {
                          void requestAiTutorHelp(step);
                        }}
                        disabled={isLoadingTutor}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${tutorStep === step && aiTutorHelp
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm"
                            : "bg-white/80 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 hover:bg-white/90 dark:hover:bg-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] shadow-sm shadow-slate-200/60"
                          } disabled:opacity-40`}
                      >
                        {step === "hint" && "💡"}
                        {step === "explanation" && "📚"}
                        {step === "step-by-step" && "🔍"}
                        {step === "concept-review" && "🎯"}
                        {step === "hint" && t("hint")}
                        {step === "explanation" && t("explanation")}
                        {step === "step-by-step" && t("stepByStep")}
                        {step === "concept-review" && t("conceptReview")}
                      </button>
                    ))
                  )}
                </div>

                {isLoadingTutor && (
                  <div className="flex flex-col items-center justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500 mb-2" />
                    <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium">
                      {t("preparingAiHelp")}
                    </p>
                  </div>
                )}

                {aiTutorHelp && !isLoadingTutor && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4.5 rounded-2xl bg-white/90 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 shadow-sm shadow-slate-200/60 backdrop-blur-sm"
                  >
                    <h4 className="font-bold text-xs text-[#1d1d1f] dark:text-[#f5f5f7] mb-2 flex items-center gap-1.5">
                      {tutorStep === "hint" && "💡"}
                      {tutorStep === "explanation" && "📚"}
                      {tutorStep === "step-by-step" && "🔍"}
                      {tutorStep === "concept-review" && "🎯"}
                      {tutorStep === "hint" && t("hint")}
                      {tutorStep === "explanation" && t("explanation")}
                      {tutorStep === "step-by-step" && t("stepByStep")}
                      {tutorStep === "concept-review" && t("conceptReview")}
                    </h4>
                    <div className="text-xs leading-relaxed text-[#515154] dark:text-[#d2d2d7] prose prose-invert max-w-none ai-tutor-markdown">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {aiTutorHelp.help}
                      </ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-2">
                {!showResult ? (
                  <button
                    onClick={handleSubmit}
                    disabled={selectedAnswer === null}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {t("submitAnswer")}
                  </button>
                ) : currentQuestionIndex < questions.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all font-semibold text-sm"
                  >
                    {t("nextQuestion")}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      void handleFinish();
                    }}
                    disabled={isSaving}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all font-semibold text-sm disabled:opacity-40"
                  >
                    {isSaving ? t("saving") : t("finishTest")}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Score Footer */}
        <div className="flex items-center justify-between px-3 text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6]">
          <span>
            {t("score")}: {score} / {totalQuestions}
          </span>
          <span>
            {t("successRate")}: {totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Voice Assistant */}
      {!isChatOpen && (
        <VoiceAssistant
          onCommand={handleVoiceCommand}
          currentQuestion={currentQuestion.text}
          currentOptions={currentQuestion.options}
          currentAnswer={
            currentQuestion.options.find((opt) => opt.isCorrect)?.text || ""
          }
          currentExplanation={currentQuestion.explanation}
          aiTutorOutput={aiTutorHelp?.help || ""}
          isListening={isListening}
          onListeningChange={setIsListening}
          showExplanation={showResult}
          mode="quiz"
        />
      )}

      {/* AI Floating Chat - accesses quiz data */}
      <AIFloatingChat
        subject={subject}
        quizData={{
          questions,
          currentQuestionIndex,
          ...(currentQuestionIndex < questions.length ? { currentQuestion: questions[currentQuestionIndex] as unknown as Record<string, unknown> } : {}),
          selectedAnswer,
          timeSpent,
          timeRemaining,
          timeLimit,
          showTimer: userSettings.studyPreferences.showTimer,
          totalQuestions,
          aiTutorUsed: Boolean(aiTutorHelp),
          showResult,
        }}
        onOpenChange={setIsChatOpen}
      />
    </div>
  );
};

export default QuizComponent;
