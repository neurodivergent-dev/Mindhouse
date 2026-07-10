"use client";

import React, { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import SubjectManager from "@/components/subject-manager";
import { Card, CardContent } from "@/components/ui/card";
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
import { SubjectService } from "@/services/supabase-service";
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
          // Fall back to the cloud copy, read through the Supabase client.
          const cloudSubjects = await SubjectService.getSubjects();

          const totalSubjects = cloudSubjects.length;

          // Calculate real question count from actual questions
          const allQuestions = UnifiedStorageService.getQuestions();
          const totalQuestions = allQuestions.length;

          const categories = new Set(
            cloudSubjects.map((subject) => subject.category),
          );
          const totalCategories = categories.size;

          setStats({
            totalSubjects,
            totalQuestions,
            totalCategories,
          });
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
          {/* PREMIUM HEADER */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#007aff]/10 dark:bg-[#0a84ff]/20 rounded-2xl flex items-center justify-center border border-[#007aff]/20">
                    <GraduationCap className="w-6 h-6 text-[#007aff] dark:text-[#0a84ff]" />
                  </div>
                  {t("title")}
                  {isDemoMode && (
                    <Badge className="ml-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-none align-middle">
                      {t("demo")}
                    </Badge>
                  )}
                </h1>
                <p className="text-[#86868b] dark:text-[#a1a1a6] mt-3 text-lg font-medium tracking-wide max-w-2xl">
                  {t("pageDescription")}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
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
                  className="w-full sm:w-auto"
                />
                <Link href="/question-manager" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 hover:bg-[#007aff]/5 hover:text-[#007aff] border-gray-200 dark:border-gray-800 h-11 px-6 rounded-xl w-full sm:w-auto transition-colors"
                  >
                    <Database className="w-5 h-5" />
                    <span className="hidden sm:inline">{t("questionManager")}</span>
                    <span className="sm:hidden">{t("questionsShort")}</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Premium Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Total Subjects */}
              <Card className="apple-glass-card border-0 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#86868b] dark:text-[#a1a1a6] tracking-wide">
                      {t("totalSubjects")}
                    </p>
                    {isLoading ? (
                      <LoadingSpinner className="p-0 h-8 w-8 text-[#007aff]" />
                    ) : (
                      <div className="text-3xl font-black tracking-tight text-gray-900 dark:text-gray-100">
                        {stats.totalSubjects}
                      </div>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-[#007aff]/10 dark:bg-[#0a84ff]/20 rounded-2xl flex items-center justify-center border border-[#007aff]/20 dark:border-[#0a84ff]/30 transition-transform group-hover:scale-110 duration-300 flex-shrink-0">
                    <BookOpen className="h-6 w-6 text-[#007aff] dark:text-[#0a84ff]" />
                  </div>
                </CardContent>
              </Card>

              {/* Total Categories */}
              <Card className="apple-glass-card border-0 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#86868b] dark:text-[#a1a1a6] tracking-wide">
                      {t("totalCategories")}
                    </p>
                    {isLoading ? (
                      <LoadingSpinner className="p-0 h-8 w-8 text-[#af52de]" />
                    ) : (
                      <div className="text-3xl font-black tracking-tight text-gray-900 dark:text-gray-100">
                        {stats.totalCategories}
                      </div>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-[#af52de]/10 dark:bg-[#bf5af2]/20 rounded-2xl flex items-center justify-center border border-[#af52de]/20 dark:border-[#bf5af2]/30 transition-transform group-hover:scale-110 duration-300 flex-shrink-0">
                    <Brain className="h-6 w-6 text-[#af52de] dark:text-[#bf5af2]" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

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
