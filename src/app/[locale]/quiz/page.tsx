"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import QuizComponent from "@/components/quiz";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Play,
  GraduationCap,
  Loader2,
  ArrowLeft,
  Target,
  Clock,
  Bot,
  BarChart3,
  Palette,
  Brain,
  Search,
} from "lucide-react";
import FeatureCards from "@/components/ui/feature-cards";
import { quizFeatures } from "@/data/feature-cards-data";
import { Badge } from "@/components/ui/badge";
import { shouldUseDemoData } from "@/data/demo-data";
import { UnifiedStorageService } from "@/services/unified-storage-service";
import { QuestionService, SubjectService } from "@/services/supabase-service";
import type { Subject } from "@/types/question-manager";
import type { Question } from "@/lib/types";

interface QuizSubject extends Subject {
  questionCount: number;
}

const QUIZ_FEATURE_KEYS = [
  "quick_start",
  "smart_assessment",
  "ai_learning",
  "personalized_questions",
  "goal_focused",
  "continuous_improvement",
] as const;

function QuizPageContent() {
  const t = useTranslations("QuizSelection");
  const locale = useLocale();

  const tSubjects = useTranslations("Subjects");
  const getTranslatedSubject = (name: string) => {
    if (locale === "tr") { return name; }
    try {
      return tSubjects(name as any);
    } catch {
      return name;
    }
  };

  const getTranslatedCategory = (category: string) => {
    if (locale === "tr") { return category; }
    const map: Record<string, string> = {
      "SayÃ„Â±sal": "Science & Math",
      "Fen Bilimleri": "Science",
      "Sosyal Bilimler": "Social Sciences",
      "SÃƒÂ¶zel": "Verbal",
      "YabancÃ„Â± Dil": "Foreign Language"
    };
    return map[category] || category;
  };

  const getTranslatedDifficulty = (diff: string) => {
    if (locale === "tr") { return diff; }
    const map: Record<string, string> = {
      "Kolay": "Easy",
      "Orta": "Medium",
      "Zor": "Hard",
      "BaÃ…Å¸langÃ„Â±ÃƒÂ§": "Beginner",
      "Ã„Â°leri": "Advanced"
    };
    return map[diff] || diff;
  };

  const translatedFeatures = useMemo(
    () =>
      quizFeatures.map((feature, index) => ({
        ...feature,
        title: t(`features.${QUIZ_FEATURE_KEYS[index]}.title`),
        description: t(`features.${QUIZ_FEATURE_KEYS[index]}.description`),
      })),
    [t],
  );
  const searchParams = useSearchParams();
  const router = useRouter();
  const subject = searchParams.get("subject");
  const [subjects, setSubjects] = useState<QuizSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [defaultSubject, setDefaultSubject] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const guestUser = localStorage.getItem("guestUser");
      const supabaseToken = localStorage.getItem("sb-gjdjjwvhxlhlftjwykcj-auth-token");
      setIsAuthenticated(Boolean(guestUser || supabaseToken));
    };

    checkAuth();
  }, []);

  // Load questions from both IndexedDB and Supabase
  const loadAllQuestions = async (): Promise<Question[]> => {
    let allQuestions: Question[] = [];

    try {
      // Make sure the IndexedDB-backed cache is ready before reading
      await UnifiedStorageService.initialize();

      if (isAuthenticated) {
        // Try to load from Supabase first
        try {
          const dbQuestions = await QuestionService.getQuestions();
          const cloudQuestions = dbQuestions.map(question => ({
            id: question.id,
            subject: question.subject,
            type: question.type as "multiple-choice" | "true-false" | "calculation" | "case-study",
            difficulty: question.difficulty as "Easy" | "Medium" | "Hard",
            text: question.text,
            options: JSON.parse(question.options || "[]"),
            explanation: question.explanation,
            topic: question.topic || "",
            formula: question.formula || "",
          }));
          allQuestions = [...cloudQuestions];
        } catch {
          // Silently handle Supabase errors and fallback to localStorage
        }
      }

      // Also get local questions and merge
      const localQuestions = UnifiedStorageService.getQuestions();
      localQuestions.forEach(localQ => {
        if (!allQuestions.find(cloudQ => cloudQ.id === localQ.id)) {
          allQuestions.push(localQ);
        }
      });

      return allQuestions;
    } catch {
      return UnifiedStorageService.getQuestions();
    }
  };

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setLoading(true);

        // Make sure the IndexedDB-backed cache is ready before reading
        await UnifiedStorageService.initialize();

        // Demo mode control
        const demoMode = shouldUseDemoData();
        setIsDemoMode(demoMode);

        if (demoMode) {
          // Import demo data to get real question counts
          const { demoSubjects } = await import("@/data/demo-data");

          // Calculate real question counts for each subject based on available demo questions
          const subjectsWithRealCounts = demoSubjects.map(subject => {
            let questionCount = 0;

            // Count demo questions for each subject (based on quiz component logic)
            switch (subject.name) {
              case "Fizik":
                questionCount = 3; // 3 demo physics questions
                break;
              case "Kimya":
                questionCount = 3; // 3 demo chemistry questions
                break;
              default: // Matematik
                questionCount = 3; // 3 demo math questions
                break;
            }

            return {
              ...subject,
              questionCount
            };
          });

          setSubjects(subjectsWithRealCounts);
          return;
        }

        // Load subjects from both localStorage and Supabase (like Subject Manager does)
        let loadedSubjects: Subject[] = [];

        if (isAuthenticated) {
          try {
            const dbSubjects = await SubjectService.getSubjects();

            // If there are subjects in Supabase, use them, otherwise load from localStorage
            if (dbSubjects && dbSubjects.length > 0) {
              loadedSubjects = dbSubjects.map(subject => ({
                id: subject.id,
                name: subject.name,
                description: subject.description,
                category: subject.category,
                difficulty: subject.difficulty,
                questionCount: subject.question_count,
                isActive: subject.is_active,
              }));
            } else {
              loadedSubjects = UnifiedStorageService.getSubjects();
            }
          } catch {
            // Fallback to localStorage on Supabase error
            loadedSubjects = UnifiedStorageService.getSubjects();
          }
        } else {
          loadedSubjects = UnifiedStorageService.getSubjects();
        }

        // Load all questions (from both localStorage and Supabase)
        const allQuestions = await loadAllQuestions();

        // Calculate question count for each subject using all questions
        const subjectsWithQuestionCount = loadedSubjects.map((subject) => {
          // Filter questions by subject name
          const subjectQuestions = allQuestions.filter(q => {
            const normalizedQuestionSubject = q.subject.trim().toLowerCase();
            const normalizedSubjectName = subject.name.trim().toLowerCase();
            return normalizedQuestionSubject === normalizedSubjectName;
          });

          // Calculate question count for this subject
          return {
            ...subject,
            questionCount: subjectQuestions.length,
          };
        });

        // Filter only active courses with questions
        const activeSubjectsWithQuestions = subjectsWithQuestionCount.filter(
          (subject) => subject.isActive && subject.questionCount > 0,
        );

        setSubjects(activeSubjectsWithQuestions);

        // Load default subject from settings
        try {
          const saved = localStorage.getItem("userSettings");
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.studyPreferences?.defaultSubject) {
              setDefaultSubject(parsed.studyPreferences.defaultSubject);
              // Auto-select default subject if it exists in subjects list
              const defaultSubjectExists = activeSubjectsWithQuestions.some(
                (s) => s.name === parsed.studyPreferences.defaultSubject,
              );
              if (defaultSubjectExists) {
                setSelectedSubject(parsed.studyPreferences.defaultSubject);
              }
            }
          }
        } catch {
          // Error handling silently
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };

    // Only load subjects when authentication status is determined
    if (isAuthenticated !== null) {
      loadSubjects();
    }
  }, [searchParams, isAuthenticated]);

  const handleStartQuiz = () => {
    if (selectedSubject) {
      // Check if there are real questions for this subject using both sources
      loadAllQuestions().then(allQuestions => {
        const questionsForSubject = allQuestions.filter(q => {
          const normalizedQuestionSubject = q.subject.trim().toLowerCase();
          const normalizedSelectedSubject = selectedSubject.trim().toLowerCase();
          return normalizedQuestionSubject === normalizedSelectedSubject;
        });

        const hasRealQuestions = questionsForSubject.length > 0;

        if (hasRealQuestions) {
          // Use real questions - don't set demo mode and remove any existing demo flag
          localStorage.removeItem("btk_demo_mode");
          const quizUrl = `/quiz?subject=${encodeURIComponent(selectedSubject)}`;
          router.push(quizUrl);
        } else {
          // No real questions - use demo mode
          localStorage.setItem("btk_demo_mode", "true");
          const quizUrl = `/quiz?subject=${encodeURIComponent(selectedSubject)}&demo=true`;
          router.push(quizUrl);
        }
      });
    }
  };

  if (subject && subject.length > 0) {
    // Demo mode control
    const isDemoMode = shouldUseDemoData();

    return <QuizComponent subject={subject} isDemoMode={isDemoMode} />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-transparent dark:!bg-none">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => (window.location.href = "/dashboard")}
            variant="ghost"
            size="sm"
            className="mb-4 flex items-center gap-2 text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("backToDashboard")}
          </Button>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shrink-0">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-4xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {t("pageTitle")}
                </h1>
                {isDemoMode && (
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs px-2.5 py-0.5">
                    {t("demo")}
                  </Badge>
                )}
              </div>
              <p className="text-[#86868b] dark:text-[#a1a1a6] text-sm md:text-base font-medium mt-0.5">
                {t("pageDescription")}
              </p>
            </div>
          </div>
        </div>

        {/* Main Selection Card */}
        <div className="apple-glass-card mb-8">
          <div className="w-full relative z-10 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm shrink-0">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {t("subjectSelection")}
                </h2>
                <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                  {t("subjectSelectionDesc")}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-7 h-7 animate-spin mr-2 text-blue-500" />
                <span className="text-[#86868b] dark:text-[#a1a1a6] text-sm">{t("loadingSubjects")}</span>
              </div>
            ) : subjects.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Add Subject */}
                <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 group shadow-sm shadow-slate-200/60">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                    {t("addSubject")}
                  </h3>
                  <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mb-5">
                    {t("noActiveSubjects")}
                  </p>
                  <Link href="/subject-manager" className="mt-auto w-full">
                    <Button className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-sm font-semibold">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      {t("addSubject")}
                    </Button>
                  </Link>
                </div>

                {/* Card 2: Question Management */}
                <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 hover:border-green-300 dark:hover:border-green-700 transition-all duration-300 group shadow-sm shadow-slate-200/60">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                    {t("questionManagement")}
                  </h3>
                  <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mb-5">
                    {t("questionManagementDesc")}
                  </p>
                  <Link href="/question-manager" className="mt-auto w-full">
                    <Button className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl text-sm font-semibold">
                      <BookOpen className="w-4 h-4 mr-2" />
                      {t("addQuestion")}
                    </Button>
                  </Link>
                </div>

                {/* Card 3: Quiz Process */}
                <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 group shadow-sm shadow-slate-200/60">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                    {t("quizProcess")}
                  </h3>
                  <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mb-5">
                    {t("quizProcessDesc")}
                  </p>
                  <Link href="/subject-manager" className="mt-auto w-full">
                    <Button className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl text-sm font-semibold">
                      <Play className="w-4 h-4 mr-2" />
                      {t("startQuiz")}
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-2xl mx-auto">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 rounded-xl backdrop-blur-sm h-12 text-sm font-medium">
                    <SelectValue placeholder={t("selectSubjectPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem
                        key={subject.id}
                        value={subject.name}
                        className={subject.name === defaultSubject ? "font-semibold" : ""}
                      >
                        {getTranslatedSubject(subject.name)} ({t("questionCount", { count: subject.questionCount })})
                        {subject.name === defaultSubject && t("defaultBadge")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleStartQuiz}
                  disabled={!selectedSubject}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all text-base font-semibold disabled:opacity-40"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {selectedSubject === defaultSubject ? t("startDefaultQuiz") : t("startQuiz")}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Smart Features Card */}
        <div className="apple-glass-card mb-8">
          <div className="w-full relative z-10 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm shrink-0">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                {t("smartFeatures")}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs sm:text-sm text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold">{t("personalizedDifficulty")}</span>
              </div>
              <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10">
                <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-xs sm:text-sm text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold">{t("timeLimitedModes")}</span>
              </div>
              <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-xs sm:text-sm text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold">{t("aiTutorHelp")}</span>
              </div>
              <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-xs sm:text-sm text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold">{t("detailedAnalytics")}</span>
              </div>
              <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10">
                <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center shrink-0">
                  <Palette className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                </div>
                <span className="text-xs sm:text-sm text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold">{t("adaptiveAlgorithm")}</span>
              </div>
              <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10">
                <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center shrink-0">
                  <Search className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="text-xs sm:text-sm text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold">{t("weakTopicDetection")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Cards Grid */}
        {subjects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-5 tracking-tight">
              {t("availableSubjects")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="apple-glass-card cursor-pointer group hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  onClick={() => {
                    setSelectedSubject(subject.name);
                    loadAllQuestions().then(allQuestions => {
                      const questionsForSubject = allQuestions.filter(q => {
                        const normalizedQuestionSubject = q.subject.trim().toLowerCase();
                        const normalizedSubjectName = subject.name.trim().toLowerCase();
                        return normalizedQuestionSubject === normalizedSubjectName;
                      });
                      const hasRealQuestions = questionsForSubject.length > 0;
                      if (hasRealQuestions) {
                        localStorage.removeItem("btk_demo_mode");
                        router.push(`/quiz?subject=${encodeURIComponent(subject.name)}`);
                      } else {
                        localStorage.setItem("btk_demo_mode", "true");
                        router.push(`/quiz?subject=${encodeURIComponent(subject.name)}&demo=true`);
                      }
                    });
                  }}
                >
                  <div className="w-full relative z-10 p-5 md:p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base md:text-lg text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                          {getTranslatedSubject(subject.name)}
                        </h3>
                        <p className="text-xs md:text-sm text-[#86868b] dark:text-[#a1a1a6]">
                          {getTranslatedCategory(subject.category || "")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/10 dark:border-white/5">
                      <Badge
                        className={
                          subject.difficulty === "Kolay" || subject.difficulty === "Easy"
                            ? "bg-green-500/15 text-green-700 dark:text-green-400 text-xs font-semibold border-0 px-2.5 py-0.5"
                            : subject.difficulty === "Orta" || subject.difficulty === "Medium"
                              ? "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 text-xs font-semibold border-0 px-2.5 py-0.5"
                              : "bg-red-500/15 text-red-700 dark:text-red-400 text-xs font-semibold border-0 px-2.5 py-0.5"
                        }
                      >
                        {getTranslatedDifficulty(subject.difficulty || "")}
                      </Badge>
                      <span className="text-xs md:text-sm font-semibold text-[#86868b] dark:text-[#a1a1a6]">
                        {t("questionCount", { count: subject.questionCount })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feature Cards */}
        <FeatureCards
          title={t("quizFeatures")}
          features={translatedFeatures}
          columns={3}
        />
      </div>
    </div>
  );
}

export default function QuizPage() {
  const t = useTranslations("QuizSelection");
  return (
    <Suspense fallback={<div>{t("loading")}</div>}>
      <QuizPageContent />
    </Suspense>
  );
}
