"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { getSubjectName } from "@/lib/question-manager-labels";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BookOpen, GraduationCap, Sparkles } from "lucide-react";
import type { Subject } from "@/types/question-manager";

export function LoadingState() {
  const t = useTranslations("QuestionManager");

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground font-medium">
        {t("loadingSubjects")}
      </p>
    </div>
  );
}

interface NoSubjectsStateProps {
  onAIDialogOpenChange: (open: boolean) => void;
}

export function NoSubjectsState({ onAIDialogOpenChange }: NoSubjectsStateProps) {
  const t = useTranslations("QuestionManager");

  return (
    <div className="flex justify-center py-16">
      <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 shadow-sm shadow-slate-200/60 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 group max-w-md w-full">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
          <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
          {t("addFirstSubject")}
        </h3>
        <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mb-5">
          {t("addFirstSubjectDesc")}
        </p>
        <div className="flex flex-col gap-3 w-full">
          <Link href="/subject-manager">
            <Button className="h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-sm font-semibold w-full">
              <GraduationCap className="w-4 h-4 mr-2" />
              {t("addSubject")}
            </Button>
          </Link>
          <Button
            variant="outline"
            className="h-11 rounded-xl text-sm font-semibold w-full hover:bg-slate-50 dark:hover:bg-white/5"
            onClick={() => onAIDialogOpenChange(true)}
          >
            <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
            {t("generateWithAI")}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface NoSubjectSelectedStateProps {
  subjects: Subject[];
  onSubjectChange: (subject: string) => void;
  onAIDialogOpenChange: (open: boolean) => void;
}

export function NoSubjectSelectedState({
  subjects,
  onSubjectChange,
  onAIDialogOpenChange,
}: NoSubjectSelectedStateProps) {
  const t = useTranslations("QuestionManager");
  const tSubjects = useTranslations("Subjects");

  return (
    <div className="flex justify-center py-16">
      <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 shadow-sm shadow-slate-200/60 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 group max-w-md w-full">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
          <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
          {t("selectSubjectTitle")}
        </h3>
        <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mb-5">
          {t("selectSubjectDesc")}
        </p>
        <div className="flex flex-col gap-3 w-full">
          <Link href="/subject-manager">
            <Button className="h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-sm font-semibold w-full">
              <GraduationCap className="w-4 h-4 mr-2" />
              {t("addSubject")}
            </Button>
          </Link>
          {subjects.length > 0 && (
            <Select value="" onValueChange={onSubjectChange}>
              <SelectTrigger className="h-11 rounded-xl text-sm font-semibold gap-2 w-full">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <SelectValue placeholder={t("viewExistingSubjects")} />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.name}>
                    <div className="flex items-center justify-between w-full">
                      <span>{getSubjectName(subject.name, tSubjects)}</span>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {t("questionCount", { count: subject.questionCount })}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button
            variant="outline"
            className="h-11 rounded-xl text-sm font-semibold w-full hover:bg-slate-50 dark:hover:bg-white/5"
            onClick={() => onAIDialogOpenChange(true)}
          >
            <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
            {t("generateWithAI")}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface NoQuestionsStateProps {
  onAIDialogOpenChange: (open: boolean) => void;
}

export function NoQuestionsState({ onAIDialogOpenChange }: NoQuestionsStateProps) {
  const t = useTranslations("QuestionManager");

  return (
    <div className="flex justify-center py-16">
      <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 shadow-sm shadow-slate-200/60 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 group max-w-md w-full">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
          <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
          {t("noQuestionsInSubject")}
        </h3>
        <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mb-5">
          {t("noQuestionsInSubjectDesc")}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button
            onClick={() => document.getElementById("question-form")?.scrollIntoView({ behavior: "smooth" })}
            className="h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-sm font-semibold flex-1"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            {t("addFirstQuestion")}
          </Button>
          <Button
            variant="outline"
            className="h-11 rounded-xl text-sm font-semibold flex-1 hover:bg-slate-50 dark:hover:bg-white/5"
            onClick={() => onAIDialogOpenChange(true)}
          >
            <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
            {t("generateWithAI")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SelectNoSubjectsState() {
  const t = useTranslations("QuestionManager");

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
      <p className="text-sm font-medium text-muted-foreground mb-1">
        {t("noSubjectsInSelect")}
      </p>
      <p className="text-xs text-muted-foreground/70 mb-3">
        {t("noSubjectsInSelectDesc")}
      </p>
    </div>
  );
}
