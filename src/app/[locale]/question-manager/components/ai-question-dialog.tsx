"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { getSubjectName } from "@/lib/question-manager-labels";
import { mapDifficulty } from "@/lib/question-manager-labels";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import type {
  Subject,
  AIGeneratedQuestion,
  AIGenerationResult,
} from "@/types/question-manager";

// Define proper interface for AI form data
interface AIFormData {
  subject: string;
  topic: string;
  type: "multiple-choice" | "true-false" | "calculation" | "case-study";
  difficulty: "Easy" | "Medium" | "Hard";
  count: number;
  guidelines: string;
}

interface AIQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
  onGenerate: (formData: AIFormData) => Promise<void>;
  onApprove: (questions: AIGeneratedQuestion[], subject: string) => Promise<void>;
  isGenerating: boolean;
  isCreating: boolean;
  aiGeneratedQuestions: AIGeneratedQuestion[];
  aiGenerationResult: AIGenerationResult | null;
}

export default function AIQuestionDialog({
  open,
  onOpenChange,
  subjects,
  onGenerate,
  onApprove,
  isGenerating,
  isCreating,
  aiGeneratedQuestions,
  aiGenerationResult,
}: AIQuestionDialogProps) {
  const t = useTranslations("QuestionManager");
  const tSubjects = useTranslations("Subjects");

  const getSubjectNameFormatted = (name: string) => getSubjectName(name, tSubjects);
  const [activeAITab, setActiveAITab] = useState<string>("generate");
  const [showAnswers, setShowAnswers] = useState(false);
  const [selectedAIQuestions, setSelectedAIQuestions] = useState<Set<number>>(
    new Set(),
  );
  const [aiFormData, setAIFormData] = useState({
    subject: "",
    topic: "",
    type: "multiple-choice" as
      | "multiple-choice"
      | "true-false"
      | "calculation"
      | "case-study",
    difficulty: "Medium" as "Easy" | "Medium" | "Hard",
    count: 5,
    guidelines: "",
  });

  const handleAIGenerate = async () => {
    await onGenerate(aiFormData);
    setActiveAITab("review");
  };

  const handleApproveAIQuestions = async () => {
    // Validate that subject is selected
    if (!aiFormData.subject || aiFormData.subject.trim() === '') {
      return;
    }

    const questionsToAdd = aiGeneratedQuestions.filter((_, idx) =>
      selectedAIQuestions.has(idx),
    );

    // Pass both questions and subject information
    await onApprove(questionsToAdd, aiFormData.subject);
  };

  // Wrapper functions to handle async operations
  const handleGenerateClick = () => {
    handleAIGenerate().catch(() => {
      // Silent fail for better UX
    });
  };

  const handleApproveClick = () => {
    handleApproveAIQuestions().catch(() => {
      // Silent fail for better UX
    });
  };

  const toggleAIQuestionSelection = (index: number) => {
    const newSelection = new Set(selectedAIQuestions);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedAIQuestions(newSelection);
  };

  const selectAllAIQuestions = () => {
    if (selectedAIQuestions.size === aiGeneratedQuestions.length) {
      setSelectedAIQuestions(new Set());
    } else {
      setSelectedAIQuestions(
        new Set(aiGeneratedQuestions.map((_, idx) => idx)),
      );
    }
  };

  const resetDialog = () => {
    setSelectedAIQuestions(new Set());
    setActiveAITab("generate");
    setShowAnswers(false);

    // Reset AI form data to ensure clean state
    setAIFormData({
      subject: "",
      topic: "",
      type: "multiple-choice" as
        | "multiple-choice"
        | "true-false"
        | "calculation"
        | "case-study",
      difficulty: "Medium" as "Easy" | "Medium" | "Hard",
      count: 5,
      guidelines: "",
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          resetDialog();
        }
      }}
    >
      <DialogContent className="w-[94vw] !max-w-4xl h-auto !max-h-[92vh] flex flex-col p-6 border-0 rounded-[32px] overflow-hidden shadow-2xl bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-xl">
        <DialogHeader className="pb-3 border-b border-slate-100 dark:border-white/[0.05]">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-black tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
            <Sparkles className="w-5 h-5 text-blue-600" />
            {t("aiDialogTitle")}
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeAITab}
          onValueChange={setActiveAITab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">{t("aiTabGenerate")}</TabsTrigger>
            <TabsTrigger
              value="review"
              disabled={aiGeneratedQuestions.length === 0}
            >
              {t("aiTabReview", { count: aiGeneratedQuestions.length })}
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="generate"
            className="space-y-2 sm:space-y-4 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto px-2 py-1"
          >
            <div className="grid gap-2 sm:gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <Label htmlFor="ai-subject" className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{t("subject")}</Label>
                  <Select
                    value={aiFormData.subject}
                    onValueChange={(value) => {
                      setAIFormData({ ...aiFormData, subject: value });
                    }}
                  >
                    <SelectTrigger className="rounded-xl border-slate-200 dark:border-white/[0.08] dark:bg-white/[0.02] h-11 font-medium">
                      <SelectValue placeholder={t("selectSubject")} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-white/[0.08]">
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.name}>
                          {getSubjectNameFormatted(subject.name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ai-topic" className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{t("topic")}</Label>
                  <Input
                    id="ai-topic"
                    value={aiFormData.topic}
                    onChange={(e) =>
                      setAIFormData({ ...aiFormData, topic: e.target.value })
                    }
                    placeholder={t("aiTopicPlaceholder")}
                    className="rounded-xl border-slate-200 dark:border-white/[0.08] dark:bg-white/[0.02] h-11 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                <div>
                  <Label htmlFor="ai-type" className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{t("questionType")}</Label>
                  <Select
                    value={aiFormData.type}
                    onValueChange={(value) =>
                      setAIFormData({
                        ...aiFormData,
                        type: value as
                          | "multiple-choice"
                          | "true-false"
                          | "calculation"
                          | "case-study",
                      })
                    }
                  >
                    <SelectTrigger className="rounded-xl border-slate-200 dark:border-white/[0.08] dark:bg-white/[0.02] h-11 font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-white/[0.08]">
                      <SelectItem value="multiple-choice">
                        {t("typeMultipleChoice")}
                      </SelectItem>
                      <SelectItem value="true-false">{t("typeTrueFalse")}</SelectItem>
                      <SelectItem value="calculation">{t("typeCalculation")}</SelectItem>
                      <SelectItem value="case-study">
                        {t("typeCaseStudy")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ai-difficulty" className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{t("difficulty")}</Label>
                  <Select
                    value={aiFormData.difficulty}
                    onValueChange={(value) =>
                      setAIFormData({
                        ...aiFormData,
                        difficulty: value as "Easy" | "Medium" | "Hard",
                      })
                    }
                  >
                    <SelectTrigger className="rounded-xl border-slate-200 dark:border-white/[0.08] dark:bg-white/[0.02] h-11 font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-white/[0.08]">
                      <SelectItem value="Easy">{t("difficultyEasy")}</SelectItem>
                      <SelectItem value="Medium">{t("difficultyMedium")}</SelectItem>
                      <SelectItem value="Hard">{t("difficultyHard")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ai-count" className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{t("aiQuestionCount")}</Label>
                  <Input
                    id="ai-count"
                    type="number"
                    min="1"
                    max="25"
                    value={aiFormData.count}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      setAIFormData({
                        ...aiFormData,
                        count: Math.min(Math.max(value, 1), 25),
                      });
                    }}
                    className="rounded-xl border-slate-200 dark:border-white/[0.08] dark:bg-white/[0.02] h-11 font-medium"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("aiTokenLimit")}
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="ai-guidelines" className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {t("aiGuidelines")}
                </Label>
                <Textarea
                  id="ai-guidelines"
                  value={aiFormData.guidelines}
                  onChange={(e) =>
                    setAIFormData({
                      ...aiFormData,
                      guidelines: e.target.value,
                    })
                  }
                  placeholder={t("aiGuidelinesPlaceholder")}
                  rows={2}
                  className="min-h-[60px] sm:min-h-[80px] rounded-xl border-slate-200 dark:border-white/[0.08] dark:bg-white/[0.02] focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 dark:border-blue-500/20 text-blue-900 dark:text-blue-200">
                <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-semibold leading-relaxed">
                  {t("aiQualityNote")}
                </p>
              </div>

              <Button
                onClick={handleGenerateClick}
                disabled={
                  isGenerating || !aiFormData.subject || !aiFormData.topic
                }
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 text-base font-extrabold rounded-2xl shadow-lg shadow-blue-500/20 border-0 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    <span className="text-xs sm:text-sm">{t("aiGenerating")}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    <span className="text-xs sm:text-sm">{t("generateWithAI")}</span>
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent
            value="review"
            className="space-y-4 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto px-2 py-1"
          >
            {aiGenerationResult && aiGeneratedQuestions.length > 0 ? (
              <>
                <div className="flex flex-col gap-3 mb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold">
                      {t("generatedQuestions")}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {aiGenerationResult.metadata.subject} -{" "}
                      {aiGenerationResult.metadata.topic}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <div className="text-xs sm:text-sm">
                      <span className="font-medium">{t("qualityScore")}</span>
                      <Badge
                        variant={
                          aiGenerationResult.qualityScore > 0.8
                            ? "default"
                            : aiGenerationResult.qualityScore > 0.6
                              ? "secondary"
                              : "destructive"
                        }
                        className="ml-2 text-xs"
                      >
                        {(aiGenerationResult.qualityScore * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAnswers(!showAnswers)}
                        className="h-8 text-xs w-full sm:w-auto"
                      >
                        {showAnswers ? t("hideAnswers") : t("showAnswers")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={selectAllAIQuestions}
                        className="h-8 text-xs w-full sm:w-auto"
                      >
                        {selectedAIQuestions.size ===
                        aiGeneratedQuestions.length
                          ? t("deselectAll")
                          : t("selectAll")}
                      </Button>
                    </div>
                  </div>
                </div>

                <Progress
                  value={aiGenerationResult.qualityScore * 100}
                  className="mb-4"
                />

                {aiGenerationResult.suggestions.length > 0 && (
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{t("improvementSuggestions")}</strong>
                      <ul className="list-disc list-inside mt-2">
                        {aiGenerationResult.suggestions.map(
                          (suggestion, idx) => (
                            <li key={idx} className="text-sm">
                              {suggestion}
                            </li>
                          ),
                        )}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <ScrollArea className="h-[250px] sm:h-[400px] pr-2 sm:pr-4">
                  <div className="space-y-4">
                    {aiGeneratedQuestions.map((question, idx) => (
                      <div
                        key={idx}
                        className={`cursor-pointer transition-all p-4 border rounded-lg ${
                          selectedAIQuestions.has(idx)
                            ? "ring-2 ring-purple-600 bg-purple-50/50 dark:bg-purple-950/20"
                            : ""
                        }`}
                        onClick={() => toggleAIQuestionSelection(idx)}
                      >
                        <div className="flex items-start justify-between mb-2 sm:mb-3">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Checkbox
                              checked={selectedAIQuestions.has(idx)}
                              onCheckedChange={() =>
                                toggleAIQuestionSelection(idx)
                              }
                              onClick={(e) => e.stopPropagation()}
                              className="scale-75 sm:scale-100"
                            />
                            <Badge variant="outline" className="text-xs">
                              {mapDifficulty(question.difficulty, t)}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {question.topic}
                            </Badge>
                          </div>
                          {selectedAIQuestions.has(idx) && (
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                          )}
                        </div>

                        <h4 className="font-medium mb-2 text-sm sm:text-base">
                          {question.text}
                        </h4>

                        {question.options.length > 0 && (
                          <div className="space-y-1 mb-2 sm:mb-3">
                            {question.options.map((option, optIdx) => (
                              <div
                                key={optIdx}
                                className={`text-xs sm:text-sm p-1.5 sm:p-2 rounded ${
                                  showAnswers && option.isCorrect
                                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                                    : "bg-gray-100 dark:bg-gray-800"
                                }`}
                              >
                                {showAnswers && option.isCorrect && (
                                  <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 inline mr-1" />
                                )}
                                {String.fromCharCode(65 + optIdx)}){" "}
                                {option.text}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="border-t pt-2 sm:pt-3">
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            <strong>{t("explanation")}:</strong>{" "}
                            {question.explanation}
                          </p>
                          {question.learningObjective && (
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                              <strong>{t("learningObjective")}</strong>{" "}
                              {question.learningObjective}
                            </p>
                          )}
                          {question.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {question.keywords.map((keyword, kIdx) => (
                                <Badge
                                  key={kIdx}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex flex-col gap-3 pt-3 sm:pt-4 border-t border-slate-100 dark:border-white/[0.05]">
                  {!aiFormData.subject && (
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 dark:border-amber-500/20 text-amber-900 dark:text-amber-200 mb-2">
                      <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-semibold leading-relaxed">
                        {t("selectSubjectWarning")}
                      </p>
                    </div>
                  )}

                  <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left font-semibold">
                    {t("questionsSelected", {
                      selected: selectedAIQuestions.size,
                      total: aiGeneratedQuestions.length,
                    })}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      className="flex-1 h-12 text-base font-extrabold rounded-2xl border-slate-200 dark:border-white/[0.08] transition-all hover:scale-[1.01] active:scale-[0.99]"
                    >
                      {t("cancel")}
                    </Button>
                    <Button
                      onClick={handleApproveClick}
                      disabled={selectedAIQuestions.size === 0 || isCreating || !aiFormData.subject}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 flex-1 h-12 text-base font-extrabold rounded-2xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {isCreating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          <span className="text-base font-extrabold">
                            {t("adding")}
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span className="text-base font-extrabold">
                            {t("addQuestions")}
                          </span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkles className="w-16 h-16 text-purple-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t("noAiQuestionsYet")}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {t("noAiQuestionsYetDesc")}
                </p>
                <Button
                  variant="outline"
                  onClick={() => setActiveAITab("generate")}
                >
                  {t("generateQuestions")}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
