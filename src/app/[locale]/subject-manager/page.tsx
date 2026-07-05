"use client";

import React, { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import SubjectManager from "@/components/subject-manager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, BookOpen, Brain, GraduationCap, Target, Zap, Users, BarChart3 } from "lucide-react";
import { Link } from "@/i18n/routing";
import MobileNav from "@/components/mobile-nav";
import LoadingSpinner from "@/components/loading-spinner";
import { shouldUseDemoData, getDemoSubjects } from "@/data/demo-data";
import AISubjectGenerator from "@/components/ai-subject-generator";
import { handleAIGeneratedSubjects } from "@/lib/subject-ai-handler";
import { UnifiedStorageService } from "@/services/unified-storage-service";
import FeatureCards from "@/components/ui/feature-cards";
import type { Subject } from "@/types/question-manager";

interface Stats {
  totalSubjects: number;
  totalQuestions: number;
  totalCategories: number;
}

const SUBJECT_MANAGER_FEATURES = [
  { key: "easy_management", icon: BookOpen, iconBgColor: "bg-gradient-to-r from-blue-600 to-indigo-600" },
  { key: "category_organization", icon: Target, iconBgColor: "bg-gradient-to-r from-purple-600 to-pink-600" },
  { key: "ai_generation", icon: Brain, iconBgColor: "bg-gradient-to-r from-green-600 to-emerald-600" },
  { key: "quick_actions", icon: Zap, iconBgColor: "bg-gradient-to-r from-orange-600 to-red-600" },
  { key: "active_status", icon: Users, iconBgColor: "bg-gradient-to-r from-indigo-600 to-purple-600" },
  { key: "detailed_stats", icon: BarChart3, iconBgColor: "bg-gradient-to-r from-teal-600 to-cyan-600" },
] as const;

export default function SubjectManagerPage() {
  const t = useTranslations("SubjectManager");
  const locale = useLocale();

  const translatedFeatures = useMemo(
    () =>
      SUBJECT_MANAGER_FEATURES.map(({ key, icon, iconBgColor }) => ({
        icon,
        iconBgColor,
        title: t(`features.${key}.title`),
        description: t(`features.${key}.description`),
      })),
    [t],
  );

  const [stats, setStats] = useState<Stats>({
    totalSubjects: 0,
    totalQuestions: 0,
    totalCategories: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // loadStats will be called by SubjectManager's onRefresh after initial load

  const loadStats = async () => {
    try {
      setIsLoading(true);

      // Check if demo mode is active
      const demoMode = shouldUseDemoData();
      setIsDemoMode(demoMode);

      if (demoMode) {
        // Use demo data for statistics
        const demoData = getDemoSubjects(locale);
        const totalSubjects = demoData.length;
        const totalQuestions = demoData.reduce(
          (sum, subject) => sum + subject.questionCount,
          0,
        );
        const categories = new Set(
          demoData.map((subject) => subject.category),
        );
        const totalCategories = categories.size;

        setStats({
          totalSubjects,
          totalQuestions,
          totalCategories,
        });
      } else {
                 // Use UnifiedStorageService for consistency with Question Manager
         const localSubjects = UnifiedStorageService.getSubjects();

        if (localSubjects.length > 0) {
          // Use localStorage data
          const totalSubjects = localSubjects.length;

          // Calculate real question count from actual questions
          const allQuestions = UnifiedStorageService.getQuestions();
          const totalQuestions = allQuestions.length;

          const categories = new Set(
            localSubjects.map((subject: Subject) => subject.category),
          );
          const totalCategories = categories.size;

          setStats({
            totalSubjects,
            totalQuestions,
            totalCategories,
          });
        } else {
          // Try API as fallback
          const response = await fetch("/api/subjects");
          if (response.ok) {
            const subjects: Subject[] = await response.json();

            const totalSubjects = subjects.length;

            // Calculate real question count from actual questions
            const allQuestions = UnifiedStorageService.getQuestions();
            const totalQuestions = allQuestions.length;

            const categories = new Set(
              subjects.map((subject) => subject.category),
            );
            const totalCategories = categories.size;

            setStats({
              totalSubjects,
              totalQuestions,
              totalCategories,
            });
          }
        }
      }
    } catch {
      // Error loading stats
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Responsive Navigation Bar */}
      <MobileNav />

      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header Info */}
          <Card className="mb-6 glass-card">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                      {t("title")}
                      {isDemoMode && (
                        <Badge className="ml-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                          {t("demo")}
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-muted-foreground">
                      {t("pageDescription")}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  <AISubjectGenerator
                    onSubjectsGenerated={(subjects) => {
                      void (async () => {
                        try {
                          await handleAIGeneratedSubjects(subjects, {
                            successTitle: t("ai.toasts.successTitle"),
                            successDescription: t("ai.toasts.addedDesc", {
                              count: subjects.length,
                            }),
                            errorTitle: t("ai.toasts.errorTitle"),
                            errorDescription: t("ai.toasts.addError"),
                          });
                          // Refresh stats and subjects after adding AI subjects
                          await loadStats();
                          // Force refresh of SubjectManager component
                          setRefreshKey(prev => prev + 1);
                        } catch {
                          // Handle error silently or with proper error handling
                          // You can add toast notification here if needed
                        }
                      })();
                    }}
                    className="w-full sm:w-auto sm:mr-2"
                  />
                  <Link href="/question-manager" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0 w-full sm:w-auto"
                    >
                      <Database className="w-4 h-4" />
                      <span className="hidden sm:inline">{t("questionManager")}</span>
                      <span className="sm:hidden">{t("questionsShort")}</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-4 border-2 border-blue-300 dark:border-blue-700 rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("totalSubjects")}</p>
                    {isLoading ? (
                      <LoadingSpinner className="p-0 h-6 w-6" />
                    ) : (
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.totalSubjects}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 p-4 border-2 border-purple-300 dark:border-purple-700 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                  <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("totalCategories")}
                    </p>
                    {isLoading ? (
                      <LoadingSpinner className="p-0 h-6 w-6" />
                    ) : (
                      <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        {stats.totalCategories}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subject Manager Component */}
          <SubjectManager onRefresh={() => void loadStats()} refreshTrigger={refreshKey} />

          {/* Subject Manager Özellikleri */}
          <FeatureCards
            title={t("platformFeatures")}
            features={translatedFeatures}
            columns={3}
          />
        </div>
      </div>
    </div>
  );
}
