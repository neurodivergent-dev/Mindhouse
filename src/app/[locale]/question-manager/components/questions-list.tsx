"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Question } from "@/lib/types";
import LoadingSpinner from "@/components/loading-spinner";
import type { Subject } from "@/types/question-manager";
import {
  LoadingState,
  NoSubjectsState,
  NoSubjectSelectedState,
  NoQuestionsState,
} from "./empty-states";
import QuestionCard from "./question-card";
import FilterBar from "./filter-bar";
import { normalizeDifficulty } from "@/lib/question-manager-labels";

interface QuestionsListProps {
  subjects: Subject[];
  questions: Question[];
  selectedSubject: string;
  searchTerm: string;
  filterDifficulty: string;
  isLoading: boolean;
  isLoadingSubjects: boolean;
  onSubjectChange: (subject: string) => void;
  onSearchChange: (term: string) => void;
  onDifficultyFilterChange: (difficulty: string) => void;
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (questionId: string) => Promise<void>;
  onAIDialogOpenChange: (open: boolean) => void;
}

export default function QuestionsList({
  subjects,
  questions,
  selectedSubject,
  searchTerm,
  filterDifficulty,
  isLoading,
  isLoadingSubjects,
  onSubjectChange,
  onSearchChange,
  onDifficultyFilterChange,
  onEditQuestion,
  onDeleteQuestion,
  onAIDialogOpenChange,
}: QuestionsListProps) {
  const t = useTranslations("QuestionManager");
  const tSubjects = useTranslations("Subjects");
  const locale = useLocale();

  const getSubjectName = (name: string) => {
    try {
      return tSubjects(name as any);
    } catch {
      return name;
    }
  };
  const searchLocale = locale === "tr" ? "tr-TR" : "en-US";

  const filteredQuestions = questions.filter((question) => {
    const searchLower = searchTerm.toLocaleLowerCase(searchLocale);
    const matchesSearch =
      question.text.toLocaleLowerCase(searchLocale).includes(searchLower) ||
      (question.topic || "").toLocaleLowerCase(searchLocale).includes(searchLower);
    const matchesDifficulty =
      filterDifficulty === "all" || normalizeDifficulty(question.difficulty) === filterDifficulty;

    return matchesSearch && matchesDifficulty;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSubject, filterDifficulty]);

  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <Card className="border-gradient-question shadow-lg w-full h-full">
      <CardHeader>
        <CardTitle>{t("questions")}</CardTitle>
        <CardDescription>
          {selectedSubject 
            ? t("questionsInSubject", { subject: getSubjectName(selectedSubject) }) 
            : t("selectSubject")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FilterBar
          selectedSubject={selectedSubject}
          searchTerm={searchTerm}
          filterDifficulty={filterDifficulty}
          subjects={subjects}
          onSubjectChange={onSubjectChange}
          onSearchChange={onSearchChange}
          onDifficultyFilterChange={onDifficultyFilterChange}
        />

        {isLoadingSubjects ? (
          <LoadingState />
        ) : subjects.length === 0 ? (
          <NoSubjectsState onAIDialogOpenChange={onAIDialogOpenChange} />
        ) : isLoading ? (
          <LoadingSpinner />
        ) : !selectedSubject ? (
          <NoSubjectSelectedState
            subjects={subjects}
            onSubjectChange={onSubjectChange}
            onAIDialogOpenChange={onAIDialogOpenChange}
          />
        ) : filteredQuestions.length === 0 ? (
          <NoQuestionsState onAIDialogOpenChange={onAIDialogOpenChange} />
        ) : (
          <div className="flex flex-col h-full">
            <div className="space-y-4 w-full overflow-y-auto flex-grow" style={{ maxHeight: "850px" }}>
              {paginatedQuestions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  onEdit={onEditQuestion}
                  onDelete={onDeleteQuestion}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0 rounded-lg border-gray-200 dark:border-gray-700"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </Button>

                <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-none no-scrollbar">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    if (
                      totalPages > 7 &&
                      i !== 0 &&
                      i !== totalPages - 1 &&
                      Math.abs(currentPage - (i + 1)) > 2
                    ) {
                      if (Math.abs(currentPage - (i + 1)) === 3) {
                        return <span key={i} className="px-1 text-gray-400">...</span>;
                      }
                      return null;
                    }

                    return (
                      <Button
                        key={i}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(i + 1)}
                        className={`h-8 w-8 p-0 rounded-lg min-w-[32px] ${
                          currentPage === i + 1
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        {i + 1}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0 rounded-lg border-gray-200 dark:border-gray-700"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}