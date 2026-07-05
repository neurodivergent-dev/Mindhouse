"use client";

import React, { useState, useEffect, Suspense, useCallback, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowLeft, BookOpen, Calculator, Atom, FlaskConical, Landmark, Dna, BookOpenCheck, Languages, Plus, RotateCcw, TrendingUp, Target, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
    try {
      return tSubjects(name as any);
    } catch {
      return name;
    }
  };

  // Icon mapping uses canonical keys (Matematik etc.) which getDemoSubjects preserves
  const getSubjectIcon = (name: string) => {
    if (name === "Matematik") return <Calculator className="w-6 h-6 text-white" />;
    if (name === "Fizik") return <Atom className="w-6 h-6 text-white" />;
    if (name === "Kimya") return <FlaskConical className="w-6 h-6 text-white" />;
    if (name === "Tarih") return <Landmark className="w-6 h-6 text-white" />;
    if (name === "Biyoloji") return <Dna className="w-6 h-6 text-white" />;
    if (name === "Türk Dili ve Edebiyatı") return <BookOpenCheck className="w-6 h-6 text-white" />;
    if (name === "İngilizce") return <Languages className="w-6 h-6 text-white" />;
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-transparent dark:!bg-none p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("backToDashboard")}
              </Button>
            </Link>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
                {t("title")}
              </h1>
              {isDemoMode && (
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  {t("demo")}
                </Badge>
              )}
            </div>

            <div className="mb-6">
              <Link href="/flashcard-manager">
                <Button
                  variant="default"
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {t("manageFlashcards")}
                </Button>
              </Link>
            </div>

            <Card className="border-gradient-question shadow-lg p-8 mb-8">
              <CardContent className="p-0">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
                  {isDemoMode ? t("selectDemoSubject") : t("selectSubject")}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {subjects.length === 0 ? (
                    <div className="col-span-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="shadow-lg border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 rounded-lg p-8 text-center">
                          <div className="mb-4 flex justify-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center">
                              <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            {t("addFlashcardTitle")}
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 mb-6">
                            {t("addFlashcardDesc")}
                          </p>
                          {!isDemoMode && (
                            <Link href="/flashcard-manager">
                              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-full">
                                {t("addFlashcard")}
                              </Button>
                            </Link>
                          )}
                        </div>

                        <div className="shadow-lg border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 transition-all duration-300 rounded-lg p-8 text-center">
                          <div className="mb-4 flex justify-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-full flex items-center justify-center">
                              <Calculator className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            {t("howItWorksTitle")}
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 mb-6">
                            {t("howItWorksDesc")}
                          </p>
                          <div className="text-sm text-gray-400 dark:text-gray-500">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <BookOpen className="w-4 h-4" />
                              <span>{t("addCard")}</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <Calculator className="w-4 h-4" />
                              <span>{t("study")}</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <span className="w-4 h-4 bg-blue-500 rounded-full"></span>
                              <span>{t("learn")}</span>
                            </div>
                          </div>
                        </div>

                        <div className="shadow-lg border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 rounded-lg p-8 text-center">
                          <div className="mb-4 flex justify-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-full flex items-center justify-center">
                              <Plus className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                            </div>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            {t("learningProcessTitle")}
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 mb-6">
                            {t("learningProcessDesc")}
                          </p>
                          <div className="text-sm text-gray-400 dark:text-gray-500">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <span className="w-4 h-4 bg-blue-500 rounded-full"></span>
                              <span>{t("selectSubjectStep")}</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <span className="w-4 h-4 bg-green-500 rounded-full"></span>
                              <span>{t("addCard")}</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <span className="w-4 h-4 bg-purple-500 rounded-full"></span>
                              <span>{t("study")}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    subjects.map((subject) => (
                      <Card
                        key={subject.id}
                        className="cursor-pointer border-gradient-question shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => setSelectedSubject(subject.name)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                              {getSubjectIcon(subject.name)}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                {getSubjectName(subject.name)}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {isDemoMode ? t("demo") : t("smartLearning")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge className="bg-blue-500 text-white">
                              {isDemoMode
                                ? t("demoFlashcardCount", { count: subject.questionCount })
                                : t("flashcardCount", { count: subject.questionCount })}
                            </Badge>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {isDemoMode ? t("demoContent") : t("learningSystem")}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <FeatureCards
              title={t("featuresTitle")}
              features={flashcardFeatures}
              columns={2}
            />
          </div>
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