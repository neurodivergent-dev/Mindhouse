"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Brain,
  Award,
  Activity,
  BarChart3,
  LineChart,
  PieChart,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { demoAnalyticsData } from "@/data/demo-data";
import { UnifiedStorageService } from "@/services/unified-storage-service";

interface AnalyticsData {
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
    subject?: string | undefined;
    topic?: string | undefined;
  }>;
  weeklyProgress?: Array<{
    day: string;
    score: number;
    tests: number;
  }>;
  subjectDistribution?: Array<{
    subject: string;
    percentage: number;
    color: string;
  }>;
}

interface QuizResult {
  totalQuestions: number;
  score: number;
  timeSpent?: number;
  weakTopics?: Record<string, number>;
  completedAt?: string;
  createdAt?: string;
  subject?: string;
  topic?: string;
  type?: string;
  isDemo?: boolean;
}

interface Subject {
  name: string;
  isActive: boolean;
}

interface AnalyticsDashboardProps {
  useMockData: boolean;
}

const IMPROVEMENT_THRESHOLD = 60;

const translateSubject = (subject: string, locale: string) => {
  if (locale === "tr") {
    return subject;
  }
  const map: Record<string, string> = {
    Matematik: "Mathematics",
    Fizik: "Physics",
    Kimya: "Chemistry",
    Biyoloji: "Biology",
    Tarih: "History",
    "Türk Dili ve Edebiyatı": "Turkish Language & Lit.",
    "Türk Dili": "Turkish Language",
    İngilizce: "English",
    Coğrafya: "Geography",
    Felsefe: "Philosophy",
    "Din Kültürü": "Religion",
  };
  return map[subject] || subject;
};

const translateTopic = (topic: string, locale: string) => {
  if (locale === "tr") {
    return topic;
  }
  const map: Record<string, string> = {
    "Türev Uygulamaları": "Derivative Applications",
    "İntegral Hesabı": "Integral Calculus",
    Logaritma: "Logarithms",
    Geometri: "Geometry",
    Cebir: "Algebra",
    Analiz: "Calculus",
    "Elektrik ve Manyetizma": "Electricity & Magnetism",
    "Dalga Hareketi": "Wave Motion",
    "Modern Fizik": "Modern Physics",
    Mekanik: "Mechanics",
    Termodinamik: "Thermodynamics",
    Elektrik: "Electricity",
    "Organik Kimya": "Organic Chemistry",
    Elektrokimya: "Electrochemistry",
    "Kimyasal Reaksiyonlar": "Chemical Reactions",
    "Anorganik Kimya": "Inorganic Chemistry",
    "Kimyasal Bağlar": "Chemical Bonds",
    Genetik: "Genetics",
    Ekoloji: "Ecology",
    "Hücre Bölünmesi": "Cell Division",
    "Hücre Biyolojisi": "Cell Biology",
    Sistemler: "Systems",
    Dokular: "Tissues",
    "Osmanlı Duraklama Dönemi": "Ottoman Stagnation Period",
    Tarih: "History",
    "Tarihsel Olaylar": "Historical Events",
    "Tarihsel Süreçler": "Historical Processes",
    "Divan Edebiyatı": "Divan Literature",
    "Çağdaş Türk Edebiyatı": "Modern Turkish Lit.",
    "Dil Bilgisi": "Grammar",
    Edebiyat: "Literature",
    "Çağdaş Edebiyat": "Modern Literature",
    "Grammar Tenses": "Grammar Tenses",
    "Reading Comprehension": "Reading Comprehension",
    Vocabulary: "Vocabulary",
    "Türk Dili": "Turkish Language",
    Coğrafya: "Geography",
    Felsefe: "Philosophy",
    "Din Kültürü": "Religion",
  };
  return map[topic] || topic;
};

const translateDay = (day: string, locale: string) => {
  if (locale === "tr") {
    return day;
  }
  const map: Record<string, string> = {
    Pazartesi: "Monday",
    Salı: "Tuesday",
    Çarşamba: "Wednesday",
    Perşembe: "Thursday",
    Cuma: "Friday",
    Cumartesi: "Saturday",
    Pazar: "Sunday",
  };
  return map[day] || day;
};

// return the useMockData parameter
export default function AnalyticsDashboard({ useMockData }: AnalyticsDashboardProps) {
  const t = useTranslations("AnalyticsDashboard");
  const tDashboard = useTranslations("Dashboard");
  const locale = useLocale();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalQuestions: 0,
    correctAnswers: 0,
    averageScore: 0,
    studyTime: 0,
    streak: 0,
    rank: 0,
    totalUsers: 0,
    improvement: 0,
    weakTopics: [],
    strongTopics: [],
    topicsNeedingImprovement: [],
    recentActivity: [],
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateMockData = () => {
      // Use rich demo data      if (useMockData) {
        setAnalytics({
          ...demoAnalyticsData,
          weakTopics: demoAnalyticsData.weakTopics?.map((t) => translateTopic(t, locale)) || [],
          strongTopics: demoAnalyticsData.strongTopics?.map((t) => translateTopic(t, locale)) || [],
          topicsNeedingImprovement:
            demoAnalyticsData.topicsNeedingImprovement?.map((t) => translateTopic(t, locale)) || [],
          recentActivity:
            demoAnalyticsData.recentActivity?.map((item) => ({
              ...item,
              subject: translateSubject(item.subject || "", locale),
            })) || [],
          subjectDistribution:
            demoAnalyticsData.subjectDistribution?.map((item) => ({
              ...item,
              subject: translateSubject(item.subject || "", locale),
            })) || [],
          weeklyProgress:
            demoAnalyticsData.weeklyProgress?.map((item) => ({
              ...item,
              day: translateDay(item.day || "", locale),
            })) || [],
        });
      } else {
        // Simple mock data (old version)
        const mockData: AnalyticsData = {
          totalQuestions: Math.floor(Math.random() * 500) + 100,
          correctAnswers: Math.floor(Math.random() * 400) + 80,
          averageScore: Math.floor(Math.random() * 30) + 70,
          studyTime: Math.floor(Math.random() * 120) + 30,
          streak: Math.floor(Math.random() * 15) + 5,
          rank: Math.floor(Math.random() * 1000) + 1,
          totalUsers: Math.floor(Math.random() * 5000) + 1000,
          improvement: Math.floor(Math.random() * 20) + 5,
          weakTopics: ["Finansal Analiz", "Muhasebe", "İstatistik"],
          strongTopics: ["Matematik", "Ekonomi", "Yönetim"],
          topicsNeedingImprovement: ["Finansal Analiz", "Muhasebe"],
          recentActivity: [],
        };
        setAnalytics(mockData);
      }
      setIsLoading(false);
    };

    const fetchRealData = async () => {
      try {
        // Make sure the IndexedDB-backed cache is ready before reading
        await UnifiedStorageService.initialize();

        // Get data from localStorage
        const getAnalyticsFromStorage = () => {
          if (typeof window === "undefined") {
            return null;
          }

          try {
            // Calculate analytics from quiz results
            const quizResultsKey = useMockData
              ? "exam_training_demo_quiz_results"
              : "exam_training_quiz_results";
            const quizResults = localStorage.getItem(quizResultsKey);
            const results: QuizResult[] = quizResults ? JSON.parse(quizResults) : [];

            // Filter out demo results if not in demo mode
            const filteredResults = useMockData
              ? results
              : results.filter((result: QuizResult) => !result.isDemo);

            // Get subject information from Subjects (IndexedDB)
            const subjectsData: Subject[] = UnifiedStorageService.getSubjects();

            // Get question information from Questions (not currently used)
            // const questions = localStorage.getItem('mindhouse_questions');

            if (filteredResults.length === 0) {
              // If there are no quiz results, use simple mock data
              return {
                totalQuestions: 0,
                correctAnswers: 0,
                averageScore: 0,
                studyTime: 0,
                streak: 0,
                rank: 0,
                totalUsers: 1,
                improvement: 0,
                weakTopics: [],
                strongTopics: [],
                topicsNeedingImprovement: [],
                recentActivity: [],
              };
            }

            // Calculate analytics (exclude TopicExplainer from question counts)
            const quizOnlyResults = filteredResults.filter(
              (r: QuizResult) => r.type !== "TopicExplainer",
            );

            const totalQuestions = quizOnlyResults.reduce(
              (sum: number, result: QuizResult) => sum + (result.totalQuestions || 0),
              0,
            );
            const correctAnswers = quizOnlyResults.reduce(
              (sum: number, result: QuizResult) => sum + (result.score || 0),
              0,
            );
            const averageScore =
              totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
            const studyTime = filteredResults.reduce(
              (sum: number, result: QuizResult) => sum + (result.timeSpent || 0),
              0,
            );

            // Calculate weak topics and topics that need improvement
            const weakTopicsMap: Record<string, number> = {};
            const topicPerformanceMap: Record<string, { correct: number; total: number }> = {};

            filteredResults.forEach((result: QuizResult) => {
              if (result.weakTopics) {
                // Calculate total questions for this result
                const totalQuestionsInResult = result.totalQuestions;

                // Get all topics from this result
                const allTopicsInResult = Object.keys(result.weakTopics);
                const questionsPerTopic = totalQuestionsInResult / allTopicsInResult.length;

                Object.entries(result.weakTopics).forEach(([topic, weakCount]) => {
                  weakTopicsMap[topic] = (weakTopicsMap[topic] || 0) + weakCount;

                  // Track performance for all topics with real data
                  if (!topicPerformanceMap[topic]) {
                    topicPerformanceMap[topic] = { correct: 0, total: 0 };
                  }

                  // Calculate real performance for this topic
                  const topicQuestions = Math.round(questionsPerTopic);
                  const topicCorrect = Math.max(0, topicQuestions - weakCount);

                  topicPerformanceMap[topic].total += topicQuestions;
                  topicPerformanceMap[topic].correct += topicCorrect;
                });
              }
            });

            // Weak topics (topics with high error rates)
            const weakTopics = Object.entries(weakTopicsMap)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([topic]) => topic);

            // Topics that need improvement (configurable threshold)
            const topicsNeedingImprovement = Object.entries(topicPerformanceMap)
              .filter(([, performance]) => {
                if (performance.total < 2) {
                  return false; // Need at least 2 questions
                }
                const successRate = (performance.correct / performance.total) * 100;
                return successRate <= IMPROVEMENT_THRESHOLD;
              })
              .map(([topic, performance]) => ({
                topic,
                successRate: Math.round((performance.correct / performance.total) * 100),
              }))
              .slice(0, 3);

            // Calculate strong topics (topics with configurable threshold)
            const STRONG_THRESHOLD = 80; // Configurable threshold
            const strongTopics = Array.from(Object.keys(topicPerformanceMap))
              .filter((topic) => {
                const performance = topicPerformanceMap[topic];
                if (!performance || performance.total < 2) {
                  return false;
                } // Need at least 2 questions

                const successRate = (performance.correct / performance.total) * 100;
                return (
                  successRate >= STRONG_THRESHOLD &&
                  !weakTopics.includes(topic) &&
                  !topicsNeedingImprovement.some((item) => item.topic === topic)
                );
              })
              .slice(0, 3);

            // If no strong topics found, use some default topics
            const defaultStrongTopics =
              strongTopics.length === 0
                ? subjectsData
                    .filter((subject: Subject) => subject.isActive)
                    .slice(0, 3)
                    .map((subject: Subject) => subject.name)
                : strongTopics;

            // Recent activity
            const recentActivity = filteredResults.slice(-5).map((result: QuizResult) => ({
              type: result.type || "Quiz",
              score:
                result.totalQuestions && result.totalQuestions > 0
                  ? Math.round((result.score / result.totalQuestions) * 100)
                  : 100,
              timestamp:
                (result as any).completedAt || result.createdAt || new Date().toISOString(),
              subject: result.subject,
              topic: result.topic,
            }));

            return {
              totalQuestions,
              correctAnswers,
              averageScore,
              studyTime: Math.floor(studyTime / 60), // convert to minutes
              streak: Math.min(results.length, 7), // Simple streak calculation
              rank: Math.floor(Math.random() * 1000) + 1, // Mock rank
              totalUsers: 1,
              improvement: Math.floor(Math.random() * 20) + 5,
              weakTopics,
              strongTopics: defaultStrongTopics,
              topicsNeedingImprovement: topicsNeedingImprovement.map((item) => item.topic),
              recentActivity,
            };
          } catch {
            //do nothing
            return null;
          }
        };

        const analyticsData = getAnalyticsFromStorage();

        if (analyticsData) {
          setAnalytics((prev) => ({ ...prev, ...analyticsData }));
        } else {
          // Fallback mock data
          const fallbackData: AnalyticsData = {
            totalQuestions: 0,
            correctAnswers: 0,
            averageScore: 0,
            studyTime: 0,
            streak: 0,
            rank: 0,
            totalUsers: 1,
            improvement: 0,
            weakTopics: [],
            strongTopics: [],
            topicsNeedingImprovement: [],
            recentActivity: [],
          };
          setAnalytics(fallbackData);
        }
      } catch {
        //do nothing
      } finally {
        setIsLoading(false);
      }
    };

    // load data immediately when useMockData changes
    setIsLoading(true);

    if (useMockData) {
      generateMockData();
    } else {
      fetchRealData();
    }

    return () => {};
  }, [useMockData, locale]); // add useMockData as a dependency

  // add console log for debugging
  useEffect(() => {}, [analytics]);

  const getScoreColor = (score: number) => {
    if (score >= 90) {
      return "text-[#34c759] dark:text-[#30d158] border-[#34c759]/30 bg-[#34c759]/10 font-bold shadow-none";
    }
    if (score >= 80) {
      return "text-[#007aff] dark:text-[#0a84ff] border-[#007aff]/30 bg-[#007aff]/10 font-bold shadow-none";
    }
    if (score >= 70) {
      return "text-[#ff9500] dark:text-[#ff9f0a] border-[#ff9500]/30 bg-[#ff9500]/10 font-bold shadow-none";
    }
    return "text-[#ff3b30] dark:text-[#ff453a] border-[#ff3b30]/30 bg-[#ff3b30]/10 font-bold shadow-none";
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0
      ? t("timeHoursMinutes", { hours, minutes: mins })
      : t("timeMinutesOnly", { minutes: mins });
  };

  const getActivityLabel = (type: string) => {
    const normalizedType = type.toLowerCase();
    switch (normalizedType) {
      case "quiz":
        return t("activityQuiz");
      case "flashcard":
        return t("activityFlashcard");
      case "topicexplainer":
        return t("activityTopicExplainer");
      case "ai_chat":
        return t("activityAiChat");
      default:
        return type;
    }
  };

  const dateLocale = locale === "tr" ? "tr-TR" : "en-US";

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Live Badge */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
          <BarChart3 className="w-6 h-6 text-[#007aff] dark:text-[#0a84ff]" />
          {t("title")}
        </h2>
        <Badge className="bg-[#34c759]/10 text-[#34c759] border-[#34c759]/20 animate-pulse font-medium shadow-none">
          <Activity className="w-3 h-3 mr-1" />
          {t("liveBadge")}
        </Badge>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Questions */}
        <Card className="apple-glass-card border-0 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              {t("totalQuestionsAnswered")}
            </CardTitle>
            <Target className="h-4 w-4 text-[#007aff] dark:text-[#0a84ff]" />
          </CardHeader>
          <CardContent>
            {analytics.totalQuestions > 0 ? (
              <>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {analytics.totalQuestions.toLocaleString()}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t("allTime")}</p>
              </>
            ) : (
              <div className="flex flex-col items-center text-center py-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center mb-3 border border-blue-500/20">
                  <Target className="w-5 h-5 text-blue-500" />
                </div>
                <h4 className="text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                  {t("noQuestionsYet")}
                </h4>
                <p className="text-[10px] text-[#86868b] dark:text-[#a1a1a6] font-medium">
                  {t("startByTakingTests")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Average Score */}
        <Card className="apple-glass-card border-0 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              {t("averageScore")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-[#34c759] dark:text-[#30d158]" />
          </CardHeader>
          <CardContent>
            {analytics.averageScore > 0 ? (
              <>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {analytics.averageScore}%
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t("overallSuccessRate")}
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center text-center py-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center mb-3 border border-green-500/20">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h4 className="text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                  {t("noScoreYet")}
                </h4>
                <p className="text-[10px] text-[#86868b] dark:text-[#a1a1a6] font-medium">
                  {t("takeFirstTest")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Study Time */}
        <Card className="apple-glass-card border-0 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              {t("totalStudyTime")}
            </CardTitle>
            <Clock className="h-4 w-4 text-[#af52de] dark:text-[#bf5af2]" />
          </CardHeader>
          <CardContent>
            {analytics.studyTime > 0 ? (
              <>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatTime(analytics.studyTime)}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t("allTime")}</p>
              </>
            ) : (
              <div className="flex flex-col items-center text-center py-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center mb-3 border border-purple-500/20">
                  <Clock className="w-5 h-5 text-purple-500" />
                </div>
                <h4 className="text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                  {t("noStudyYet")}
                </h4>
                <p className="text-[10px] text-[#86868b] dark:text-[#a1a1a6] font-medium">
                  {t("startStudying")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Progress */}
        <Card className="apple-glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#1d1d1f] dark:text-[#f5f5f7]">
              <LineChart className="w-5 h-5 text-[#007aff] dark:text-[#0a84ff]" />
              {t("performanceProgress")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.totalQuestions > 0 ? (
              <>
                <div>
                  <div className="flex justify-between text-sm mb-2 text-gray-700 dark:text-gray-300">
                    <span>{t("overallSuccess")}</span>
                    <span>{analytics.averageScore}%</span>
                  </div>
                  <div className="progress-gradient-bg rounded-full h-2">
                    <div
                      className="progress-gradient h-2 rounded-full transition-all duration-300"
                      style={{ width: `${analytics.averageScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2 text-gray-700 dark:text-gray-300">
                    <span>{t("correctAnswerRate")}</span>
                    <span>
                      {analytics.totalQuestions > 0
                        ? Math.round((analytics.correctAnswers / analytics.totalQuestions) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="progress-gradient-bg rounded-full h-2">
                    <div
                      className="progress-gradient h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${analytics.totalQuestions > 0 ? (analytics.correctAnswers / analytics.totalQuestions) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2 text-gray-700 dark:text-gray-300">
                    <span>{t("studyTime")}</span>
                    <span>{formatTime(analytics.studyTime)}</span>
                  </div>
                  <div className="progress-gradient-bg rounded-full h-2">
                    <div
                      className="progress-gradient h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((analytics.studyTime / 120) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/40 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.05] shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center mb-4 border border-blue-500/20">
                  <LineChart className="w-6 h-6 text-blue-500" />
                </div>
                <h4 className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                  {t("noPerformanceData")}
                </h4>
                <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium max-w-[250px]">
                  {t("trackPerformanceByTests")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Topic Analysis */}
        <Card className="apple-glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#1d1d1f] dark:text-[#f5f5f7]">
              <PieChart className="w-5 h-5 text-[#34c759] dark:text-[#30d158]" />
              {t("topicAnalysis")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.strongTopics.length === 0 && analytics.weakTopics.length === 0 ? (
              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/40 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.05] shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center mb-4 border border-green-500/20">
                  <PieChart className="w-6 h-6 text-green-500" />
                </div>
                <h4 className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                  {t("topicAnalysis")}
                </h4>
                <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium max-w-[250px]">
                  {t("topicAnalysisPlaceholder")}
                </p>
              </div>
            ) : (
              <>
                {/* Strong Topics */}
                <div>
                  <h4 className="text-sm font-medium mb-2 text-[#34c759] dark:text-[#30d158]">
                    {t("strongTopics")}
                  </h4>
                  {analytics.strongTopics && analytics.strongTopics.length > 0 ? (
                    <div className="space-y-2">
                      {analytics.strongTopics
                        // If a topic is in weak topics, it will not be shown in strong topics
                        .filter((topic) => !analytics.weakTopics.includes(topic))
                        .map((topic, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-[#f5f5f7] dark:bg-[#2c2c2e]/50 rounded-xl"
                          >
                            <span className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                              {topic}
                            </span>
                            <Badge className="bg-[#34c759]/10 text-[#34c759] border-[#34c759]/20 font-medium shadow-none">
                              {t("strong")}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center p-3 bg-[#f5f5f7] dark:bg-[#1d1d1f]/50 rounded-xl border border-transparent dark:border-[#38383a]">
                      <p className="text-sm text-[#86868b] dark:text-[#a1a1a6]">
                        {t("noStrongTopicsDetected")}
                      </p>
                      <p className="text-xs text-[#86868b] dark:text-[#86868b]">
                        {t("identifyStrongTopics")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Weak Topics */}
                <div>
                  <h4 className="text-sm font-medium mb-2 text-[#ff3b30] dark:text-[#ff453a]">
                    {t("needsImprovement")}
                  </h4>
                  {analytics.weakTopics && analytics.weakTopics.length > 0 ? (
                    <div className="space-y-2">
                      {analytics.weakTopics.map((topic, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-[#f5f5f7] dark:bg-[#2c2c2e]/50 rounded-xl"
                        >
                          <span className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                            {topic}
                          </span>
                          <Badge className="bg-[#ff3b30]/10 text-[#ff3b30] border-[#ff3b30]/20 font-medium shadow-none">
                            {t("weak")}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-[#34c759]/10 rounded-xl border border-[#34c759]/20">
                      <Award className="w-8 h-8 text-[#34c759] mx-auto mb-2" />
                      <p className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                        {t("greatJob")}
                      </p>
                      <p className="text-sm text-[#34c759] dark:text-[#30d158]">
                        {t("noTopicsNeedImprovementFound")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Topics Needing Improvement (configurable threshold) */}
                <div>
                  <h4 className="text-sm font-medium mb-2 text-[#ff9500] dark:text-[#ff9f0a]">
                    {t("belowThresholdSuccess", { threshold: IMPROVEMENT_THRESHOLD })}
                  </h4>
                  {analytics.topicsNeedingImprovement &&
                  analytics.topicsNeedingImprovement.length > 0 ? (
                    <div className="space-y-2">
                      {analytics.topicsNeedingImprovement.map((topic, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-[#f5f5f7] dark:bg-[#2c2c2e]/50 rounded-xl"
                        >
                          <span className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                            {topic}
                          </span>
                          <Badge className="bg-[#ff9500]/10 text-[#ff9500] border-[#ff9500]/20 font-medium shadow-none">
                            {t("thresholdBadge", { threshold: IMPROVEMENT_THRESHOLD })}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-3 bg-[#007aff]/10 rounded-xl border border-[#007aff]/20">
                      <p className="text-sm text-[#007aff] dark:text-[#0a84ff]">
                        {t("noBelowThresholdTopics", { threshold: IMPROVEMENT_THRESHOLD })}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weak and Strong Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="apple-glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#1d1d1f] dark:text-[#f5f5f7]">
              <TrendingDown className="w-5 h-5 text-[#ff3b30] dark:text-[#ff453a]" />
              {t("topicsNeedingImprovement")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.weakTopics.length > 0 || analytics.topicsNeedingImprovement.length > 0 ? (
              <div className="space-y-2">
                {analytics.weakTopics.map((topic, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-[#ff3b30]/10 dark:bg-[#ff3b30]/10 rounded-xl"
                  >
                    <span className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {topic}
                    </span>
                    <Badge className="bg-[#ff3b30]/10 text-[#ff3b30] border-[#ff3b30]/20 shadow-none text-xs">
                      {t("weak")}
                    </Badge>
                  </div>
                ))}
                {analytics.topicsNeedingImprovement.map((topic, index) => (
                  <div
                    key={`improvement-${index}`}
                    className="flex items-center justify-between p-2 bg-[#ff9500]/10 dark:bg-[#ff9500]/10 rounded-xl"
                  >
                    <span className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {topic}
                    </span>
                    <Badge className="bg-[#ff9500]/10 text-[#ff9500] border-[#ff9500]/20 shadow-none text-xs">
                      {t("thresholdBadge", { threshold: IMPROVEMENT_THRESHOLD })}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/40 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.05] shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/10 to-pink-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                  <TrendingDown className="w-6 h-6 text-red-500" />
                </div>
                <h4 className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                  {t("noTopicsNeedingImprovement")}
                </h4>
                <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium max-w-[250px]">
                  {t("greatPerformanceAllTopics")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="apple-glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#1d1d1f] dark:text-[#f5f5f7]">
              <TrendingUp className="w-5 h-5 text-[#34c759] dark:text-[#30d158]" />
              {t("yourStrongTopics")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.strongTopics.length > 0 ? (
              <div className="space-y-2">
                {analytics.strongTopics.map((topic, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-[#34c759]/10 dark:bg-[#34c759]/10 rounded-xl"
                  >
                    <span className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {topic}
                    </span>
                    <Badge className="bg-[#34c759]/10 text-[#34c759] border-[#34c759]/20 shadow-none text-xs">
                      {t("strong")}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/40 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.05] shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center mb-4 border border-green-500/20">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
                <h4 className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                  {t("noStrongTopicsYet")}
                </h4>
                <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium max-w-[250px]">
                  {t("identifyStrongTopicsShort")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress Graph */}
      <Card className="apple-glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#1d1d1f] dark:text-[#f5f5f7]">
            <LineChart className="w-5 h-5 text-[#af52de] dark:text-[#bf5af2]" />
            {t("weeklyProgressAnalysis")}
            {analytics.weeklyProgress && (
              <Badge className="bg-[#ff9500]/10 text-[#ff9500] border-[#ff9500]/20 shadow-none text-xs">
                {tDashboard("demo")}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.weeklyProgress && analytics.weeklyProgress.length > 0 ? (
            <div className="space-y-4">
              {analytics.weeklyProgress.map((day, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                      {day.day}
                    </span>
                  </div>
                  <div className="flex-1 mx-2 min-w-0">
                    <div className="progress-gradient-bg rounded-full h-3">
                      <div
                        className="progress-gradient h-3 rounded-full transition-all duration-300"
                        style={{ width: `${day.score}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm min-w-0">
                    <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">
                      %{day.score}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-xs whitespace-nowrap border-[#e5e5ea] dark:border-[#38383a] text-[#86868b] dark:text-[#a1a1a6]"
                    >
                      {t("testsCount", { count: day.tests })}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/40 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.05] shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 flex items-center justify-center mb-4 border border-purple-500/20">
                <LineChart className="w-6 h-6 text-purple-500" />
              </div>
              <h4 className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                {t("noWeeklyProgressData")}
              </h4>
              <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium max-w-[250px]">
                {t("trackWeeklyProgress")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Demo: Subject Distribution */}
      <Card className="apple-glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#1d1d1f] dark:text-[#f5f5f7]">
            <PieChart className="w-5 h-5 text-[#5856d6] dark:text-[#5e5ce6]" />
            {t("subjectStudyDistribution")}
            {analytics.subjectDistribution && (
              <Badge className="bg-[#ff9500]/10 text-[#ff9500] border-[#ff9500]/20 shadow-none text-xs">
                {tDashboard("demo")}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.subjectDistribution && analytics.subjectDistribution.length > 0 ? (
            <div className="space-y-3">
              {analytics.subjectDistribution.map((subject, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: subject.color }}
                    ></div>
                    <span className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                      {subject.subject}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-20 sm:w-32 flex-shrink-0">
                      <div className="progress-gradient-bg rounded-full h-2">
                        <div
                          className="progress-gradient h-2 rounded-full transition-all duration-300"
                          style={{ width: `${subject.percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-semibold w-12 text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">
                      %{subject.percentage}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/40 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.05] shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center mb-4 border border-indigo-500/20">
                <PieChart className="w-6 h-6 text-indigo-500" />
              </div>
              <h4 className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                {t("noSubjectDistributionData")}
              </h4>
              <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium max-w-[250px]">
                {t("seeDistributionByTests")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="apple-glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#1d1d1f] dark:text-[#f5f5f7]">
            <Activity className="w-5 h-5 text-[#007aff] dark:text-[#0a84ff]" />
            {t("recentActivities")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {analytics.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#f5f5f7] dark:bg-[#2c2c2e]/50 hover:bg-[#e8e8ed] dark:hover:bg-[#3a3a3c] transition-colors border border-transparent dark:border-[#38383a]"
                >
                  <div className="flex items-center gap-3">
                    {activity.type.toLowerCase() === "quiz" && (
                      <Target className="w-4 h-4 text-[#007aff]" />
                    )}
                    {activity.type.toLowerCase() === "flashcard" && (
                      <Brain className="w-4 h-4 text-[#34c759]" />
                    )}
                    {activity.type.toLowerCase() === "topicexplainer" && (
                      <BookOpen className="w-4 h-4 text-[#ff9500]" />
                    )}
                    {activity.type.toLowerCase() === "ai_chat" && (
                      <Sparkles className="w-4 h-4 text-[#af52de]" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                        {getActivityLabel(activity.type)}
                      </p>
                      {activity.topic ? (
                        <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium">
                          {activity.subject} - {activity.topic}
                        </p>
                      ) : (
                        activity.subject && (
                          <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium">
                            {activity.subject}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getScoreColor(activity.score)}`}>%{activity.score}</Badge>
                    <span className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                      {new Date(activity.timestamp).toLocaleDateString(dateLocale)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/40 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.05] shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-emerald-500/10 flex items-center justify-center mb-4 border border-blue-500/20">
                <Activity className="w-6 h-6 text-blue-500" />
              </div>
              <h4 className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                {t("noActivityYet")}
              </h4>
              <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium max-w-[250px]">
                {t("createActivityHint")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
