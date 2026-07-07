"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import QuizComponent from "@/components/quiz";
import { Link } from "@/i18n/routing";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    if (locale === "tr") {return name;}
    try {
      return tSubjects(name as any);
    } catch {
      return name;
    }
  };

  const getTranslatedCategory = (category: string) => {
    if (locale === "tr") {return category;}
    const map: Record<string, string> = {
      "Sayısal": "Science & Math",
      "Fen Bilimleri": "Science",
      "Sosyal Bilimler": "Social Sciences",
      "Sözel": "Verbal",
      "Yabancı Dil": "Foreign Language"
    };
    return map[category] || category;
  };

  const getTranslatedDifficulty = (diff: string) => {
    if (locale === "tr") {return diff;}
    const map: Record<string, string> = {
      "Kolay": "Easy",
      "Orta": "Medium",
      "Zor": "Hard",
      "Başlangıç": "Beginner",
      "İleri": "Advanced"
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

  // Load questions from both localStorage and Supabase
  const loadAllQuestions = async (): Promise<Question[]> => {
    let allQuestions: Question[] = [];

    try {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-transparent dark:!bg-none p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <div className="mb-6">
          <Button
            onClick={() => (window.location.href = "/dashboard")}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("backToDashboard")}
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
              {t("pageTitle")}
            </h1>
            {isDemoMode && (
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                {t("demo")}
              </Badge>
            )}
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {t("pageDescription")}
          </p>
        </div>
        <Card className={`mx-auto border-gradient-question shadow-lg ${!loading && subjects.length === 0 ? "max-w-4xl" : "max-w-2xl"}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              {t("subjectSelection")}
            </CardTitle>
            <CardDescription>
              {t("subjectSelectionDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>{t("loadingSubjects")}</span>
              </div>
            ) : subjects.length === 0 ? (
              <div className="col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Card 1: Add Subject */}
                  <div className="shadow-lg border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 rounded-lg p-8 text-center">
                    <div className="mb-4 flex justify-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center">
                        <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t("addSubject")}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      {t("noActiveSubjects")}
                    </p>
                    <Link href="/subject-manager">
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-full">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        {t("addSubject")}
                      </Button>
                    </Link>
                  </div>

                  {/* Card 2: Question Management */}
                  <div className="shadow-lg border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 transition-all duration-300 rounded-lg p-8 text-center">
                    <div className="mb-4 flex justify-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-full flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t("questionManagement")}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      {t("questionManagementDesc")}
                    </p>
                    <Link href="/question-manager">
                      <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white w-full">
                        <BookOpen className="w-4 h-4 mr-2" />
                        {t("addQuestion")}
                      </Button>
                    </Link>
                  </div>

                  {/* Card 3: Quiz Process */}
                  <div className="shadow-lg border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 rounded-lg p-8 text-center">
                    <div className="mb-4 flex justify-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t("quizProcess")}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      {t("quizProcessDesc")}
                    </p>
                    <div className="text-sm text-gray-400 dark:text-gray-500">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="w-4 h-4 bg-blue-500 rounded-full"></span>
                        <span>{t("subject")}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="w-4 h-4 bg-green-500 rounded-full"></span>
                        <span>{t("question")}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 bg-purple-500 rounded-full"></span>
                        <span>{t("quiz")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Select
                  value={selectedSubject}
                  onValueChange={setSelectedSubject}
                >
                  <SelectTrigger className="hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-blue-900 dark:hover:from-blue-600 dark:hover:to-purple-600 dark:hover:text-white hover:border-0">
                    <SelectValue placeholder={t("selectSubjectPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem
                        key={subject.id}
                        value={subject.name}
                        className={`hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-blue-900 data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-blue-100 data-[highlighted]:to-purple-100 data-[highlighted]:text-blue-900 dark:hover:from-blue-600 dark:hover:to-purple-600 dark:hover:text-white dark:data-[highlighted]:from-blue-600 dark:data-[highlighted]:to-purple-600 dark:data-[highlighted]:text-white ${subject.name === defaultSubject ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" : ""
                          }`}
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
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0"
                  size="lg"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {selectedSubject === defaultSubject ? t("startDefaultQuiz") : t("startQuiz")}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Akıllı Öğrenme Özellikleri */}
        <div className="mt-8">
          <div className="border-gradient-question bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
              <Brain className="w-5 h-5 inline mr-2 text-purple-600" />
              {t("smartFeatures")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center">
                <Target className="w-4 h-4 mr-2 text-blue-600" />
                <span>{t("personalizedDifficulty")}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-green-600" />
                <span>{t("timeLimitedModes")}</span>
              </div>
              <div className="flex items-center">
                <Bot className="w-4 h-4 mr-2 text-purple-600" />
                <span>{t("aiTutorHelp")}</span>
              </div>
              <div className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-2 text-indigo-600" />
                <span>{t("detailedAnalytics")}</span>
              </div>
              <div className="flex items-center">
                <Palette className="w-4 h-4 mr-2 text-pink-600" />
                <span>{t("adaptiveAlgorithm")}</span>
              </div>
              <div className="flex items-center">
                <Search className="w-4 h-4 mr-2 text-orange-600" />
                <span>{t("weakTopicDetection")}</span>
              </div>
            </div>
          </div>
        </div>

        {subjects.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 text-center">
              {t("availableSubjects")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <Card
                  key={subject.id}
                  className="cursor-pointer border-gradient-question shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => {
                    setSelectedSubject(subject.name);

                    // Check if there are real questions for this subject using both sources
                    loadAllQuestions().then(allQuestions => {
                      const questionsForSubject = allQuestions.filter(q => {
                        const normalizedQuestionSubject = q.subject.trim().toLowerCase();
                        const normalizedSubjectName = subject.name.trim().toLowerCase();
                        return normalizedQuestionSubject === normalizedSubjectName;
                      });

                      const hasRealQuestions = questionsForSubject.length > 0;

                      if (hasRealQuestions) {
                        // Use real questions - don't set demo mode and remove any existing demo flag
                        localStorage.removeItem("btk_demo_mode");
                        const quizUrl = `/quiz?subject=${encodeURIComponent(subject.name)}`;
                        router.push(quizUrl);
                      } else {
                        // No real questions - use demo mode
                        localStorage.setItem("btk_demo_mode", "true");
                        const quizUrl = `/quiz?subject=${encodeURIComponent(subject.name)}&demo=true`;
                        router.push(quizUrl);
                      }
                    });
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          {getTranslatedSubject(subject.name)}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {getTranslatedCategory(subject.category || "")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge
                        className={
                          subject.difficulty === "Kolay"
                            ? "bg-green-500"
                            : subject.difficulty === "Orta"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }
                      >
                        {getTranslatedDifficulty(subject.difficulty || "")}
                      </Badge>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {t("questionCount", { count: subject.questionCount })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quiz Özellikleri */}
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
