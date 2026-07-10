"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import FeatureCards from "@/components/ui/feature-cards";
import { dashboardFeatures } from "@/data/feature-cards-data";
import {
  BookOpen,
  Brain,
  Target,
  TrendingUp,
  Clock,
  FileText,
  Users,
  Database,
  Download,
  Upload,
  UserCheck,
  UserX,
  Zap,
  Trophy,
  Activity,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import localStorageService from "@/services/localStorage-service";
import AnalyticsDashboard from "./analytics-dashboard";
import MobileNav from "./mobile-nav";
import LoadingSpinner from "./loading-spinner";
import { Switch } from "@/components/ui/switch";
import { useTranslations, useLocale } from "next-intl";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import AIPerformanceRecommendation from "./ai-performance-recommendation";
import AIFloatingChat from "./ai-floating-chat";
import {
  shouldUseDemoData,
  toggleDemoMode,
  demoPerformanceData,
  demoRecentResults,
  demoTotalStats,
} from "@/data/demo-data";
import { UnifiedStorageService } from "@/services/unified-storage-service";

interface PerformanceData {
  subject: string;
  averageScore: number;
  totalTests: number;
  weakTopics: string[];
  strongTopics: string[];
  lastUpdated: string;
}

interface QuizResult {
  id: string;
  userId?: string;
  type?: string;
  subject: string;
  topic?: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  weakTopics: string[] | Record<string, number>;
  createdAt: string;
  isDemo?: boolean;
}

interface TotalStats {
  totalTests: number;
  averageScore: number;
  totalTimeSpent: number;
  totalSubjects: number;
}

const DASHBOARD_FEATURE_KEYS = [
  "detailed_analytics",
  "smart_suggestions",
  "achievement_tracking",
  "performance_charts",
  "learning_tips",
  "achievement_badges",
] as const;

export default function EnhancedDashboard() {
  const t = useTranslations("Dashboard");
  const locale = useLocale();

  const translateSubject = useCallback((subject: string) => {
    if (locale === "tr") { return subject; }

    const map: Record<string, string> = {
      "Matematik": "Mathematics",
      "Fizik": "Physics",
      "Kimya": "Chemistry",
      "Biyoloji": "Biology",
      "Tarih": "History",
      "Türk Dili ve Edebiyatı": "Turkish Language & Lit.",
      "İngilizce": "English",
      "Coğrafya": "Geography",
      "Felsefe": "Philosophy",
      "Din Kültürü": "Religion"
    };

    return map[subject] || subject;
  }, [locale]);

  const translateTopic = useCallback((topic: string) => {
    if (locale === "tr") { return topic; }

    const map: Record<string, string> = {
      "Türev Uygulamaları": "Derivative Applications",
      "İntegral Hesabı": "Integral Calculus",
      "Logaritma": "Logarithms",
      "Geometri": "Geometry",
      "Cebir": "Algebra",
      "Analiz": "Calculus",
      "Elektrik ve Manyetizma": "Electricity & Magnetism",
      "Dalga Hareketi": "Wave Motion",
      "Modern Fizik": "Modern Physics",
      "Mekanik": "Mechanics",
      "Termodinamik": "Thermodynamics",
      "Elektrik": "Electricity",
      "Organik Kimya": "Organic Chemistry",
      "Elektrokimya": "Electrochemistry",
      "Kimyasal Reaksiyonlar": "Chemical Reactions",
      "Anorganik Kimya": "Inorganic Chemistry",
      "Kimyasal Bağlar": "Chemical Bonds",
      "Genetik": "Genetics",
      "Ekoloji": "Ecology",
      "Hücre Bölünmesi": "Cell Division",
      "Hücre Biyolojisi": "Cell Biology",
      "Sistemler": "Systems",
      "Dokular": "Tissues",
      "Osmanlı Duraklama Dönemi": "Ottoman Stagnation Period",
      "Tarih": "History",
      "Tarihsel Olaylar": "Historical Events",
      "Tarihsel Süreçler": "Historical Processes",
      "Divan Edebiyatı": "Divan Literature",
      "Çağdaş Türk Edebiyatı": "Modern Turkish Lit.",
      "Dil Bilgisi": "Grammar",
      "Edebiyat": "Literature",
      "Çağdaş Edebiyat": "Modern Literature"
    };

    return map[topic] || topic;
  }, [locale]);

  const translatedFeatures = useMemo(
    () =>
      dashboardFeatures.map((feature, index) => ({
        ...feature,
        title: t(`features.${DASHBOARD_FEATURE_KEYS[index]}.title`),
        description: t(`features.${DASHBOARD_FEATURE_KEYS[index]}.description`),
      })),
    [t],
  );
  const { user, loading, isGuest, isAuthenticated } = useLocalAuth();
  const { toast } = useToast();

  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [recentResults, setRecentResults] = useState<QuizResult[]>([]);
  const [totalStats, setTotalStats] = useState<TotalStats>({
    totalTests: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    totalSubjects: 0,
  });
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [useDemoData, setUseDemoData] = useState(true);
  const [userSettings, setUserSettings] = useState({
    studyPreferences: {
      questionsPerQuiz: 10,
      timeLimit: 30,
    },
  });

  // Safely initialize the demo data state
  useEffect(() => {
    setUseDemoData(shouldUseDemoData());
  }, []);

  // Load user settings
  useEffect(() => {
    const loadSettings = () => {
      try {
        const settings = localStorageService.getUserSettings();
        setUserSettings(settings);
      } catch {
        //do nothing
      }
    };

    loadSettings();

    // Listen for storage changes to update settings in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "userSettings") {
        loadSettings();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        return;
      }

      setIsLoading(true);
      try {
        // Make sure the IndexedDB-backed cache is ready before reading
        await UnifiedStorageService.initialize();

        // BTK Hackathon Demo Mode
        if (useDemoData) {
          setPerformanceData(
            demoPerformanceData.map((item) => ({
              ...item,
              subject: translateSubject(item.subject),
              weakTopics: item.weakTopics.map(translateTopic),
              strongTopics: item.strongTopics.map(translateTopic),
            }))
          );
          setRecentResults(
            demoRecentResults.map((item) => ({
              ...item,
              subject: translateSubject(item.subject),
              weakTopics: Array.isArray(item.weakTopics) ? item.weakTopics.map(translateTopic) : item.weakTopics,
            }))
          );
          setTotalStats(demoTotalStats);
          setIsLoading(false);
          return;
        }

        // USE DIRECT LOCALSTORAGE

        // Fetch data from LocalStorage
        const getDataFromStorage = () => {
          if (typeof window === "undefined") {
            return null;
          }

          try {
            // Load appropriate quiz results based on demo mode
            const quizResultsKey = useDemoData
              ? "exam_training_demo_quiz_results"
              : "exam_training_quiz_results";
            const quizResults = localStorage.getItem(quizResultsKey);
            const results = quizResults ? JSON.parse(quizResults) : [];

            // --- BACKWARD COMPATIBILITY MIGRATION ---
            if (typeof window !== "undefined") {
              try {
                interface SavedTopic {
                  id?: string;
                  subject?: string;
                  topic?: string;
                  content?: string;
                  createdAt?: string;
                }

                // Get old saved topics
                let savedTopics: SavedTopic[] = [];
                // Look for all keys matching mindhouse_topic_explainer_*
                for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  if (key?.startsWith("mindhouse_topic_explainer_")) {
                    const subjectTopicsRaw = localStorage.getItem(key);
                    if (subjectTopicsRaw) {
                      const subjectTopics = JSON.parse(subjectTopicsRaw);
                      if (Array.isArray(subjectTopics)) {
                        savedTopics = savedTopics.concat(subjectTopics);
                      }
                    }
                  }
                }

                if (savedTopics.length > 0) {
                  let hasNewMigrations = false;

                  savedTopics.forEach((st: SavedTopic) => {
                    // Check if this topic is already in results
                    const alreadyExists = results.find((r: QuizResult) => r.type === "TopicExplainer" && r.subject === st.subject && (r.topic === st.topic || r.topic === (st.content && JSON.parse(st.content).title)));
                    if (!alreadyExists) {
                      // Compute total time if available
                      let tTime = 300;
                      let realTopicName = st.topic;
                      try {
                        const parsedContent = JSON.parse(st.content || "{}");
                        if (parsedContent.totalTime) { tTime = parsedContent.totalTime; }
                        if (parsedContent.title) { realTopicName = parsedContent.title; }
                      } catch { }

                      results.push({
                        id: `explainer_migrated_${st.id || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        userId: "guest",
                        type: "TopicExplainer",
                        subject: st.subject,
                        topic: realTopicName,
                        score: 1,
                        totalQuestions: 1,
                        timeSpent: tTime,
                        weakTopics: [],
                        createdAt: st.createdAt || new Date().toISOString()
                      });
                      hasNewMigrations = true;
                    }
                  });

                  if (hasNewMigrations) {
                    localStorage.setItem(quizResultsKey, JSON.stringify(results));
                  }
                }
              } catch {
                // Migration error
              }
            }
            // --- END MIGRATION ---

            // Filter out demo results if not in demo mode
            const filteredResults = useDemoData
              ? results
              : results.filter((result: QuizResult) => !result.isDemo);

            // Get subject information from Subjects (IndexedDB)
            const subjectsData = UnifiedStorageService.getSubjects();

            if (filteredResults.length === 0) {
              // If there are no quiz results, return empty data
              return {
                performanceData: [],
                recentResults: [],
                totalStats: {
                  totalTests: 0,
                  averageScore: 0,
                  totalTimeSpent: 0,
                  totalSubjects: subjectsData.length,
                },
                storageInfo: { used: 0, available: 5242880, percentage: 0 },
              };
            }

            // Calculate performance data
            const performanceMap: Record<
              string,
              {
                totalTests: number;
                totalScore: number;
                totalQuestions: number;
                weakTopics: Record<string, number>;
              }
            > = {};
            filteredResults.forEach((result: QuizResult) => {
              if (!performanceMap[result.subject]) {
                performanceMap[result.subject] = {
                  totalTests: 0,
                  totalScore: 0,
                  totalQuestions: 0,
                  weakTopics: {},
                };
              }
              const subjectData = performanceMap[result.subject]!;
              if (result.type !== "TopicExplainer") {
                subjectData.totalTests++;
                subjectData.totalScore += result.score;
                subjectData.totalQuestions += result.totalQuestions;
              }

              // Add weak topics
              if (
                result.weakTopics &&
                typeof result.weakTopics === "object" &&
                !Array.isArray(result.weakTopics)
              ) {
                Object.entries(result.weakTopics).forEach(([topic, count]) => {
                  subjectData.weakTopics[topic] =
                    (subjectData.weakTopics[topic] || 0) + count;
                });
              }
            });

            const performanceData = Object.entries(performanceMap).map(
              ([subject, data]) => {
                // Calculate strong topics for this subject (topics not in weak topics)
                const allTopicsInSubject = new Set<string>();
                const topicPerformance: Record<
                  string,
                  { correct: number; total: number }
                > = {};

                // Collect all topics from this subject's results
                filteredResults
                  .filter((result: QuizResult) => result.subject === subject)
                  .forEach((result: QuizResult) => {
                    const { weakTopics } = result;
                    if (
                      weakTopics &&
                      typeof weakTopics === "object" &&
                      !Array.isArray(weakTopics)
                    ) {
                      Object.keys(weakTopics).forEach((topic) => {
                        allTopicsInSubject.add(topic);
                        if (!topicPerformance[topic]) {
                          topicPerformance[topic] = { correct: 0, total: 0 };
                        }
                        const weakCount = weakTopics[topic] || 0;
                        topicPerformance[topic].total += 3;
                        topicPerformance[topic].correct += Math.max(
                          0,
                          3 - weakCount,
                        );
                      });
                    }
                  });

                // Find strong topics (not in weak topics and good performance)
                const strongTopics = Array.from(allTopicsInSubject)
                  .filter((topic) => {
                    const performance = topicPerformance[topic];
                    if (!performance || performance.total < 2) {
                      return false;
                    }

                    const successRate =
                      (performance.correct / performance.total) * 100;
                    return successRate >= 70 && !data.weakTopics[topic];
                  })
                  .slice(0, 2);

                return {
                  subject: translateSubject(subject),
                  averageScore: data.totalQuestions > 0 ? Math.round(
                    (data.totalScore / data.totalQuestions) * 100,
                  ) : 0,
                  totalTests: data.totalTests,
                  weakTopics: Object.entries(data.weakTopics)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                    .map(([topic]) => translateTopic(topic)),
                  strongTopics: strongTopics.map(translateTopic), // Add strong topics to performance data
                  lastUpdated: new Date().toISOString(),
                };
              },
            );

            // Recent results
            const recentResults = filteredResults
              .slice(-5)
              .map((result: Record<string, unknown>) => ({
                id: result.id,
                type: result.type,
                topic: result.topic ? translateTopic(result.topic as string) : undefined,
                subject: translateSubject(result.subject as string),
                score: result.score,
                totalQuestions: result.totalQuestions,
                timeSpent: result.timeSpent || 0,
                weakTopics: result.weakTopics
                  ? Object.keys(result.weakTopics as Record<string, unknown>).map(translateTopic)
                  : [],
                createdAt: result.createdAt,
              }));

            // Total stats (exclude TopicExplainer from test counts and scores)
            const quizOnlyResults = filteredResults.filter((r: QuizResult) => r.type !== "TopicExplainer");

            const totalTests = quizOnlyResults.length;
            const totalCorrectAnswers = quizOnlyResults.reduce(
              (sum: number, result: QuizResult) => sum + result.score,
              0,
            );
            const totalQuestions = quizOnlyResults.reduce(
              (sum: number, result: QuizResult) => sum + result.totalQuestions,
              0,
            );
            const averageScore =
              totalQuestions > 0
                ? Math.round((totalCorrectAnswers / totalQuestions) * 100)
                : 0;
            const totalTimeSpent = filteredResults.reduce(
              (sum: number, result: QuizResult) =>
                sum + (result.timeSpent || 0),
              0,
            );

            const totalStats = {
              totalTests,
              averageScore,
              totalTimeSpent: Math.floor(totalTimeSpent / 60), // convert to minutes
              totalSubjects: subjectsData.length,
            };

            // Storage info (simple calculation)
            const used =
              JSON.stringify(filteredResults).length +
              JSON.stringify(subjectsData).length;
            const storageInfo = {
              used,
              available: 5242880, // 5MB
              percentage: Math.min((used / 5242880) * 100, 100),
            };

            return {
              performanceData,
              recentResults,
              totalStats,
              storageInfo,
            };
          } catch {
            //do nothing
            return null;
          }
        };

        const data = getDataFromStorage();

        if (data) {
          setPerformanceData(data.performanceData);
          setRecentResults(data.recentResults);
          setTotalStats(data.totalStats);
        } else {
          // Fallback boş data
          setPerformanceData([]);
          setRecentResults([]);
          setTotalStats({
            totalTests: 0,
            averageScore: 0,
            totalTimeSpent: 0,
            totalSubjects: 0,
          });
        }
      } catch {
        //do nothing
      } finally {
        setIsLoading(false);
      }
    };

    if (user && !loading) {
      loadUserData();
    }
  }, [user, loading, useDemoData, translateSubject, translateTopic]);

  const handleExportData = () => {
    if (!isGuest) {
      toast({
        title: t("toasts.guestOnly"),
        description:
          t("toasts.guestOnlyDesc"),
        variant: "destructive",
      });
      return;
    }

    try {
      const data = localStorageService.exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mindhouse-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: t("toasts.exportSuccess"),
        description:
          t("toasts.exportSuccessDesc"),
      });
    } catch {
      toast({
        title: t("toasts.exportError"),
        description: t("toasts.exportErrorDesc"),
        variant: "destructive",
      });
    }
  };

  const handleImportData = () => {
    if (!isGuest) {
      toast({
        title: "Bu özellik sadece misafir kullanıcılar içindir",
        description:
          "Giriş yapmış kullanıcılar verilerini profil ayarlarından yönetebilir.",
        variant: "destructive",
      });
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            const success = localStorageService.importAllData(data);

            if (success) {
              toast({
                title: t("toasts.importSuccess"),
                description:
                  t("toasts.importSuccessDesc"),
              });
              setTimeout(() => window.location.reload(), 1500);
            } else {
              throw new Error("Import failed");
            }
          } catch {
            toast({
              title: t("toasts.importError"),
              description: t("toasts.importErrorDesc"),
              variant: "destructive",
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleToggleDemoMode = () => {
    const newDemoMode = !useDemoData;
    setUseDemoData(newDemoMode);
    toggleDemoMode(newDemoMode);

    if (newDemoMode) {
      toast({
        title: t("toasts.demoActive"),
        description: t("toasts.demoActiveDesc"),
      });
    } else {
      // Sadece demo için kullanılan anahtarı temizle
      if (typeof window !== "undefined") {
        localStorage.removeItem("exam_training_demo_quiz_results");
      }
      toast({
        title: t("toasts.demoInactive"),
        description: t("toasts.demoInactiveDesc"),
      });
    }
    // useEffect [useDemoData] dep'i sayesinde veri otomatik yenilenir — reload gerekmez
  };

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>{t("loginRequired")}</CardTitle>
            <CardDescription>
              {t("loginToAccess")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full">{t("login")}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Build context for AI assistant - uses current data (demo or real)
  const dashboardContext = `
Dashboard Overview (${useDemoData ? 'DEMO MODE - sample data' : 'Real user data'}):

Total Tests: ${totalStats.totalTests}
Average Score: ${totalStats.averageScore}%
Total Study Time: ${totalStats.totalTimeSpent} minutes
Number of Subjects: ${performanceData.length}

Recent Activity:
${recentResults.slice(0, 5).map(r =>
    `- ${r.subject}: ${r.score}/${r.totalQuestions} (${Math.round(r.timeSpent / 60)} min)`
  ).join('\n')}

Subject Performance:
${performanceData.map(p =>
    `- ${p.subject}: Average ${p.averageScore}%, ${p.totalTests} tests`
  ).join('\n')}

Weak Topics Overall: ${performanceData.flatMap(p => p.weakTopics).slice(0, 10).join(', ')}
Strong Topics Overall: ${performanceData.flatMap(p => p.strongTopics).slice(0, 10).join(', ')}
`.trim();

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-transparent dark:!bg-none relative selection:bg-blue-200 selection:text-blue-900 dark:selection:bg-blue-900/30 dark:selection:text-blue-200">
      <MobileNav />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          {/* UPDATED HEADER LAYOUT */}
          <div className="flex flex-col gap-4 mb-8">
            {/* Title Section */}
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                {t("title")}
              </h1>
              <p className="text-[#86868b] dark:text-[#a1a1a6] mt-2 text-lg font-medium tracking-wide">
                {t("welcome")},{" "}
                {isGuest
                  ? t("guestUser")
                  : (user && "name" in user ? user.name : user?.email) || t("user")}
                !
                {isGuest && (
                  <span className="ml-2 inline-flex items-center">
                    <UserX className="h-4 w-4 mr-1" />
                    {t("guestMode")}
                  </span>
                )}
                {!isGuest && (
                  <span className="ml-2 inline-flex items-center">
                    <UserCheck className="h-4 w-4 mr-1" />
                    {t("member")}
                  </span>
                )}
              </p>
            </div>
            {/* Controls Section - Mobile: Stacked, Desktop: Right aligned */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Switches Group */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="demo-mode"
                    checked={useDemoData}
                    onCheckedChange={handleToggleDemoMode}
                    className="data-[state=checked]:bg-indigo-600 hover:bg-indigo-600/20 transition-colors"
                  />
                  <Label
                    htmlFor="demo-mode"
                    className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:text-indigo-600 transition-colors"
                  >
                    Demo
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="analytics-mode"
                    checked={showAnalytics}
                    onCheckedChange={setShowAnalytics}
                    className="data-[state=checked]:bg-indigo-600 hover:bg-indigo-600/20 transition-colors"
                  />
                  <Label
                    htmlFor="analytics-mode"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    {t("analyticsView")}
                  </Label>
                </div>
              </div>
            </div>
          </div>
          {/* Demo Mode Alert */}
          {useDemoData && (
            <div className="mb-6 border-gradient-question p-[1px] rounded-xl">
              <Alert className="border-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-[11px] backdrop-blur-sm">
                <Trophy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-gray-600 dark:text-gray-300">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <span>
                      <strong className="text-gray-800 dark:text-white">{t("demoModeActive")}</strong> {t("demoModeDesc")}
                    </span>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}
          {/* Guest User Alert */}
          {isGuest && !useDemoData && (
            <div className="mb-6 border-gradient-question p-[1px] rounded-xl">
              <Alert className="border-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-[11px] backdrop-blur-sm">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-gray-700 dark:text-gray-300">
                  <strong className="text-gray-800 dark:text-white">
                    {t("guestModeActive")}
                  </strong>{" "}
                  {t("guestModeDesc1")}
                  <Link
                    href="/login?mode=register"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline font-medium"
                  >
                    {t("createFreeAccount")}
                  </Link>{" "}
                  {t("guestModeDesc2")}
                  {/* OPTIONAL UPDATE */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Button
                      onClick={handleExportData}
                      size="sm"
                      variant="outline"
                      className="border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      {t("backup")}
                    </Button>
                    <Button
                      onClick={handleImportData}
                      size="sm"
                      variant="outline"
                      className="border-purple-300 dark:border-purple-600 text-purple-600 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      {t("restore")}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
        {showAnalytics ? (
          <AnalyticsDashboard useMockData={useDemoData} />
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="apple-glass-card h-full">
                <div className="flex flex-col h-full w-full relative z-10 p-5">
                  <div className="flex flex-row items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-[#86868b] dark:text-[#a1a1a6]">
                      {t("totalTests")}
                    </span>
                    <FileText className="h-5 w-5 text-[#007aff] dark:text-[#0a84ff]" />
                  </div>
                  <div className="text-3xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                    {totalStats.totalTests}
                  </div>
                  <p className="text-xs font-medium text-[#86868b] dark:text-[#a1a1a6]">
                    {totalStats.totalSubjects} {t("differentSubjects")}
                  </p>
                </div>
              </div>

              <div className="apple-glass-card h-full">
                <div className="flex flex-col h-full w-full relative z-10 p-5">
                  <div className="flex flex-row items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-[#86868b] dark:text-[#a1a1a6]">
                      {t("averageScore")}
                    </span>
                    <Target className="h-5 w-5 text-[#34c759] dark:text-[#30d158]" />
                  </div>
                  <div className="text-3xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                    %{totalStats.averageScore.toFixed(0)}
                  </div>
                  <p className="text-xs font-medium text-[#86868b] dark:text-[#a1a1a6]">
                    {t("recentTestsAvg")}
                  </p>
                </div>
              </div>

              <div className="apple-glass-card h-full">
                <div className="flex flex-col h-full w-full relative z-10 p-5">
                  <div className="flex flex-row items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-[#86868b] dark:text-[#a1a1a6]">
                      {t("totalTime")}
                    </span>
                    <Clock className="h-5 w-5 text-[#af52de] dark:text-[#bf5af2]" />
                  </div>
                  <div className="text-3xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                    {Math.round(totalStats.totalTimeSpent)}<span className="text-xl font-semibold text-[#86868b] dark:text-[#a1a1a6] ml-1">dk</span>
                  </div>
                  <p className="text-xs font-medium text-[#86868b] dark:text-[#a1a1a6]">
                    {t("studyTime")}
                  </p>
                </div>
              </div>

              <div className="apple-glass-card h-full">
                <div className="flex flex-col h-full w-full relative z-10 p-5">
                  <div className="flex flex-row items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-[#86868b] dark:text-[#a1a1a6]">
                      {t("activeSubjects")}
                    </span>
                    <BookOpen className="h-5 w-5 text-[#ff9500] dark:text-[#ff9f0a]" />
                  </div>
                  <div className="text-3xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                    {totalStats.totalSubjects}
                  </div>
                  <p className="text-xs font-medium text-[#86868b] dark:text-[#a1a1a6]">
                    {t("subjectCount")}
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Performance by Subject */}
              <div className="lg:col-span-2">
                <div className="apple-glass-card h-full">
                  <div className="flex flex-col h-full w-full relative z-10 p-6">
                    <div className="flex items-center mb-6">
                      <TrendingUp className="h-6 w-6 mr-2 text-[#007aff] dark:text-[#0a84ff]" />
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">{t("subjectPerformance")}</h2>
                        <p className="text-sm font-medium text-[#86868b] dark:text-[#a1a1a6]">{t("subjectPerformanceDesc")}</p>
                      </div>
                    </div>

                    {performanceData.length > 0 ? (
                      <div className="space-y-6">
                        {performanceData.map((subject, index) => (
                          <div
                            key={index}
                            className="border-b border-gray-100 dark:border-gray-800 pb-4 last:border-b-0"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-lg">
                                {subject.subject}
                              </h4>
                              <Badge
                                className={`text-sm ${subject.averageScore >= 80
                                  ? "badge-gradient-high"
                                  : subject.averageScore >= 70
                                    ? "badge-gradient-medium"
                                    : "badge-gradient-low"
                                  }`}
                              >
                                %{subject.averageScore.toFixed(0)}
                              </Badge>
                            </div>
                            <div className="progress-gradient-bg rounded-full mb-2">
                              <div
                                className="progress-gradient h-2 rounded-full transition-all duration-300"
                                style={{ width: `${subject.averageScore}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                              <span>{subject.totalTests} {t("testsCompleted")}</span>
                              <span>
                                {new Date(
                                  subject.lastUpdated,
                                ).toLocaleDateString("tr-TR")}
                              </span>
                            </div>
                            {subject.weakTopics.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-[#ff3b30] mb-2">
                                  {t("topicsToImprove")}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {subject.weakTopics
                                    .slice(0, 3)
                                    .map((topic, i) => (
                                      <Badge
                                        key={i}
                                        variant="outline"
                                        className="text-xs bg-[#ff3b30]/10 text-[#ff3b30] border-[#ff3b30]/20 font-medium"
                                      >
                                        {topic}
                                      </Badge>
                                    ))}
                                  {subject.weakTopics.length > 3 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-[#ff3b30]/10 text-[#ff3b30] border-[#ff3b30]/20 font-medium"
                                    >
                                      +{subject.weakTopics.length - 3} {t("others")}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                            {subject.strongTopics &&
                              subject.strongTopics.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-xs font-medium text-[#34c759] mb-2">
                                    {t("strongTopics")}
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {subject.strongTopics
                                      .slice(0, 2)
                                      .map((topic, i) => (
                                        <Badge
                                          key={i}
                                          variant="outline"
                                          className="text-xs bg-[#34c759]/10 text-[#34c759] border-[#34c759]/20 font-medium"
                                        >
                                          {topic}
                                        </Badge>
                                      ))}
                                    {subject.strongTopics.length > 2 && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-[#34c759]/10 text-[#34c759] border-[#34c759]/20 font-medium"
                                      >
                                        +{subject.strongTopics.length - 2} {t("others") || (locale === "tr" ? "diğer" : "other")}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="apple-glass-card h-full">
                          <div className="p-8 text-center flex flex-col items-center justify-center h-full w-full relative z-10">
                            <div className="mb-4 flex justify-center">
                              <div className="w-16 h-16 bg-[#007aff]/10 dark:bg-[#0a84ff]/20 rounded-2xl flex items-center justify-center border border-[#007aff]/20">
                                <Trophy className="w-8 h-8 text-[#007aff] dark:text-[#0a84ff]" />
                              </div>
                            </div>
                            <h3 className="text-xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                              {t("takeFirstTest")}
                            </h3>
                            <p className="text-[#86868b] dark:text-[#a1a1a6] mb-6 font-medium">
                              {t("takeFirstTestDesc")}
                            </p>
                            <Link href="/quiz" className="mt-auto w-full">
                              <Button className="w-full bg-[#007aff] hover:bg-[#007aff]/90 text-white rounded-xl shadow-md border-0 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                                <Zap className="w-4 h-4 mr-2" />
                                {t("takeTest")}
                              </Button>
                            </Link>
                          </div>
                        </div>

                        <div className="apple-glass-card h-full">
                          <div className="p-8 text-center flex flex-col items-center justify-center h-full w-full relative z-10">
                            <div className="mb-4 flex justify-center">
                              <div className="w-16 h-16 bg-[#34c759]/10 dark:bg-[#30d158]/20 rounded-2xl flex items-center justify-center border border-[#34c759]/20">
                                <Target className="w-8 h-8 text-[#34c759] dark:text-[#30d158]" />
                              </div>
                            </div>
                            <h3 className="text-xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                              {t("performanceTracking")}
                            </h3>
                            <p className="text-[#86868b] dark:text-[#a1a1a6] mb-6 font-medium">
                              {t("performanceTrackingDesc")}
                            </p>
                            <div className="text-sm text-[#86868b] dark:text-[#a1a1a6] font-medium mt-auto w-full flex flex-col items-center">
                              <div className="w-fit flex flex-col items-start gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 bg-[#007aff] rounded-full shadow-[0_0_8px_rgba(0,122,255,0.4)]"></span>
                                  <span>{t("takeTest")}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 bg-[#34c759] rounded-full shadow-[0_0_8px_rgba(52,199,89,0.4)]"></span>
                                  <span>{t("seeResults")}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 bg-[#af52de] rounded-full shadow-[0_0_8px_rgba(175,82,222,0.4)]"></span>
                                  <span>{t("trackProgress")}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="apple-glass-card h-full">
                          <div className="p-8 text-center flex flex-col items-center justify-center h-full w-full relative z-10">
                            <div className="mb-4 flex justify-center">
                              <div className="w-16 h-16 bg-[#af52de]/10 dark:bg-[#bf5af2]/20 rounded-2xl flex items-center justify-center border border-[#af52de]/20">
                                <TrendingUp className="w-8 h-8 text-[#af52de] dark:text-[#bf5af2]" />
                              </div>
                            </div>
                            <h3 className="text-xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                              {t("developmentProcess")}
                            </h3>
                            <p className="text-[#86868b] dark:text-[#a1a1a6] mb-6 font-medium">
                              {t("developmentProcessDesc")}
                            </p>
                            <div className="text-sm text-[#86868b] dark:text-[#a1a1a6] font-medium mt-auto w-full flex flex-col items-center">
                              <div className="w-fit flex flex-col items-start gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 bg-[#007aff] rounded-full shadow-[0_0_8px_rgba(0,122,255,0.4)]"></span>
                                  <span>{t("selectSubject")}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 bg-[#34c759] rounded-full shadow-[0_0_8px_rgba(52,199,89,0.4)]"></span>
                                  <span>{t("takeTest")}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 bg-[#af52de] rounded-full shadow-[0_0_8px_rgba(175,82,222,0.4)]"></span>
                                  <span>{t("watchProgress")}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Results */}
              <div>
                <div className="apple-glass-card h-full">
                  <div className="flex flex-col h-full w-full relative z-10 p-6">
                    <div className="flex items-center mb-6">
                      <Activity className="h-6 w-6 mr-2 text-[#ff2d55] dark:text-[#ff375f]" />
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">{t("recentActivities")}</h2>
                        <p className="text-sm font-medium text-[#86868b] dark:text-[#a1a1a6]">{t("recentActivitiesDesc")}</p>
                      </div>
                    </div>
                    {recentResults.length > 0 ? (
                      <div className="space-y-4">
                        {recentResults.map((result) => (
                          <div key={result.id} className="flex items-center justify-between p-3 rounded-xl bg-[#f5f5f7] dark:bg-[#1d1d1f]/50 hover:bg-[#e8e8ed] dark:hover:bg-[#2c2c2e] transition-colors border border-transparent dark:border-[#333336]">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-[#007aff]/10 dark:bg-[#0a84ff]/20 flex items-center justify-center border border-[#007aff]/20">
                                <Activity className="w-5 h-5 text-[#007aff] dark:text-[#0a84ff]" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                                    {result.type === "TopicExplainer" ? t("topicRead") : t("testSolved")}: {result.subject}
                                  </h4>
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                  <div className="flex items-center text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium">
                                    {result.isDemo ? (
                                      <Badge variant="outline" className="text-xs bg-[#ff9500]/10 text-[#ff9500] border-[#ff9500]/20 font-medium">
                                        Demo
                                      </Badge>
                                    ) : (
                                      <span className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                                        {result.type !== "TopicExplainer" && (
                                          <>
                                            {result.score}/{result.totalQuestions} {t("correct")} •{" "}
                                          </>
                                        )}
                                        {Math.round(result.timeSpent / 60)} dk
                                        {" "}•{" "}
                                        {new Date(result.createdAt).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US")}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                {result.type === "TopicExplainer" ? (
                                  <Badge className="badge-gradient-high shadow-none">{t("read")}</Badge>
                                ) : (
                                  <Badge className={`text-sm px-2 py-0.5 shadow-none ${result.score / result.totalQuestions >= 0.8
                                    ? "badge-gradient-high"
                                    : result.score / result.totalQuestions >= 0.7
                                      ? "badge-gradient-medium"
                                      : "badge-gradient-low"
                                    }`}>
                                    %{Math.round((result.score / result.totalQuestions) * 100)}
                                  </Badge>
                                )}
                              </div>
                              <Link href={`/quiz/${result.id}`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-[#86868b] hover:text-[#007aff] hover:bg-[#007aff]/10 rounded-full transition-colors">
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4 text-center">
                        <div className="apple-glass-card h-full w-full max-w-md border-0">
                          <div className="p-8 text-center flex flex-col items-center justify-center h-full w-full relative z-10">
                            <div className="mb-4 flex justify-center">
                              <div className="w-16 h-16 bg-[#ff2d55]/10 dark:bg-[#ff375f]/20 rounded-2xl flex items-center justify-center border border-[#ff2d55]/20">
                                <FileText className="w-8 h-8 text-[#ff2d55] dark:text-[#ff375f]" />
                              </div>
                            </div>
                            <h3 className="text-xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                              {t("recentActivities")}
                            </h3>
                            <p className="text-[#86868b] dark:text-[#a1a1a6] mb-6 font-medium">
                              {t("recentActivitiesEmptyDesc")}
                            </p>
                            <Link href="/quiz" className="w-full mt-auto">
                              <Button className="w-full bg-[#ff2d55] hover:bg-[#ff2d55]/90 text-white rounded-xl shadow-md border-0 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                                <Zap className="w-4 h-4 mr-2" />
                                {t("takeTest")}
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
              {/* AI Performance Recommendation */}
              <div className="lg:col-span-1">
                <AIPerformanceRecommendation
                  performanceData={performanceData}
                  recentResults={recentResults}
                  totalStats={totalStats}
                  useDemoData={useDemoData}
                  className="h-full"
                />
              </div>

              {/* Other Quick Actions */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                  <div className="apple-glass-card h-full">
                    <Link href="/quiz" className="flex flex-col h-full w-full relative z-10 p-6 text-center justify-center">
                      <Zap className="h-8 w-8 mx-auto mb-3 text-[#007aff]" />
                      <h3 className="font-semibold mb-2 text-base text-[#1d1d1f] dark:text-[#f5f5f7]">{t("quickTest")}</h3>
                      <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium">
                        {userSettings.studyPreferences.questionsPerQuiz} {t("quickTestDesc")}
                      </p>
                    </Link>
                  </div>

                  <div className="apple-glass-card h-full">
                    <Link href="/flashcard" className="flex flex-col h-full w-full relative z-10 p-6 text-center justify-center">
                      <Brain className="h-8 w-8 mx-auto mb-3 text-[#34c759]" />
                      <h3 className="font-semibold mb-2 text-base text-[#1d1d1f] dark:text-[#f5f5f7]">Flashcard</h3>
                      <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium">
                        {t("flashcardDesc")}
                      </p>
                    </Link>
                  </div>

                  <div className="apple-glass-card h-full">
                    <Link href="/ai-chat" className="flex flex-col h-full w-full relative z-10 p-6 text-center justify-center">
                      <BookOpen className="h-8 w-8 mx-auto mb-3 text-[#af52de]" />
                      <h3 className="font-semibold mb-2 text-base text-[#1d1d1f] dark:text-[#f5f5f7]">AI Tutor</h3>
                      <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium">
                        {t("aiTutorDesc")}
                      </p>
                    </Link>
                  </div>

                  <div className="apple-glass-card h-full">
                    <Link href="/subject-manager" className="flex flex-col h-full w-full relative z-10 p-6 text-center justify-center">
                      <Database className="h-8 w-8 mx-auto mb-3 text-[#ff9500]" />
                      <h3 className="font-semibold mb-2 text-base text-[#1d1d1f] dark:text-[#f5f5f7]">{t("subjectManagement")}</h3>
                      <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium">
                        {t("subjectManagementDesc")}
                      </p>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Cards */}
            <FeatureCards
              title={t("dashboardFeatures")}
              features={translatedFeatures}
              columns={3}
            />

            {/* AI Floating Chat - uses current dashboard data (demo or real) */}
            <AIFloatingChat
              subject="Dashboard"
              context={dashboardContext}
            />
          </>
        )}
      </div>
    </div>
  );
}
