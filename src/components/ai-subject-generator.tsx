"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { mapAiDifficulty } from "@/lib/question-manager-labels";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getStoredAiPreferences } from "@/lib/ai-preferences";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

interface AIGeneratedSubject {
  name: string;
  description: string;
  category: string;
  difficulty: "Başlangıç" | "Orta" | "İleri";
  topics: string[];
  learningObjectives: string[];
  estimatedDuration: string;
  prerequisites: string[];
  keywords: string[];
}

interface AIGenerationResult {
  subjects: AIGeneratedSubject[];
  metadata: {
    totalGenerated: number;
    averageDifficulty: string;
    generationTimestamp: string;
  };
  qualityScore: number;
  suggestions: string[];
}

interface AISubjectGeneratorProps {
  onSubjectsGenerated?: (subjects: AIGeneratedSubject[]) => void;
  className?: string;
}

export default function AISubjectGenerator({
  onSubjectsGenerated,
  className = "",
}: AISubjectGeneratorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiGeneratedSubjects, setAIGeneratedSubjects] = useState<AIGeneratedSubject[]>([]);
  const [aiGenerationResult, setAIGenerationResult] = useState<AIGenerationResult | null>(null);
  const [selectedAISubjects, setSelectedAISubjects] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<string>("generate");
  const t = useTranslations("SubjectManager.ai");
  const tRoot = useTranslations("SubjectManager");
  const locale = useLocale();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    category: "",
    difficulty: "Orta" as "Başlangıç" | "Orta" | "İleri",
    count: 3,
    guidelines: "",
  });

  const handleAIGenerate = async () => {
    try {
      setIsGenerating(true);

      const preferences = getStoredAiPreferences();

      const response = await fetch("/api/ai-generate-subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          language: locale,
          preferences,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate subjects");
      }

      const result: AIGenerationResult = await response.json();

      setAIGenerationResult(result);
      setAIGeneratedSubjects(result.subjects);

      // Auto-select high quality subjects
      const autoSelected = new Set<number>();
      result.subjects.forEach((subject, idx) => {
        if (subject.name && subject.description && subject.category && subject.topics.length > 0) {
          autoSelected.add(idx);
        }
      });
      setSelectedAISubjects(autoSelected);

      // Switch to review tab
      setActiveTab("review");

      toast({
        title: t("toasts.generatedTitle"),
        description: t("toasts.generatedDesc", {
          count: result.subjects.length,
          score: (result.qualityScore * 100).toFixed(0),
        }),
      });
    } catch {
      toast({
        title: t("toasts.errorTitle"),
        description: t("toasts.generateError"),
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApproveAISubjects = async () => {
    if (selectedAISubjects.size === 0) {
      toast({
        title: t("toasts.warningTitle"),
        description: t("toasts.selectSubjects"),
        variant: "destructive",
      });
      return;
    }

    try {
      const subjectsToAdd = aiGeneratedSubjects.filter((_, idx) => selectedAISubjects.has(idx));

      // Call the callback function
      if (onSubjectsGenerated) {
        onSubjectsGenerated(subjectsToAdd);
      }

      toast({
        title: t("toasts.successTitle"),
        description: t("toasts.addedDesc", { count: subjectsToAdd.length }),
      });

      // Reset dialog
      setIsDialogOpen(false);
      setAIGeneratedSubjects([]);
      setAIGenerationResult(null);
      setSelectedAISubjects(new Set());
    } catch {
      toast({
        title: t("toasts.errorTitle"),
        description: t("toasts.addError"),
        variant: "destructive",
      });
    }
  };

  const toggleAISubjectSelection = (index: number) => {
    const newSelection = new Set(selectedAISubjects);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedAISubjects(newSelection);
  };

  const selectAllAISubjects = () => {
    if (selectedAISubjects.size === aiGeneratedSubjects.length) {
      setSelectedAISubjects(new Set());
    } else {
      setSelectedAISubjects(new Set(aiGeneratedSubjects.map((_, idx) => idx)));
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        className={`bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-sm transition-all hover:shadow-md h-11 px-6 rounded-xl ${className}`}
      >
        <Sparkles className="w-4 h-4 mr-2" />
        {t("generateButton")}
      </Button>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setAIGeneratedSubjects([]);
            setAIGenerationResult(null);
            setSelectedAISubjects(new Set());
            setActiveTab("generate");
          }
        }}
      >
        <DialogContent className="w-[90vw] sm:w-[95vw] max-w-2xl h-auto max-h-[85vh] flex flex-col p-0 border-0 rounded-[32px] overflow-hidden shadow-2xl bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-xl">
          <DialogHeader className="p-4 sm:p-5 pb-3 border-b border-slate-100 dark:border-white/[0.05]">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-black tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              {t("dialogTitle")}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-4 sm:px-5">
            {activeTab === "generate" ? (
              <div className="space-y-4 sm:space-y-5 py-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="category"
                      className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]"
                    >
                      {tRoot("category")}
                    </Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder={tRoot("exampleScience")}
                      className="h-11 rounded-xl border-slate-200 dark:border-white/[0.08] dark:bg-white/[0.02] focus:ring-2 focus:ring-blue-500/20 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="difficulty"
                      className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]"
                    >
                      {tRoot("difficultyLevel")}
                    </Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          difficulty: value as "Başlangıç" | "Orta" | "İleri",
                        })
                      }
                    >
                      <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-white/[0.08] dark:bg-white/[0.02] font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 dark:border-white/[0.08]">
                        <SelectItem value="Başlangıç">{tRoot("difficultyBeginner")}</SelectItem>
                        <SelectItem value="Orta">{tRoot("difficultyMedium")}</SelectItem>
                        <SelectItem value="İleri">{tRoot("difficultyAdvanced")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="count"
                    className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]"
                  >
                    {t("subjectCount")}
                  </Label>
                  <Input
                    id="count"
                    type="number"
                    min="1"
                    max="5"
                    value={formData.count}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        count: parseInt(e.target.value) || 1,
                      })
                    }
                    className="h-11 max-w-xs rounded-xl border-slate-200 dark:border-white/[0.08] dark:bg-white/[0.02] font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="guidelines"
                    className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]"
                  >
                    {t("guidelinesOptional")}
                  </Label>
                  <Textarea
                    id="guidelines"
                    value={formData.guidelines}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guidelines: e.target.value,
                      })
                    }
                    placeholder={t("guidelinesPlaceholder")}
                    rows={4}
                    className="min-h-[100px] resize-none rounded-xl border-slate-200 dark:border-white/[0.08] dark:bg-white/[0.02] focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 dark:border-blue-500/20 text-blue-900 dark:text-blue-200">
                  <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold leading-relaxed">{t("qualityNotice")}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full py-3">
                {aiGenerationResult && aiGeneratedSubjects.length > 0 ? (
                  <>
                    {/* Header Section */}
                    <div className="space-y-4 mb-5">
                      <div>
                        <h3 className="text-lg font-semibold">{t("generatedSubjects")}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t("categoryLabel", { category: formData.category })}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="text-sm">
                            <span className="font-medium">{t("qualityScore")}</span>
                            <Badge
                              variant={
                                aiGenerationResult.qualityScore > 0.8
                                  ? "default"
                                  : aiGenerationResult.qualityScore > 0.6
                                    ? "secondary"
                                    : "destructive"
                              }
                              className="ml-2"
                            >
                              {(aiGenerationResult.qualityScore * 100).toFixed(0)}%
                            </Badge>
                          </div>
                          <Progress
                            value={aiGenerationResult.qualityScore * 100}
                            className="w-24"
                          />
                        </div>

                        <Button variant="outline" size="sm" onClick={selectAllAISubjects}>
                          {selectedAISubjects.size === aiGeneratedSubjects.length
                            ? t("deselectAll")
                            : t("selectAll")}
                        </Button>
                      </div>

                      {aiGenerationResult.suggestions.length > 0 && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>{t("improvementSuggestions")}</strong>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              {aiGenerationResult.suggestions.map((suggestion, idx) => (
                                <li key={idx} className="text-sm">
                                  {suggestion}
                                </li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    {/* Subjects List */}
                    <div className="overflow-y-auto max-h-[420px] pr-1">
                      <div className="space-y-3 pb-4">
                        {aiGeneratedSubjects.map((subject, idx) => (
                          <Card
                            key={idx}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              selectedAISubjects.has(idx)
                                ? "ring-2 ring-blue-600 bg-blue-50/50 dark:bg-blue-950/20"
                                : ""
                            }`}
                            onClick={() => toggleAISubjectSelection(idx)}
                          >
                            <CardContent className="p-5">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={selectedAISubjects.has(idx)}
                                    onChange={() => toggleAISubjectSelection(idx)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-4 h-4"
                                  />
                                  <div className="flex gap-2">
                                    <Badge variant="outline">
                                      {mapAiDifficulty(subject.difficulty, (key) => tRoot(key))}
                                    </Badge>
                                    <Badge variant="secondary">{subject.category}</Badge>
                                  </div>
                                </div>
                                {selectedAISubjects.has(idx) && (
                                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                )}
                              </div>

                              <h4 className="font-semibold text-base mb-3">{subject.name}</h4>

                              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                                {subject.description}
                              </p>

                              <div className="space-y-4">
                                {subject.topics.length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium mb-2">{t("topics")}</p>
                                    <div className="flex flex-wrap gap-2">
                                      {subject.topics.map((topic, tIdx) => (
                                        <Badge key={tIdx} variant="outline" className="text-xs">
                                          {topic}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {subject.learningObjectives.length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium mb-2">
                                      {t("learningObjectives")}
                                    </p>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                      {subject.learningObjectives.map((objective, oIdx) => (
                                        <li key={oIdx} className="flex items-start gap-2">
                                          <span className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0" />
                                          {objective}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {subject.prerequisites.length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium mb-2">{t("prerequisites")}</p>
                                    <div className="flex flex-wrap gap-2">
                                      {subject.prerequisites.map((prereq, pIdx) => (
                                        <Badge key={pIdx} variant="outline" className="text-xs">
                                          {prereq}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div className="text-sm text-muted-foreground pt-2 border-t">
                                  <strong>{t("estimatedDuration")}</strong>{" "}
                                  {subject.estimatedDuration}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1 text-center">
                    <Sparkles className="w-16 h-16 text-green-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t("noSubjectsYet")}</h3>
                    <p className="text-muted-foreground mb-4">{t("noSubjectsYetDesc")}</p>
                    <Button variant="outline" onClick={() => setActiveTab("generate")}>
                      {t("generateSubjects")}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-slate-100 dark:border-white/[0.05] p-4 sm:p-5 pt-3">
            {activeTab === "generate" ? (
              <Button
                onClick={() => {
                  void handleAIGenerate();
                }}
                disabled={isGenerating || !formData.category}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 text-base font-extrabold rounded-2xl shadow-lg shadow-blue-500/20 border-0 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    {t("generating")}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {t("generateButton")}
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center font-semibold">
                  {t("selectedCount", {
                    selected: selectedAISubjects.size,
                    total: aiGeneratedSubjects.length,
                  })}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1 h-12 text-base font-extrabold rounded-2xl border-slate-200 dark:border-white/[0.08] transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {tRoot("cancel")}
                  </Button>
                  <Button
                    onClick={() => {
                      void handleApproveAISubjects();
                    }}
                    disabled={selectedAISubjects.size === 0}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 flex-1 h-12 text-base font-extrabold rounded-2xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {t("addSubjects", { count: selectedAISubjects.size })}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
