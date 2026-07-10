"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, BookOpen, Target, Brain, Database, GraduationCap, Users, BarChart3 } from "lucide-react";
import FeatureCards from "@/components/ui/feature-cards";
import QuestionForm from "./question-form";
import QuestionsList from "./questions-list";
import AIQuestionDialog from "./ai-question-dialog";
import EditQuestionDialog from "./edit-question-dialog";
import LoadingSpinner from "@/components/loading-spinner";
import MobileNav from "@/components/mobile-nav";
import type {
  Subject,
  AIGeneratedQuestion,
  AIGenerationResult,
  QuestionFormData,
} from "@/types/question-manager";
import type { Question } from "@/lib/types";

interface AIFormData {
  subject: string;
  topic: string;
  type: "multiple-choice" | "true-false" | "calculation" | "case-study";
  difficulty: "Easy" | "Medium" | "Hard";
  count: number;
  guidelines: string;
}

interface Stats {
  totalQuestions: number;
  totalSubjects: number;
  totalCategories: number;
}

interface QuestionManagerMainProps {
  subjects: Subject[];
  questions: Question[];
  selectedSubject: string;
  searchTerm: string;
  filterDifficulty: string;
  isLoading: boolean;
  isLoadingSubjects: boolean;
  isCreating: boolean;
  isEditDialogOpen: boolean;
  editingQuestion: Question | null;
  isAIDialogOpen: boolean;
  isGeneratingAI: boolean;
  aiGeneratedQuestions: AIGeneratedQuestion[];
  aiGenerationResult: AIGenerationResult | null;
  formData: QuestionFormData;
  stats: Stats;
  isDemoMode?: boolean;
  onSubjectChange: (subject: string) => void;
  onSearchChange: (term: string) => void;
  onDifficultyFilterChange: (difficulty: string) => void;
  onFormDataChange: (field: keyof QuestionFormData, value: string | number) => void;
  onOptionChange: (index: number, field: "text" | "isCorrect", value: string | boolean) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
  onSubmit: () => Promise<void>;
  onReset: () => void;
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (questionId: string) => Promise<void>;
  onEditDialogOpenChange: (open: boolean) => void;
  onAIDialogOpenChange: (open: boolean) => void;
  onAIGenerate: (formData: AIFormData) => Promise<void>;
  onAIApprove: (questions: AIGeneratedQuestion[], subject: string) => Promise<void>;
  onEditOptionChange: (index: number, field: "text" | "isCorrect", value: string | boolean) => void;
  onEditAddOption: () => void;
  onEditRemoveOption: (index: number) => void;
  onEditQuestionChange: (field: keyof Question, value: string | boolean) => void;
  onUpdateQuestion: () => Promise<void>;
}

export default function QuestionManagerMain({
  subjects,
  questions,
  selectedSubject,
  searchTerm,
  filterDifficulty,
  isLoading,
  isLoadingSubjects,
  isCreating,
  isEditDialogOpen,
  editingQuestion,
  isAIDialogOpen,
  isGeneratingAI,
  aiGeneratedQuestions,
  aiGenerationResult,
  formData,
  stats,
  isDemoMode = false,
  onSubjectChange,
  onSearchChange,
  onDifficultyFilterChange,
  onFormDataChange,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onSubmit,
  onReset,
  onEditQuestion,
  onDeleteQuestion,
  onEditDialogOpenChange,
  onAIDialogOpenChange,
  onAIGenerate,
  onAIApprove,
  onEditOptionChange,
  onEditAddOption,
  onEditRemoveOption,
  onEditQuestionChange,
  onUpdateQuestion,
}: QuestionManagerMainProps) {
  const t = useTranslations("QuestionManager");
  const [focusMode, setFocusMode] = useState<"form" | "list" | null>(null);

  const questionManagerFeatures = useMemo(
    () => [
      {
        icon: Sparkles,
        title: t("featureAiTitle"),
        description: t("featureAiDesc"),
        iconBgColor: "bg-gradient-to-r from-purple-600 to-pink-600",
      },
      {
        icon: Database,
        title: t("featureDataTitle"),
        description: t("featureDataDesc"),
        iconBgColor: "bg-gradient-to-r from-blue-600 to-indigo-600",
      },
      {
        icon: Target,
        title: t("featureFilterTitle"),
        description: t("featureFilterDesc"),
        iconBgColor: "bg-gradient-to-r from-green-600 to-emerald-600",
      },
      {
        icon: Users,
        title: t("featureMultiUserTitle"),
        description: t("featureMultiUserDesc"),
        iconBgColor: "bg-gradient-to-r from-orange-600 to-red-600",
      },
      {
        icon: BarChart3,
        title: t("featureStatsTitle"),
        description: t("featureStatsDesc"),
        iconBgColor: "bg-gradient-to-r from-teal-600 to-cyan-600",
      },
      {
        icon: GraduationCap,
        title: t("featureAcademicTitle"),
        description: t("featureAcademicDesc"),
        iconBgColor: "bg-gradient-to-r from-emerald-500 to-teal-600",
      },
    ],
    [t],
  );

  return (
    <div className="space-y-6">
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
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-none ml-2 align-middle">
                      {t("demo")}
                    </Badge>
                  )}
                </h1>
                <p className="text-[#86868b] dark:text-[#a1a1a6] mt-3 text-lg font-medium tracking-wide max-w-2xl">
                  {t("description")}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Button
                  onClick={() => onAIDialogOpenChange(true)}
                  disabled={!selectedSubject && subjects.length === 0}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-sm transition-all hover:shadow-md h-11 px-6 rounded-xl"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  <span>{t("generateWithAI")}</span>
                </Button>
                <Link href="/subject-manager" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 hover:bg-[#007aff]/5 hover:text-[#007aff] border-gray-200 dark:border-gray-800 h-11 px-6 rounded-xl w-full sm:w-auto transition-colors"
                  >
                    <Database className="w-5 h-5" />
                    <span>{t("subjectManager")}</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Premium Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Total Subjects */}
              <Card className="apple-glass-card border-0 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#86868b] dark:text-[#a1a1a6] tracking-wide">
                      {t("totalSubjects")}
                    </p>
                    {isLoadingSubjects ? (
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
                    {isLoadingSubjects ? (
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

              {/* Total Questions */}
              <Card className="apple-glass-card border-0 hover:shadow-lg transition-all duration-300 relative overflow-hidden group md:col-span-2 lg:col-span-1">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#86868b] dark:text-[#a1a1a6] tracking-wide">
                      {t("totalQuestions")}
                    </p>
                    {isLoading ? (
                      <LoadingSpinner className="p-0 h-8 w-8 text-[#34c759]" />
                    ) : (
                      <div className="text-3xl font-black tracking-tight text-gray-900 dark:text-gray-100">
                        {stats.totalQuestions}
                      </div>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-[#34c759]/10 dark:bg-[#30d158]/20 rounded-2xl flex items-center justify-center border border-[#34c759]/20 dark:border-[#30d158]/30 transition-transform group-hover:scale-110 duration-300 flex-shrink-0">
                    <Target className="h-6 w-6 text-[#34c759] dark:text-[#30d158]" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 lg:items-stretch transition-all duration-500">
            <div className={`transition-all duration-500 ease-in-out ${focusMode === "form"
                ? "w-full lg:w-full lg:flex-none"
                : focusMode === "list"
                  ? "hidden lg:hidden w-0 opacity-0 pointer-events-none"
                  : "lg:flex-1 w-full"
              }`}>
              <QuestionForm
                subjects={subjects}
                formData={formData}
                onFormDataChange={onFormDataChange}
                onOptionChange={onOptionChange}
                onAddOption={onAddOption}
                onRemoveOption={onRemoveOption}
                onSubmit={onSubmit}
                onReset={onReset}
                isCreating={isCreating}
                onToggleFocus={() => setFocusMode(focusMode === "form" ? null : "form")}
                isFocused={focusMode === "form"}
              />
            </div>

            <div className={`transition-all duration-500 ease-in-out ${focusMode === "list"
                ? "w-full lg:w-full lg:flex-none"
                : focusMode === "form"
                  ? "hidden lg:hidden w-0 opacity-0 pointer-events-none"
                  : "lg:flex-1 w-full"
              }`}>
              <QuestionsList
                subjects={subjects}
                questions={questions}
                selectedSubject={selectedSubject}
                searchTerm={searchTerm}
                filterDifficulty={filterDifficulty}
                isLoading={isLoading}
                isLoadingSubjects={isLoadingSubjects}
                onSubjectChange={onSubjectChange}
                onSearchChange={onSearchChange}
                onDifficultyFilterChange={onDifficultyFilterChange}
                onEditQuestion={onEditQuestion}
                onDeleteQuestion={onDeleteQuestion}
                onAIDialogOpenChange={onAIDialogOpenChange}
                onToggleFocus={() => setFocusMode(focusMode === "list" ? null : "list")}
                isFocused={focusMode === "list"}
              />
            </div>
          </div>

          <EditQuestionDialog
            open={isEditDialogOpen}
            onOpenChange={onEditDialogOpenChange}
            editingQuestion={editingQuestion}
            onUpdate={onUpdateQuestion}
            onOptionChange={onEditOptionChange}
            onAddOption={onEditAddOption}
            onRemoveOption={onEditRemoveOption}
            onQuestionChange={onEditQuestionChange}
          />

          <AIQuestionDialog
            open={isAIDialogOpen}
            onOpenChange={onAIDialogOpenChange}
            subjects={subjects}
            onGenerate={onAIGenerate}
            onApprove={onAIApprove}
            isGenerating={isGeneratingAI}
            isCreating={isCreating}
            aiGeneratedQuestions={aiGeneratedQuestions}
            aiGenerationResult={aiGenerationResult}
          />

          <div className="px-4 sm:px-0">
            <FeatureCards
              title={t("featuresTitle")}
              features={questionManagerFeatures}
              columns={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
