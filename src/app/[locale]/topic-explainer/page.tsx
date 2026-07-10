"use client";

import React, { useState, useEffect, Suspense, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import TopicExplainer from "@/components/topic-explainer";
import FeatureCards from "@/components/ui/feature-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Brain,
  Lightbulb,
  Target,
  ArrowLeft,
  Plus,
  GraduationCap,
  Trash2,
  Search,
  Loader2,
  Clock,
  Bot,
} from "lucide-react";
import { shouldUseDemoData } from "@/data/demo-data";
import TopicExplainerLocalStorageService from "@/services/topic-explainer-service";
import { UnifiedStorageService } from "@/services/unified-storage-service";

interface Topic {
  name: string;
  subject: string;
  difficulty: string;
  estimatedTime: number;
}

interface Subject {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  questionCount: number;
  isActive: boolean;
}

const TopicExplainerPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("TopicExplainer");
  const locale = useLocale();

  const getTranslatedSubject = (name: string) => {
    if (locale === "tr") {
      return name;
    }
    const map: Record<string, string> = {
      Matematik: "Mathematics",
      Fizik: "Physics",
      Kimya: "Chemistry",
      Biyoloji: "Biology",
      Tarih: "History",
      "Türk Dili ve Edebiyatı": "Turkish Literature",
      "Türk Dili": "Turkish Literature",
      İngilizce: "English",
      Coğrafya: "Geography",
    };
    return map[name] || name;
  };

  const getTranslatedCategory = (category: string) => {
    if (locale === "tr") {
      return category;
    }
    const map: Record<string, string> = {
      Sayısal: "Science & Math",
      "Fen Bilimleri": "Science",
      "Sosyal Bilimler": "Social Sciences",
      Sözel: "Verbal",
      "Yabancı Dil": "Foreign Language",
    };
    return map[category] || category;
  };

  const getTranslatedDescription = (desc: string) => {
    if (locale === "tr") {
      return desc;
    }
    const map: Record<string, string> = {
      "Temel matematik konuları: Cebir, Geometri, Analiz":
        "Basic math topics: Algebra, Geometry, Calculus",
      "Mekanik, Termodinamik, Elektrik ve Manyetizma":
        "Mechanics, Thermodynamics, Electricity and Magnetism",
      "Genel Kimya, Organik ve Anorganik Kimya":
        "General Chemistry, Organic and Inorganic Chemistry",
      "Hücre Biyolojisi, Genetik, Ekoloji": "Cell Biology, Genetics, Ecology",
      "Türk Tarihi, Dünya Tarihi, Çağdaş Tarih":
        "Turkish History, World History, Contemporary History",
      "Dil Bilgisi, Klasik Edebiyat, Çağdaş Edebiyat":
        "Grammar, Classical Literature, Contemporary Literature",
      "Grammar, Vocabulary, Reading Comprehension": "Grammar, Vocabulary, Reading Comprehension",
    };
    return map[desc] || desc;
  };

  const topic = searchParams.get("topic");
  const subject = searchParams.get("subject");
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSubject, setCurrentSubject] = useState<string | null>(null);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  // Async resolved saved-topic state (avoids race with UnifiedStorageService init)
  const [savedTopicId, setSavedTopicId] = useState<string | null>(null);
  const [hasSavedContent, setHasSavedContent] = useState(false);
  const [isTopicViewReady, setIsTopicViewReady] = useState(false);

  const getDifficultyLabel = useCallback(
    (difficulty: string) => {
      const map: Record<string, string> = {
        Kolay: t("difficultyEasy"),
        Orta: t("difficultyMedium"),
        Zor: t("difficultyHard"),
        easy: t("difficultyEasy"),
        medium: t("difficultyMedium"),
        hard: t("difficultyHard"),
      };
      return map[difficulty] ?? difficulty;
    },
    [t],
  );

  const getDifficultyBadgeClass = (difficulty: string) => {
    if (difficulty === "Kolay" || difficulty === "easy") {
      return "bg-green-500/15 text-green-700 dark:text-green-400 text-xs font-semibold border-0 px-2.5 py-0.5";
    }
    if (difficulty === "Orta" || difficulty === "medium") {
      return "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 text-xs font-semibold border-0 px-2.5 py-0.5";
    }
    return "bg-red-500/15 text-red-700 dark:text-red-400 text-xs font-semibold border-0 px-2.5 py-0.5";
  };

  const topicFeatures = useMemo(
    () => [
      {
        icon: Brain,
        title: t("featureAiLearning"),
        description: t("featureAiLearningDesc"),
        iconBgColor: "bg-gradient-to-r from-blue-600 to-indigo-600",
      },
      {
        icon: Target,
        title: t("featureStepByStep"),
        description: t("featureStepByStepDesc"),
        iconBgColor: "bg-gradient-to-r from-green-600 to-emerald-600",
      },
      {
        icon: Lightbulb,
        title: t("featureInteractive"),
        description: t("featureInteractiveDesc"),
        iconBgColor: "bg-gradient-to-r from-purple-600 to-pink-600",
      },
    ],
    [t],
  );

  useEffect(() => {
    const init = async () => {
      const demoMode = shouldUseDemoData();
      setIsDemoMode(demoMode);

      if (demoMode) {
        const { getDemoSubjects } = await import("@/data/demo-data");
        const demoData = getDemoSubjects(locale);
        setSubjects(demoData);
        setIsLoading(false);
        return;
      }

      // Ensure UnifiedStorageService is initialized (loads from IndexedDB into cache)
      await UnifiedStorageService.initialize();

      // Load subjects from the unified cache (IndexedDB-backed)
      const loadedSubjects = UnifiedStorageService.getSubjects();
      setSubjects(loadedSubjects);
      setIsLoading(false);
    };

    void init();
  }, [locale]);

  // Async resolve hasSavedContent after storage is ready
  useEffect(() => {
    if (!topic || !subject) {
      setIsTopicViewReady(true);
      return;
    }

    const resolveSavedTopic = async () => {
      // Make sure storage is initialized before querying saved topics
      await UnifiedStorageService.initialize();
      const savedTopics = TopicExplainerLocalStorageService.getTopicsByTopic(topic);
      const match = savedTopics.find((item) => item.subject === subject);
      setHasSavedContent(Boolean(match));
      setSavedTopicId(match?.id ?? null);
      setIsTopicViewReady(true);
    };

    void resolveSavedTopic();
  }, [topic, subject]);

  useEffect(() => {
    if (subject && subject !== currentSubject) {
      setCurrentSubject(subject);
    }
  }, [subject, currentSubject]);

  const generateTopicsForSubject = useCallback(
    (subjectItem: Subject): Topic[] => {
      const baseTopics = [
        { nameKey: "topicBasicConcepts" as const, difficulty: "easy", estimatedTime: 20 },
        // Avoid overly generic names like "Main Topics" that lead to poor AI output.
        // Use more specific sounding ones that still work as entry points.
        { nameKey: "topicCoreIdeas" as const, difficulty: "medium", estimatedTime: 30 },
        { nameKey: "topicAdvanced" as const, difficulty: "hard", estimatedTime: 40 },
        { nameKey: "topicApplications" as const, difficulty: "medium", estimatedTime: 35 },
        { nameKey: "topicProblemSolving" as const, difficulty: "hard", estimatedTime: 45 },
        { nameKey: "topicExamPrep" as const, difficulty: "easy", estimatedTime: 25 },
      ];

      return baseTopics.map((topicItem) => ({
        name: t(topicItem.nameKey),
        subject: subjectItem.name,
        difficulty: topicItem.difficulty,
        estimatedTime: topicItem.estimatedTime,
      }));
    },
    [t],
  );

  const availableTopics = useMemo(() => {
    const realTopics: Topic[] = [];
    subjects.forEach((subjectItem) => {
      if (subjectItem.isActive) {
        realTopics.push(...generateTopicsForSubject(subjectItem));
      }
    });
    return realTopics;
  }, [subjects, generateTopicsForSubject]);

  const activeSubjects = useMemo(() => subjects.filter((s) => s.isActive), [subjects]);

  const filteredTopics = useMemo(() => {
    let result = availableTopics;

    if (selectedSubjectFilter !== "all") {
      result = result.filter((t) => t.subject === selectedSubjectFilter);
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.subject.toLowerCase().includes(query) ||
          getTranslatedSubject(t.subject).toLowerCase().includes(query),
      );
    }

    return result;
  }, [availableTopics, selectedSubjectFilter, searchQuery]);

  if (topic && subject) {
    if (!isTopicViewReady) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
        </div>
      );
    }

    return (
      <TopicExplainer
        topic={topic}
        subject={subject}
        isDemoMode={isDemoMode}
        hasSavedContent={hasSavedContent}
        savedTopicId={hasSavedContent ? savedTopicId : null}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] dark:bg-transparent dark:!bg-none flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-7 h-7 animate-spin mx-auto mb-3 text-blue-500" />
          <p className="text-[#86868b] dark:text-[#a1a1a6] text-sm">{t("loadingTopics")}</p>
        </div>
      </div>
    );
  }

  const handleClearAllContent = () => {
    const savedTopics = TopicExplainerLocalStorageService.getSavedTopics();
    savedTopics.forEach((savedTopic) => {
      TopicExplainerLocalStorageService.deleteTopic(savedTopic.id);
    });
    window.location.reload();
  };

  const handleTopicClick = (topicItem: Topic) => {
    router.push(
      `/topic-explainer?topic=${encodeURIComponent(topicItem.name)}&subject=${encodeURIComponent(topicItem.subject)}`,
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-transparent dark:!bg-none">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 flex items-center gap-2 text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("backToDashboard")}
            </Button>
          </Link>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shrink-0">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-4xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                    {t("title")}
                  </h1>
                  {isDemoMode && (
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs px-2.5 py-0.5">
                      {t("demo")}
                    </Badge>
                  )}
                </div>
                <p className="text-[#86868b] dark:text-[#a1a1a6] text-sm md:text-base font-medium mt-0.5 max-w-2xl">
                  {t("subtitle")}
                </p>
              </div>
            </div>

            <Button
              onClick={handleClearAllContent}
              size="sm"
              variant="ghost"
              className="text-[#86868b] dark:text-[#a1a1a6] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 rounded-xl text-sm"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t("clearAll")}
            </Button>
          </div>
        </div>

        {/* Smart Features */}
        <div className="apple-glass-card mb-8">
          <div className="w-full relative z-10 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm shrink-0">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                {t("smartFeatures")}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 shadow-sm shadow-slate-200/60">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                  <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold block">
                    {t("featureAiLearning")}
                  </span>
                  <span className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                    {t("featureAiLearningDesc")}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 shadow-sm shadow-slate-200/60">
                <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold block">
                    {t("featureStepByStep")}
                  </span>
                  <span className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                    {t("featureStepByStepDesc")}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 shadow-sm shadow-slate-200/60">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold block">
                    {t("featureInteractive")}
                  </span>
                  <span className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                    {t("featureInteractiveDesc")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subjects Grid */}
        {subjects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-5 tracking-tight">
              {t("yourSubjects")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {subjects
                .filter((subjectItem) => subjectItem.isActive)
                .map((subjectItem) => (
                  <div
                    key={subjectItem.id}
                    className="apple-glass-card group hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    <div className="w-full relative z-10 p-5 md:p-6">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base md:text-lg text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                            {getTranslatedSubject(subjectItem.name)}
                          </h3>
                          <p className="text-xs md:text-sm text-[#86868b] dark:text-[#a1a1a6]">
                            {getTranslatedCategory(subjectItem.category)}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mb-4 line-clamp-2">
                        {getTranslatedDescription(subjectItem.description)}
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-white/10 dark:border-white/5">
                        <Badge className={getDifficultyBadgeClass(subjectItem.difficulty)}>
                          {getDifficultyLabel(subjectItem.difficulty)}
                        </Badge>
                        <span className="text-xs md:text-sm font-semibold text-[#86868b] dark:text-[#a1a1a6]">
                          {t("questionsCount", { count: subjectItem.questionCount })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Topics Section */}
        <div className="apple-glass-card mb-8">
          <div className="w-full relative z-10 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm shrink-0">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {availableTopics.length > 0 ? t("availableTopics") : t("noTopicsYet")}
                </h2>
              </div>

              {activeSubjects.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSubjectFilter("all")}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                      selectedSubjectFilter === "all"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm"
                        : "bg-white/80 dark:bg-white/5 text-[#86868b] dark:text-[#a1a1a6] border border-slate-200/90 dark:border-white/10 hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] shadow-sm shadow-slate-200/60"
                    }`}
                  >
                    {t("allSubjects")}
                  </button>
                  {activeSubjects.map((subjectItem) => (
                    <button
                      key={subjectItem.id}
                      type="button"
                      onClick={() => setSelectedSubjectFilter(subjectItem.name)}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                        selectedSubjectFilter === subjectItem.name
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm"
                          : "bg-white/80 dark:bg-white/5 text-[#86868b] dark:text-[#a1a1a6] border border-slate-200/90 dark:border-white/10 hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] shadow-sm shadow-slate-200/60"
                      }`}
                    >
                      {getTranslatedSubject(subjectItem.name)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-6">
              <div className="relative w-full md:max-w-md">
                <Input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full bg-white/80 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 rounded-xl backdrop-blur-sm h-11 text-sm font-medium shadow-sm shadow-slate-200/60"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868b] dark:text-[#a1a1a6] pointer-events-none z-10" />
              </div>
            </div>

            {availableTopics.length > 0 ? (
              <div className="flex flex-col gap-8">
                {activeSubjects.map((subjectItem) => {
                  const subjectTopics = filteredTopics.filter(
                    (topicItem) => topicItem.subject === subjectItem.name,
                  );
                  if (subjectTopics.length === 0) {
                    return null;
                  }

                  return (
                    <div key={`section-${subjectItem.id}`} className="flex flex-col gap-4">
                      {selectedSubjectFilter === "all" && (
                        <div className="flex items-center gap-2.5 pb-2 border-b border-white/10 dark:border-white/5">
                          <BookOpen className="w-5 h-5 text-blue-500 shrink-0" />
                          <h3 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
                            {getTranslatedSubject(subjectItem.name)}
                          </h3>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {subjectTopics.map((topicItem, index) => (
                          <div
                            key={`${topicItem.name}-${topicItem.subject}-${index}`}
                            className="apple-glass-card cursor-pointer group hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                            onClick={() => handleTopicClick(topicItem)}
                          >
                            <div className="w-full relative z-10 p-5 md:p-6">
                              <div className="flex items-center gap-4 mb-3">
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                                  <BookOpen className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-base text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                                    {topicItem.name}
                                  </h3>
                                  <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                                    {getTranslatedSubject(topicItem.subject)}
                                  </p>
                                </div>
                              </div>

                              <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mb-4 line-clamp-2">
                                {t("topicCardDescription", {
                                  topic: topicItem.name,
                                  subject: getTranslatedSubject(topicItem.subject),
                                })}
                              </p>

                              <div className="flex items-center justify-between pt-2 border-t border-white/10 dark:border-white/5">
                                <Badge className={getDifficultyBadgeClass(topicItem.difficulty)}>
                                  {getDifficultyLabel(topicItem.difficulty)}
                                </Badge>
                                <span className="text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {t("minutesApprox", { time: topicItem.estimatedTime })}
                                </span>
                              </div>

                              <div className="mt-3 flex items-center gap-2 text-xs text-[#86868b] dark:text-[#a1a1a6]">
                                <Brain className="w-3.5 h-3.5 text-purple-500" />
                                <span>{t("aiPoweredNarration")}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {filteredTopics.length === 0 && searchQuery.trim() !== "" && (
                  <div className="text-center py-12 text-[#86868b] dark:text-[#a1a1a6] text-sm">
                    {t("noSearchResults")}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 group shadow-sm shadow-slate-200/60">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Plus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                    {t("startFirstTitle")}
                  </h3>
                  <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mb-5">
                    {t("startFirstDesc")}
                  </p>
                  <Link href="/subject-manager" className="mt-auto w-full">
                    <Button className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-sm font-semibold">
                      <Plus className="w-4 h-4 mr-2" />
                      {t("goToSubjectManager")}
                    </Button>
                  </Link>
                </div>

                <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 hover:border-green-300 dark:hover:border-green-700 transition-all duration-300 group shadow-sm shadow-slate-200/60">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Brain className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                    {t("howItWorksExplainerTitle")}
                  </h3>
                  <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mb-5">
                    {t("howItWorksExplainerDesc")}
                  </p>
                  <div className="mt-auto w-full flex flex-col gap-2 text-left">
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05]">
                      <Brain className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#e8e8ed]">
                        {t("featureAiLearning")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05]">
                      <Target className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#e8e8ed]">
                        {t("featureStepByStep")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05]">
                      <Lightbulb className="w-4 h-4 text-purple-500 shrink-0" />
                      <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#e8e8ed]">
                        {t("featureInteractive")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 group shadow-sm shadow-slate-200/60">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                    {t("learningProcessTitle")}
                  </h3>
                  <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mb-5">
                    {t("learningProcessDesc")}
                  </p>
                  <div className="mt-auto w-full flex flex-col gap-2 text-left">
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05]">
                      <Plus className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#e8e8ed]">
                        {t("addSubject")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05]">
                      <BookOpen className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#e8e8ed]">
                        {t("selectTopic")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05]">
                      <GraduationCap className="w-4 h-4 text-purple-500 shrink-0" />
                      <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#e8e8ed]">
                        {t("learnWithAi")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* How It Works */}
        <div className="apple-glass-card mb-8">
          <div className="w-full relative z-10 p-6 md:p-8">
            <h3 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-6 text-center">
              {t("howItWorksTitle")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {[
                { step: "1", color: "blue", title: t("step1Title"), desc: t("step1Desc") },
                { step: "2", color: "green", title: t("step2Title"), desc: t("step2Desc") },
                { step: "3", color: "yellow", title: t("step3Title"), desc: t("step3Desc") },
                { step: "4", color: "purple", title: t("step4Title"), desc: t("step4Desc") },
              ].map((item) => (
                <div
                  key={item.step}
                  className="text-center p-4 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 shadow-sm shadow-slate-200/60"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 ${
                      item.color === "blue"
                        ? "bg-blue-100 dark:bg-blue-900/40"
                        : item.color === "green"
                          ? "bg-green-100 dark:bg-green-900/40"
                          : item.color === "yellow"
                            ? "bg-yellow-100 dark:bg-yellow-900/40"
                            : "bg-purple-100 dark:bg-purple-900/40"
                    }`}
                  >
                    <span
                      className={`font-bold text-sm ${
                        item.color === "blue"
                          ? "text-blue-600 dark:text-blue-400"
                          : item.color === "green"
                            ? "text-green-600 dark:text-green-400"
                            : item.color === "yellow"
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-purple-600 dark:text-purple-400"
                      }`}
                    >
                      {item.step}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <FeatureCards title={t("featuresTitle")} features={topicFeatures} columns={3} />
      </div>
    </div>
  );
};

const TopicExplainerPage = () => {
  const tCommon = useTranslations("Common");

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f5f5f7] dark:bg-transparent dark:!bg-none flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-7 h-7 animate-spin mx-auto mb-3 text-blue-500" />
            <p className="text-[#86868b] dark:text-[#a1a1a6] text-sm">{tCommon("loading")}</p>
          </div>
        </div>
      }
    >
      <TopicExplainerPageContent />
    </Suspense>
  );
};

export default TopicExplainerPage;
