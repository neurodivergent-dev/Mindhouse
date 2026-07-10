"use client";

import React, { useState, useEffect, Suspense, useCallback, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowLeft, BookOpen, Calculator, Atom, FlaskConical, Landmark, Dna, BookOpenCheck, Languages, Plus, RotateCcw, TrendingUp, Target, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FlashcardComponent from "@/components/flashcard";
import FeatureCards from "@/components/ui/feature-cards";
import { shouldUseDemoData, getDemoSubjects } from "@/data/demo-data";
import { UnifiedStorageService } from "@/services/unified-storage-service";
import { useAuth } from "@/hooks/useAuth";

interface Subject {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  isActive: boolean;
  questionCount: number;
}

interface CloudSubject {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  question_count?: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

const FlashcardPageContent = () => {
  const t = useTranslations("Flashcard");
  const tSubjects = useTranslations("Subjects");
  const locale = useLocale();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const getSubjectName = (name: string) => {
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

  // Icon mapping uses canonical keys (Matematik etc.) which getDemoSubjects preserves
  const getSubjectIcon = (name: string) => {
    if (name === "Matematik") { return <Calculator className="w-6 h-6 text-white" />; }
    if (name === "Fizik") { return <Atom className="w-6 h-6 text-white" />; }
    if (name === "Kimya") { return <FlaskConical className="w-6 h-6 text-white" />; }
    if (name === "Tarih") { return <Landmark className="w-6 h-6 text-white" />; }
    if (name === "Biyoloji") { return <Dna className="w-6 h-6 text-white" />; }
    if (name === "Türk Dili ve Edebiyatı") { return <BookOpenCheck className="w-6 h-6 text-white" />; }
    if (name === "İngilizce") { return <Languages className="w-6 h-6 text-white" />; }
    return <BookOpen className="w-6 h-6 text-white" />;
  };
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    isAttempted: boolean;
    lastSyncTime: number;
    hasAuthChanged: boolean;
  }>({ isAttempted: false, lastSyncTime: 0, hasAuthChanged: false });

  const flashcardFeatures = useMemo(
    () => [
      {
        icon: RotateCcw,
        title: t("featureSpacedRepetition"),
        description: t("featureSpacedRepetitionDesc"),
        iconBgColor: "bg-gradient-to-r from-blue-600 to-indigo-600",
      },
      {
        icon: TrendingUp,
        title: t("featurePersonalizedDifficulty"),
        description: t("featurePersonalizedDifficultyDesc"),
        iconBgColor: "bg-gradient-to-r from-purple-600 to-pink-600",
      },
      {
        icon: Target,
        title: t("featureFocusedModes"),
        description: t("featureFocusedModesDesc"),
        iconBgColor: "bg-gradient-to-r from-green-600 to-emerald-600",
      },
      {
        icon: BarChart3,
        title: t("featureProgressTracking"),
        description: t("featureProgressTrackingDesc"),
        iconBgColor: "bg-gradient-to-r from-orange-600 to-red-600",
      },
    ],
    [t],
  );

  const loadSubjects = useCallback(async (forceSync = false) => {
    try {
      setIsLoading(true);

      const demoModeActive = shouldUseDemoData();
      setIsDemoMode(demoModeActive);

      if (demoModeActive) {
        const localizedDemoSubjects = getDemoSubjects(locale);
        const demoSubjects: Subject[] = localizedDemoSubjects.map((demoSubject: any) => ({
          id: demoSubject.id,
          name: demoSubject.name,
          description: demoSubject.description,
          category: demoSubject.category,
          difficulty: demoSubject.difficulty,
          isActive: demoSubject.isActive,
          questionCount: demoSubject.questionCount,
        }));
        setSubjects(demoSubjects);
        return;
      }

      const now = Date.now();
      const shouldAttemptSync =
        forceSync ||
        !syncStatus.isAttempted ||
        (isAuthenticated && syncStatus.hasAuthChanged) ||
        now - syncStatus.lastSyncTime > 30000;

      if (shouldAttemptSync && !authLoading) {
        try {
          const [subjectsResponse] = await Promise.all([
            fetch("/api/subjects").then((res) => res.json()).catch(() => []),
            UnifiedStorageService.loadFlashcardsFromSupabase(),
          ]);

          if (Array.isArray(subjectsResponse) && subjectsResponse.length > 0) {
            const cloudSubjects = subjectsResponse.map((s: CloudSubject) => ({
              id: s.id,
              name: s.name,
              description: s.description,
              category: s.category,
              difficulty: s.difficulty,
              questionCount: s.question_count || 0,
              isActive: s.is_active,
              createdBy: s.created_by,
              createdAt: s.created_at,
              updatedAt: s.updated_at,
            }));

            const localSubjects = UnifiedStorageService.getSubjects();
            const mergedSubjects = [...localSubjects];

            cloudSubjects.forEach((cloudSubject) => {
              const exists = localSubjects.find((local) => local.id === cloudSubject.id);
              if (!exists) {
                mergedSubjects.push(cloudSubject);
              }
            });

            UnifiedStorageService.saveSubjects(mergedSubjects);
          }

          setSyncStatus({
            isAttempted: true,
            lastSyncTime: now,
            hasAuthChanged: false,
          });
        } catch {
          setSyncStatus((prev) => ({ ...prev, isAttempted: true, lastSyncTime: now }));
        }
      }

      const localSubjects = UnifiedStorageService.getSubjects();
      const allFlashcards = UnifiedStorageService.getFlashcards();
      const flashcardSubjects = new Set(allFlashcards.map((f) => f.subject));
      const missingSubjects: Subject[] = [];

      flashcardSubjects.forEach((subjectName) => {
        const exists = localSubjects.find((s) => s.name === subjectName);
        if (!exists) {
          missingSubjects.push({
            id: `auto_subject_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: subjectName,
            description: t("autoSubjectDescription", { subject: subjectName }),
            category: t("categoryGeneral"),
            difficulty: "Orta",
            isActive: true,
            questionCount: 0,
          });
        }
      });

      const allSubjects = [...localSubjects, ...missingSubjects];

      if (missingSubjects.length > 0) {
        UnifiedStorageService.saveSubjects(allSubjects);
      }

      const subjectsWithQuestionCount = allSubjects.map((subject) => {
        const flashcards = UnifiedStorageService.getFlashcardsBySubject(subject.name);
        return {
          ...subject,
          questionCount: flashcards.length,
        };
      });

      const subjectsWithFlashcards = subjectsWithQuestionCount.filter(
        (subject) => subject.questionCount > 0,
      );

      setSubjects(subjectsWithFlashcards);
    } catch {
      // Error loading subjects
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      loadSubjects();
    }
  }, [authLoading, loadSubjects]);

  useEffect(() => {
    if (!authLoading && (isAuthenticated || user?.id)) {
      setSyncStatus((prev) => ({ ...prev, hasAuthChanged: true }));
      loadSubjects(true);
    }
  }, [authLoading, isAuthenticated, user?.id, loadSubjects]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-transparent dark:!bg-none p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            {authLoading ? t("authenticating") : t("loadingSubjects")}
          </p>
          {isAuthenticated && (
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
              {t("syncingCloud")}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!selectedSubject) {
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

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shrink-0">
                <BookOpen className="w-6 h-6 text-white" />
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
                <p className="text-[#86868b] dark:text-[#a1a1a6] text-sm md:text-base font-medium mt-0.5">
                  {isDemoMode ? t("selectDemoSubject") : t("selectSubject")}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8 flex justify-start">
            <Link href="/flashcard-manager">
              <Button
                variant="default"
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 px-6 h-11 text-sm font-semibold transition-all"
              >
                <Plus className="w-5 h-5 mr-2" />
                {t("manageFlashcards")}
              </Button>
            </Link>
          </div>

          {/* Subject selection card */}
          <div className="apple-glass-card mb-8">
            <div className="w-full relative z-10 p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {subjects.length === 0 ? (
                  <div className="col-span-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Card 1: Add Flashcards */}
                      <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 shadow-sm shadow-slate-200/60 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 group">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                          <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                          {t("addFlashcardTitle")}
                        </h3>
                        <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mb-5">
                          {t("addFlashcardDesc")}
                        </p>
                        {!isDemoMode && (
                          <div className="mt-auto w-full">
                            <Link href="/flashcard-manager">
                              <Button className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-sm font-semibold">
                                {t("addFlashcard")}
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Card 2: How It Works */}
                      <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 shadow-sm shadow-slate-200/60 hover:border-green-300 dark:hover:border-green-700 transition-all duration-300 group">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                          <Calculator className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                          {t("howItWorksTitle")}
                        </h3>
                        <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mb-5">
                          {t("howItWorksDesc")}
                        </p>
                        <div className="mt-auto w-full flex flex-col gap-2 text-left">
                          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05]">
                            <Plus className="w-4 h-4 text-blue-500 shrink-0" />
                            <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#e8e8ed]">{t("addCard")}</span>
                          </div>
                          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05]">
                            <BookOpen className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#e8e8ed]">{t("study")}</span>
                          </div>
                          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05]">
                            <BookOpenCheck className="w-4 h-4 text-purple-500 shrink-0" />
                            <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#e8e8ed]">{t("learn")}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card 3: Learning Process */}
                      <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 shadow-sm shadow-slate-200/60 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 group">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                          <Plus className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                          {t("learningProcessTitle")}
                        </h3>
                        <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mb-5">
                          {t("learningProcessDesc")}
                        </p>
                        <div className="mt-auto w-full flex flex-col gap-2 text-left">
                          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05]">
                            <Target className="w-4 h-4 text-blue-500 shrink-0" />
                            <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#e8e8ed]">{t("selectSubjectStep")}</span>
                          </div>
                          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05]">
                            <Plus className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#e8e8ed]">{t("addCard")}</span>
                          </div>
                          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05]">
                            <BookOpen className="w-4 h-4 text-purple-500 shrink-0" />
                            <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#e8e8ed]">{t("study")}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  subjects.map((subject) => (
                    <div
                      key={subject.id}
                      className="apple-glass-card cursor-pointer group hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                      onClick={() => setSelectedSubject(subject.name)}
                    >
                      <div className="w-full relative z-10 p-5 md:p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                            {getSubjectIcon(subject.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base md:text-lg text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                              {getSubjectName(subject.name)}
                            </h3>
                            <p className="text-xs md:text-sm text-[#86868b] dark:text-[#a1a1a6]">
                              {isDemoMode ? t("demo") : t("smartLearning")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/10 dark:border-white/5">
                          <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 text-xs font-semibold border-0 px-2.5 py-0.5 shadow-none">
                            {isDemoMode
                              ? t("demoFlashcardCount", { count: subject.questionCount })
                              : t("flashcardCount", { count: subject.questionCount })}
                          </Badge>
                          <span className="text-xs md:text-sm font-semibold text-[#86868b] dark:text-[#a1a1a6]">
                            {isDemoMode ? t("demoContent") : t("learningSystem")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <FeatureCards
            title={t("featuresTitle")}
            features={flashcardFeatures}
            columns={2}
          />
        </div>
      </div>
    );
  }

  const handleBack = () => {
    setSelectedSubject("");
  };

  return (
    <div>
      <FlashcardComponent
        subject={selectedSubject}
        isDemoMode={isDemoMode}
        onBack={handleBack}
      />
    </div>
  );
};

const FlashcardPage = () => {
  const tCommon = useTranslations("Common");

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-transparent dark:!bg-none p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">{tCommon("loading")}</p>
          </div>
        </div>
      }
    >
      <FlashcardPageContent />
    </Suspense>
  );
};

export default FlashcardPage;
