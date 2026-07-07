"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Brain, Target, BookOpen, Sparkles, Zap, TrendingUp } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { getFlashcardRecommendation, type FlashcardRecommendationOutput } from "@/ai/flows/flashcard-recommendation";
import { getStoredAiPreferences, isAiConfigured } from "@/lib/ai-preferences";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface PerformanceData {
  subject: string;
  averageScore: number;
  totalTests: number;
  weakTopics: string[];
  strongTopics: string[];
  lastUpdated: string;
}

interface QuizResult {
  id: string;
  subject: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  weakTopics: string[] | Record<string, number>;
  createdAt: string;
  isDemo?: boolean;
}

interface TotalStats {
  totalTests: number;
  averageScore: number;
  totalTimeSpent: number;
  totalSubjects: number;
}

interface AIPerformanceRecommendationProps {
  performanceData: PerformanceData[];
  recentResults: QuizResult[];
  totalStats: TotalStats;
  useDemoData?: boolean;
  className?: string;
}

// In-memory storage for AI recommendations
let aiRecommendationStorage: { recommendation: FlashcardRecommendationOutput; timestamp: string } | null = null;

export default function AIPerformanceRecommendation({
  performanceData,
  recentResults,
  className = "",
}: AIPerformanceRecommendationProps) {
  const t = useTranslations("AIPerformance");
  const locale = useLocale();
  const { toast } = useToast();
  const [aiRecommendation, setAiRecommendation] = useState<FlashcardRecommendationOutput | null>(null);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);

  // Load saved recommendation on component mount
  useEffect(() => {
    const loadSavedRecommendation = () => {
      try {
        if (aiRecommendationStorage) {
          // Check if the saved recommendation is not too old (24 hours)
          const savedTime = new Date(aiRecommendationStorage.timestamp).getTime();
          const currentTime = new Date().getTime();
          const hoursDiff = (currentTime - savedTime) / (1000 * 60 * 60);

          if (hoursDiff < 24) {
            setAiRecommendation(aiRecommendationStorage.recommendation);
          } else {
            // Remove old recommendation
            aiRecommendationStorage = null;
          }
        }
      } catch {
        // Remove corrupted data
        aiRecommendationStorage = null;
      }
    };

    loadSavedRecommendation();
  }, []);

  // Save recommendation to memory
  const saveRecommendation = (recommendation: FlashcardRecommendationOutput) => {
    try {
      const dataToSave = {
        recommendation,
        timestamp: new Date().toISOString(),
      };
      aiRecommendationStorage = dataToSave;
    } catch {
      // do nothing
    }
  };

  // Clear saved recommendation from memory
  const clearSavedRecommendation = () => {
    try {
      aiRecommendationStorage = null;
    } catch {
      // do nothing
    }
  };

  const getAIRecommendation = async () => {
    setIsLoadingRecommendation(true);
    try {
      // Translation helper to ensure AI gets localized context
      const translateSubject = (subject: string) => {
        if (locale === "tr" || !subject) {return subject;}
        const map: Record<string, string> = {
          "Matematik": "Mathematics",
          "Fizik": "Physics",
          "Kimya": "Chemistry",
          "Biyoloji": "Biology",
          "Tarih": "History",
          "Türk Dili ve Edebiyatı": "Turkish Language & Literature",
          "İngilizce": "English",
          "Coğrafya": "Geography",
          "Felsefe": "Philosophy",
          "Din Kültürü": "Religion"
        };
        return map[subject] || subject;
      };

      // Find the subject with lowest performance
      const worstPerformingSubject = [...performanceData]
        .sort((a, b) => a.averageScore - b.averageScore)[0];
        
      const translatedWorstSubject = worstPerformingSubject ? translateSubject(worstPerformingSubject.subject) : "Genel";

      // Prepare performance data for AI (translated so AI uses correct locale words)
      const combinedData = {
        performanceData: performanceData.map(d => ({...d, subject: translateSubject(d.subject)})),
        quizResults: recentResults.map(r => ({...r, subject: translateSubject(r.subject)})),
        studyHistory: [],
        flashcardProgress: [],
        currentSubject: translatedWorstSubject
      };
      const performanceDataString = JSON.stringify(combinedData);

      // Get the most recent weak topics from recent results
      recentResults
        .slice(-3)
        .flatMap(result => {
          if (Array.isArray(result.weakTopics)) {
            return result.weakTopics;
          } else if (typeof result.weakTopics === 'object') {
            return Object.keys(result.weakTopics);
          }
          return [];
        })
        .slice(0, 5);

      const preferences = getStoredAiPreferences();
      if (!isAiConfigured(preferences)) {
        toast({
          title: "AI not configured",
          description: "Please set your API key in Settings for recommendations.",
          variant: "destructive",
        });
        return;
      }

      const recommendation = await getFlashcardRecommendation({
        userId: "user-123",
        subject: translatedWorstSubject,
        performanceData: performanceDataString,
        currentFlashcardData: JSON.stringify([]), // Empty for general recommendations
        studyMode: "general",
        targetStudyTime: 30,
        preferences,
        language: locale === "en" ? "en" : "tr",
      });

      setAiRecommendation(recommendation);
      saveRecommendation(recommendation);
    } catch {
    } finally {
      setIsLoadingRecommendation(false);
    }
  };

  const hideRecommendation = () => {
    setAiRecommendation(null);
    clearSavedRecommendation();
  };

  return (
    <Dialog open={Boolean(aiRecommendation)} onOpenChange={(open) => {
      if (!open) {hideRecommendation();}
    }}>
      <div className={className}>
        <div
          className="apple-glass-card cursor-pointer h-full"
          onClick={() => {
            if (!aiRecommendation && !isLoadingRecommendation) {
              void getAIRecommendation();
            }
          }}
        >
          <div className="flex flex-col h-full w-full relative z-10 p-6 text-center justify-center items-center">
            {isLoadingRecommendation ? (
              <div className="relative mb-3">
                <motion.div
                  className="w-12 h-12 border-4 border-[#007aff]/30 dark:border-[#0a84ff]/30 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-[#007aff] dark:border-t-[#0a84ff] rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
                <Brain className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-[#007aff] dark:text-[#0a84ff]" />
              </div>
            ) : (
              <div className="mb-3 flex justify-center">
                <div className="w-14 h-14 bg-[#007aff]/10 dark:bg-[#0a84ff]/20 border border-[#007aff]/20 rounded-2xl flex items-center justify-center">
                  <Brain className="w-7 h-7 text-[#007aff] dark:text-[#0a84ff]" />
                </div>
              </div>
            )}
            <h3 className="font-semibold mb-2 text-base text-[#1d1d1f] dark:text-[#f5f5f7]">{t("aiAnalysis")}</h3>
            <p className="text-xs font-medium text-[#86868b] dark:text-[#a1a1a6]">
              {isLoadingRecommendation ? t("analyzing") : t("getAiRecommendation")}
            </p>
          </div>
        </div>
      </div>

      <DialogContent className="sm:max-w-[700px] bg-[#ffffff] dark:bg-[#1c1c1e] border-0 p-0 overflow-hidden shadow-2xl rounded-2xl">
        <DialogTitle className="sr-only">{t("aiPerformanceRecommendation")}</DialogTitle>
        <DialogDescription className="sr-only">{t("aiStudyStrategy")}</DialogDescription>

        {aiRecommendation && (
          <div className="relative">
            {/* Modal Header Area */}
            <div className="bg-[#f5f5f7] dark:bg-[#1d1d1f] p-6 sm:p-8 relative overflow-hidden border-b border-[#e5e5ea] dark:border-[#38383a]">
              <div className="relative z-10 flex items-center gap-3 sm:gap-4 mb-2">
                <div className="bg-[#007aff]/10 dark:bg-[#0a84ff]/20 p-2 sm:p-3 rounded-2xl border border-[#007aff]/20">
                  <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-[#007aff] dark:text-[#0a84ff]" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">{t("smartStudyRecommendation")}</h3>
                  <p className="text-sm sm:text-base font-medium text-[#86868b] dark:text-[#a1a1a6]">{t("preparedBasedOnAnalysis")}</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 space-y-4">
              <div className="bg-[#f5f5f7] dark:bg-[#2c2c2e]/50 rounded-2xl p-4 sm:p-5 border border-transparent dark:border-[#38383a]">
                <h4 className="font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-2 flex items-center gap-2 text-sm sm:text-base">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-[#34c759] dark:text-[#30d158] flex-shrink-0" />
                  {t("recommendedStrategy")}
                </h4>
                <p className="text-sm text-[#3a3a3c] dark:text-[#ebebf5] font-medium leading-relaxed">
                  {aiRecommendation.studyStrategy}
                </p>
              </div>

              {aiRecommendation.reasoning && (
                <div className="bg-[#f5f5f7] dark:bg-[#2c2c2e]/50 rounded-2xl p-4 sm:p-5 border border-transparent dark:border-[#38383a]">
                  <h4 className="font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-2 flex items-center gap-2 text-sm sm:text-base">
                    <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-[#af52de] dark:text-[#bf5af2] flex-shrink-0" />
                    {t("whyThisRecommendation")}
                  </h4>
                  <p className="text-sm text-[#3a3a3c] dark:text-[#ebebf5] font-medium leading-relaxed italic">
                    &quot;{aiRecommendation.reasoning}&quot;
                  </p>
                </div>
              )}

              {aiRecommendation.recommendedTopics.length > 0 && (
                <div className="bg-[#f5f5f7] dark:bg-[#2c2c2e]/50 rounded-2xl p-4 sm:p-5 border border-transparent dark:border-[#38383a]">
                  <h4 className="font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-[#007aff] dark:text-[#0a84ff] flex-shrink-0" />
                    {t("topicsToFocus")}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {aiRecommendation.recommendedTopics.slice(0, 5).map((topic, index) => (
                      <Badge
                        key={index}
                        className="bg-[#007aff] text-white border-0 px-3 py-1 text-xs sm:text-sm shadow-md"
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm bg-[#f5f5f7] dark:bg-[#2c2c2e]/50 rounded-xl p-3 gap-2 sm:gap-0 border border-transparent dark:border-[#38383a]">
                <span className="flex items-center gap-2 text-[#ff9500] dark:text-[#ff9f0a] font-medium">
                  <Zap className="h-4 w-4 flex-shrink-0" />
                  {t("estimatedTime", { time: aiRecommendation.estimatedTime })}
                </span>
                <span className="flex items-center gap-2 text-[#34c759] dark:text-[#30d158] font-medium">
                  <TrendingUp className="h-4 w-4 flex-shrink-0" />
                  {t("confidence")} {Math.round(aiRecommendation.confidence * 100)}%
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={() => window.location.href = `/flashcard`}
                  className="flex-1 bg-[#007aff] hover:bg-[#007aff]/90 text-white border-0 shadow-md transition-all duration-300 py-6 text-base font-semibold rounded-xl"
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  {t("goToFlashcards")}
                </Button>
                <Button
                  onClick={() => window.location.href = "/quiz"}
                  variant="outline"
                  className="flex-1 border border-[#e5e5ea] dark:border-[#38383a] bg-transparent hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] transition-all duration-300 py-6 text-base font-semibold rounded-xl shadow-sm"
                >
                  <Target className="h-5 w-5 mr-2 text-[#1d1d1f] dark:text-[#f5f5f7]" />
                  <span className="text-[#1d1d1f] dark:text-[#f5f5f7]">{t("takeQuiz")}</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
