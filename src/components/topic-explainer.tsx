"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import {
  BookOpen,
  Lightbulb,
  Target,
  Play,
  Pause,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Save,
  Trash2,
  Volume,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { useToast } from "@/hooks/use-toast";
import type { TopicExplainerInput } from "@/ai/flows/topic-explainer-ai";
import { generateTopicStepContent } from "@/ai/flows/topic-explainer-ai";
import { getStoredAiPreferences, isAiConfigured } from "@/lib/ai-preferences";
import { logError } from "@/lib/error-logger";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import TopicExplainerLocalStorageService from "@/services/topic-explainer-service";
import VoicePlayer from "@/components/voice-player";
import BreakoutLoadingGame from "@/components/breakout-loading-game";
import AIFloatingChat from "./ai-floating-chat";

type TopicData = {
  topic: string;
  subject: string;
  steps: Array<{
    id: string;
    title: string;
    content: string;
    examples: string[];
    tips: string[];
    difficulty: "easy" | "medium" | "hard";
    estimatedTime: number;
    visualDescription?: string;
    confidence?: number;
  }>;
  totalTime: number;
  difficulty: "easy" | "medium" | "hard";
  prerequisites: string[];
  learningObjectives: string[];
};

interface TopicExplainerProps {
  topic: string;
  subject: string;
  isDemoMode?: boolean;
  hasSavedContent?: boolean;
  savedTopicId?: string | null;
}

const TopicExplainer: React.FC<TopicExplainerProps> = ({
  topic,
  subject,
  isDemoMode = false,
  hasSavedContent = false,
  savedTopicId = null,
}) => {
  const { toast } = useToast();
  const t = useTranslations("TopicExplainer");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();
  const voiceLanguage = locale === "tr" ? "tr-TR" : "en-US";

  const getStepLabel = (stepId: string) => {
    const labels: Record<string, string> = {
      introduction: t("stepIntroduction"),
      core_learning: t("stepLearning"),
      reinforcement: t("stepReinforcement"),
      application: t("stepApplication"),
      assessment: t("stepEvaluation"),
    };
    return labels[stepId] ?? stepId;
  };

  const getDifficultyLabel = (difficulty: string) => {
    if (difficulty === "easy") {
      return t("difficultyEasy");
    }
    if (difficulty === "medium") {
      return t("difficultyMedium");
    }
    return t("difficultyHard");
  };

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(() => new Set());
  const [userNotes, setUserNotes] = useState<string>("");
  const [notesKey, setNotesKey] = useState<string>("");
  const [showTips, setShowTips] = useState(true);
  const [topicData, setTopicData] = useState<TopicData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<string>(subject);
  const [generatingStepId, setGeneratingStepId] = useState<string | null>(null);

  // Refs to avoid stale closures in async generators
  const topicDataRef = useRef<TopicData | null>(null);
  const notesKeyRef = useRef<string>("");

  // Keep refs in sync
  useEffect(() => {
    topicDataRef.current = topicData;
  }, [topicData]);

  useEffect(() => {
    notesKeyRef.current = notesKey;
  }, [notesKey]);

  // Step configuration + generators (defined early to avoid TDZ in effects)
  const stepConfigs = [
    { id: "introduction", difficulty: "easy" as const, estimatedTime: 8 },
    { id: "core_learning", difficulty: "easy" as const, estimatedTime: 12 },
    { id: "reinforcement", difficulty: "easy" as const, estimatedTime: 15 },
    { id: "application", difficulty: "medium" as const, estimatedTime: 18 },
    { id: "assessment", difficulty: "medium" as const, estimatedTime: 20 },
  ] as const;

  const generateSingleStep = async (
    topicName: string,
    subjectName: string,
    config: { id: string; difficulty: "easy" | "medium" | "hard"; estimatedTime: number },
    previousContext?: string,
  ) => {
    const prefsForStep = getStoredAiPreferences();
    if (!isAiConfigured(prefsForStep)) {
      // Return fallback content instead of throwing to server
      return {
        id: config.id,
        title: `${config.id} (Configuration needed)`,
        content: "AI service configuration error. Please check your API key in Settings.",
        examples: [],
        tips: [],
        difficulty: config.difficulty,
        estimatedTime: config.estimatedTime,
        visualDescription: "",
        confidence: 0,
      };
    }

    try {
      const aiInput: TopicExplainerInput = {
        topic: topicName,
        subject: subjectName,
        step: config.id as
          "introduction" | "core_learning" | "reinforcement" | "application" | "assessment",
        difficulty: config.difficulty,
        estimatedTime: config.estimatedTime,
        preferences: prefsForStep,
        language: locale === "en" ? "en" : "tr",
        previousStepsContext: previousContext,
      };

      const aiOutput = await generateTopicStepContent(aiInput);

      return {
        id: config.id,
        title: aiOutput.title,
        content: aiOutput.content,
        examples: aiOutput.examples,
        tips: aiOutput.tips,
        difficulty: config.difficulty,
        estimatedTime: config.estimatedTime,
        visualDescription: aiOutput.visualDescription,
        confidence: aiOutput.confidence,
      };
    } catch {
      // Rich fallback (matches improved AI fallback)
      const stepLabel = getStepLabel(config.id);
      const isAssessment = config.id === "assessment";
      const topic = topicName;

      const content = isAssessment
        ? locale === "en"
          ? `## Self-Assessment for ${topic}\n\nTest yourself:\n\n1. Key definitions and formulas in ${topic}?\n2. Solve a basic problem with ${topic}.\n3. Common mistakes with ${topic}?\n4. Real-world use of ${topic}?\n5. Explain ${topic} as if teaching someone.\n\n**Mastery tip:** Review earlier steps first.`
          : `## ${topic} İçin Ustalık Kontrolü\n\nKendini test et:\n\n1. ${topic} tanımlar ve formüller?\n2. Basit bir ${topic} problemi çöz.\n3. ${topic} ile ilgili yaygın hatalar?\n4. ${topic} günlük hayatta nerede kullanılır?\n5. ${topic} konusunu birine anlat.\n\n**İpucu:** Önceki adımları gözden geçir.`
        : t("fallbackStepContent", { topic: topicName, step: stepLabel });

      return {
        id: config.id,
        title: `${topic} - ${stepLabel}`,
        content,
        examples: [
          t("fallbackExample1", { topic: topicName }),
          t("fallbackExample2", { topic: topicName }),
          t("fallbackExample3", { topic: topicName }),
        ],
        tips: [t("fallbackTip1", { topic: topicName }), t("fallbackTip2"), t("fallbackTip3")],
        difficulty: config.difficulty,
        estimatedTime: config.estimatedTime,
        visualDescription: `${topicName} - ${stepLabel} için detaylı görsel`,
        confidence: 0.3,
      };
    }
  };

  const isStepGenerated = (step: any) =>
    step?.content &&
    step.content.trim().length > 30 &&
    !step.content.includes("fallbackStepContent");

  const ensureStepIsGenerated = async (stepIndex: number, force = false) => {
    const latestTopicData = topicDataRef.current || topicData;
    if (!latestTopicData) {
      return;
    }

    const currentSteps = latestTopicData.steps;
    const targetStep = currentSteps[stepIndex];
    if (!targetStep) {
      return;
    }
    if (!force && isStepGenerated(targetStep)) {
      return;
    }

    const config = stepConfigs.find((c) => c.id === targetStep.id);
    if (!config) {
      return;
    }

    setGeneratingStepId(targetStep.id);
    setAiGenerating(true);

    try {
      // Build context from already generated previous steps (improves quality & coherence)
      const previousContext = currentSteps
        .slice(0, stepIndex)
        .filter((s: any) => s?.content && s.content.length > 30)
        .map((s: any) => `### ${s.title}\n${s.content.substring(0, 700)}`)
        .join("\n\n---\n\n");

      const generatedStep = await generateSingleStep(
        topic,
        subject,
        config,
        previousContext.length > 100 ? previousContext : undefined,
      );
      const updatedSteps = [...currentSteps];
      updatedSteps[stepIndex] = generatedStep;

      const updatedTopicData: TopicData = { ...latestTopicData, steps: updatedSteps };
      setTopicData(updatedTopicData);

      const latestNotesKey = notesKeyRef.current || notesKey;
      if (latestNotesKey) {
        try {
          TopicExplainerLocalStorageService.updateTopic(latestNotesKey, {
            content: JSON.stringify(updatedTopicData),
            stepData: updatedSteps,
          });
        } catch {}
      }
    } catch (err) {
      logError("Step generation failed", err);
    } finally {
      setGeneratingStepId(null);
      setAiGenerating(false);
    }
  };

  const regenerateStep = async (stepIndex: number) => {
    await ensureStepIsGenerated(stepIndex, true);
  };

  // 🔄 SUBJECT CHANGE DETECTION (NO CLEARING)
  useEffect(() => {
    if (subject !== currentSubject) {
      // Update current subject (NO CLEARING - keep all data separate)
      setCurrentSubject(subject);
    }
  }, [subject, currentSubject]);

  // Load topic data - first check localStorage, then generate if needed
  useEffect(() => {
    const loadTopicData = async () => {
      try {
        setIsLoading(true);

        // First check if we have saved content
        if (hasSavedContent && savedTopicId) {
          const savedTopic = TopicExplainerLocalStorageService.getTopicById(savedTopicId);
          if (savedTopic) {
            // Double-check that this topic belongs to the current subject
            if (savedTopic.subject === subject) {
              const parsedData = JSON.parse(savedTopic.content);
              setTopicData(parsedData);
              setNotesKey(savedTopicId);

              // Load saved notes
              const savedNotes = localStorage.getItem(`mindhouse_notes_${savedTopicId}`);
              if (savedNotes) {
                setUserNotes(savedNotes);
              }

              // Log this activity so it shows up in Dashboard
              try {
                const quizResultsKey = isDemoMode
                  ? "exam_training_demo_quiz_results"
                  : "exam_training_quiz_results";
                const quizResultsStr = localStorage.getItem(quizResultsKey);
                const results = quizResultsStr ? JSON.parse(quizResultsStr) : [];

                const existingRecentActivity = results.find(
                  (r: any) =>
                    r.type === "TopicExplainer" &&
                    r.subject === subject &&
                    r.topic === topic &&
                    new Date().getTime() - new Date(r.createdAt).getTime() < 4 * 60 * 60 * 1000,
                );

                if (!existingRecentActivity) {
                  results.push({
                    id: `explainer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    userId: "guest",
                    type: "TopicExplainer",
                    subject,
                    topic,
                    score: 1,
                    totalQuestions: 1,
                    timeSpent: parsedData.totalTime || 300,
                    weakTopics: [],
                    createdAt: new Date().toISOString(),
                  });
                  localStorage.setItem(quizResultsKey, JSON.stringify(results));
                }
              } catch (e) {
                logError("Failed to save explainer activity", e);
              }

              toast({
                title: t("savedContentLoaded"),
                description: t("savedContentLoadedDesc", { topic, subject }),
              });
              return;
            } else {
              //do nothing
            }
          }
        }

        // If no saved content, generate ONLY THE FIRST STEP (page-by-page / lazy)
        // This avoids long waiting for all 5 steps at once.
        setAiGenerating(true);
        const firstConfig = stepConfigs[0];
        const firstStep = await generateSingleStep(topic, subject, firstConfig, undefined);

        // Create shell for all 5 steps, only first one populated
        const stepShells = stepConfigs.map((cfg, idx) => {
          if (idx === 0) {
            return firstStep;
          }
          return {
            id: cfg.id,
            title: getStepLabel(cfg.id),
            content: "", // pending - will be generated on demand
            examples: [],
            tips: [],
            difficulty: cfg.difficulty,
            estimatedTime: cfg.estimatedTime,
            visualDescription: "",
            confidence: 0,
          };
        });

        const initialData: TopicData = {
          topic,
          subject,
          steps: stepShells,
          totalTime: stepShells.reduce((sum, s) => sum + s.estimatedTime, 0),
          difficulty: "medium" as const,
          prerequisites: [t("prerequisiteBasics", { subject }), t("prerequisiteActiveLearning")],
          learningObjectives: [
            t("objectiveUnderstand", { topic }),
            t("objectiveApply", { topic }),
            t("objectiveProblemSolving", { topic }),
            t("objectiveConnect", { topic }),
          ],
        };

        setTopicData(initialData);

        // Auto-save the partial content
        const content = JSON.stringify(initialData);
        const savedTopic = TopicExplainerLocalStorageService.saveTopic(
          topic,
          subject,
          content,
          initialData.steps,
        );
        setNotesKey(savedTopic.id);

        // Log this activity so it shows up in Dashboard
        try {
          const quizResultsKey = isDemoMode
            ? "exam_training_demo_quiz_results"
            : "exam_training_quiz_results";
          const quizResultsStr = localStorage.getItem(quizResultsKey);
          const results = quizResultsStr ? JSON.parse(quizResultsStr) : [];

          const existingRecentActivity = results.find(
            (r: any) =>
              r.type === "TopicExplainer" &&
              r.subject === subject &&
              r.topic === topic &&
              new Date().getTime() - new Date(r.createdAt).getTime() < 4 * 60 * 60 * 1000,
          );

          if (!existingRecentActivity) {
            results.push({
              id: `explainer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              userId: "guest",
              type: "TopicExplainer",
              subject,
              topic,
              score: 1, // Read completely
              totalQuestions: 1, // Dummy value
              timeSpent: initialData.totalTime || 300,
              weakTopics: [],
              createdAt: new Date().toISOString(),
            });
            localStorage.setItem(quizResultsKey, JSON.stringify(results));
          }
        } catch (e) {
          logError("Failed to save explainer activity", e);
        }

        toast({
          title: t("aiContentReady"),
          description: t("aiContentReadyDesc", { topic }),
        });
      } catch {
        toast({
          title: t("aiError"),
          description: t("aiErrorDesc"),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setAiGenerating(false);
      }
    };

    loadTopicData();
  }, [topic, subject, hasSavedContent, savedTopicId, toast, t, isDemoMode]);

  // Auto-save notes when userNotes changes
  useEffect(() => {
    if (notesKey) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem(`mindhouse_notes_${notesKey}`, userNotes);
      }, 500); // Debounce 500ms

      return () => clearTimeout(timeoutId);
    }
    return undefined;
  }, [userNotes, notesKey]);

  const steps = topicData?.steps || [];

  // Auto-play functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && currentStep < (steps?.length || 0) - 1) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < (steps?.length || 0) - 1) {
            const newStep = prev + 1;
            setProgress(((newStep + 1) / (steps?.length || 1)) * 100);
            return newStep;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 10000); // 10 seconds per step
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length]);

  // Update progress
  useEffect(() => {
    setProgress(((currentStep + 1) / steps.length) * 100);
  }, [currentStep, steps.length]);

  // When currentStep changes (e.g. from saved state or direct), ensure content
  useEffect(() => {
    if (topicData && steps.length > currentStep) {
      const step = steps[currentStep];
      if (step && !isStepGenerated(step)) {
        // fire and forget - will show loading state
        void ensureStepIsGenerated(currentStep);
      }
    }
  }, [currentStep, topicData]);

  const goToStep = async (index: number) => {
    if (index < 0 || index >= steps.length) {
      return;
    }

    // Switch to the target step *first* so the UI updates immediately.
    // This shows the loading state in the content area for ungenerated steps
    // (prevents the "Next does nothing" feeling).
    const prevId = steps[currentStep]?.id;
    setCurrentStep(index);
    if (prevId) {
      setCompletedSteps((prev: Set<string>) => new Set([...prev, prevId]));
    }

    // Then ensure the content is generated (will show spinner + "generating..." in the new step view)
    await ensureStepIsGenerated(index);
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      await goToStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setCompletedSteps(() => new Set());
    setProgress(0);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Save current topic content
  const handleSaveTopic = async () => {
    if (!topicData) {
      return;
    }

    try {
      setIsSaving(true);

      const content = JSON.stringify(topicData);
      TopicExplainerLocalStorageService.saveTopic(topic, subject, content, topicData.steps);

      toast({
        title: t("success"),
        description: t("topicSavedDesc", { topic }),
      });
    } catch {
      toast({
        title: tCommon("error"),
        description: t("topicSaveError"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete saved topic
  const handleDeleteTopic = async () => {
    if (!savedTopicId) {
      return;
    }

    try {
      setIsDeleting(true);

      const success = TopicExplainerLocalStorageService.deleteTopic(savedTopicId);

      if (success) {
        toast({
          title: t("success"),
          description: t("topicDeletedDesc"),
        });

        router.push("/topic-explainer");
      } else {
        throw new Error("Failed to delete topic");
      }
    } catch {
      toast({
        title: tCommon("error"),
        description: t("topicDeleteError"),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-transparent dark:!bg-none p-8">
        <div className="max-w-4xl mx-auto">
          <BreakoutLoadingGame
            isLoading={true}
            loadingText={aiGenerating ? t("generatingAiContent") : t("loadingTopicData")}
            onGameComplete={() => {
              if (!isLoading && !aiGenerating) {
                // Game completed, but we're still loading
                // This is just for fun during loading
              }
            }}
          />
        </div>
      </div>
    );
  }

  // Error state
  if (!topicData || steps.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-transparent dark:!bg-none p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            {t("topicNotFound")}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t("topicNotFoundDesc", { topic })}
          </p>
          <Link href="/topic-explainer">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              {t("backToTopics")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentStepData = steps[currentStep] || null;

  // Safety check for currentStepData
  if (!currentStepData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-transparent dark:!bg-none p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            {t("stepNotFound")}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{t("stepNotFoundDesc")}</p>
          <Button
            onClick={() => setCurrentStep(0)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
          >
            {t("restart")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-transparent dark:!bg-none">
      <div className="container mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <Link href="/topic-explainer">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("backToTopics")}
              </Button>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t("aiExplainerTitle", { topic })}
            </h1>
            <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              {subject}
            </Badge>
            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              🤖 {t("aiTutorBadge")}
            </Badge>
            <Link href="/breakout-game">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-green-600 hover:to-emerald-600 hover:text-white hover:border-0"
              >
                🎮 {t("breakoutGame")}
              </Button>
            </Link>
            {currentStepData.confidence && (
              <Badge variant="outline" className="text-xs">
                {t("aiConfidence", {
                  percent: Math.round(currentStepData.confidence * 100),
                })}
              </Badge>
            )}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  void handleSaveTopic();
                }}
                disabled={isSaving || !topicData}
                size="sm"
                variant="outline"
                className="hover:bg-gradient-to-r hover:from-green-600 hover:to-emerald-600 hover:text-white"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {t("save")}
              </Button>
              {savedTopicId && (
                <Button
                  onClick={() => {
                    void handleDeleteTopic();
                  }}
                  disabled={isDeleting}
                  size="sm"
                  variant="outline"
                  className="hover:bg-gradient-to-r hover:from-red-600 hover:to-pink-600 hover:text-white"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  {t("delete")}
                </Button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("progress", { current: currentStep + 1, total: steps.length })}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t("progressComplete", { percent: Math.round(progress) })}
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <Button
              onClick={togglePlayPause}
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span className="hidden sm:inline">{isPlaying ? t("pause") : t("autoPlay")}</span>
            </Button>

            <Button
              onClick={handleRestart}
              variant="outline"
              size="sm"
              className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white"
              title={t("restart")}
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">{t("restart")}</span>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="shadow-xl border-gradient-question">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
                            {currentStepData.title}
                            {generatingStepId === currentStepData.id && (
                              <span className="ml-2 text-sm font-normal text-blue-100">
                                (generating...)
                              </span>
                            )}
                          </CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void regenerateStep(currentStep)}
                            disabled={Boolean(generatingStepId)}
                            className="h-7 px-2 text-xs"
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            {t("regenerate")}
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant={
                              currentStepData.difficulty === "easy"
                                ? "default"
                                : currentStepData.difficulty === "medium"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {getDifficultyLabel(currentStepData.difficulty)}
                          </Badge>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {t("minutesApprox", { time: currentStepData.estimatedTime })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Per-step lazy loading state */}
                    {(generatingStepId === currentStepData.id ||
                      !isStepGenerated(currentStepData)) &&
                    !currentStepData.content ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                          {t("generatingAiContent")}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          {t("loadingOnDemand")}
                        </p>
                        {generatingStepId !== currentStepData.id && (
                          <Button
                            onClick={() => void ensureStepIsGenerated(currentStep)}
                            className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                            size="sm"
                          >
                            {t("generateNow")}
                          </Button>
                        )}
                      </div>
                    ) : (
                      <>
                        {/* Voice Player */}
                        <div className="mb-6">
                          <VoicePlayer
                            text={currentStepData.content}
                            autoPlay={false}
                            speed={1}
                            language={voiceLanguage}
                            showControls={true}
                            className="mb-4"
                            onPlay={() => {
                              toast({
                                title: t("voiceStarted"),
                                description: t("voiceStartedDesc", {
                                  title: currentStepData.title,
                                }),
                              });
                            }}
                            onEnd={() => {
                              toast({
                                title: t("voiceCompleted"),
                                description: t("voiceCompletedDesc"),
                              });
                            }}
                          />
                        </div>

                        {/* Main Content */}
                        <div className="prose dark:prose-invert max-w-none">
                          <div className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeHighlight]}
                              components={{
                                h1: ({ children }) => (
                                  <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                                    {children}
                                  </h1>
                                ),
                                h2: ({ children }) => (
                                  <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                                    {children}
                                  </h2>
                                ),
                                h3: ({ children }) => (
                                  <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
                                    {children}
                                  </h3>
                                ),
                                p: ({ children }) => (
                                  <p className="mb-4 text-gray-700 dark:text-gray-300">
                                    {children}
                                  </p>
                                ),
                                ul: ({ children }) => (
                                  <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700 dark:text-gray-300">
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-700 dark:text-gray-300">
                                    {children}
                                  </ol>
                                ),
                                li: ({ children }) => (
                                  <li className="text-gray-700 dark:text-gray-300">{children}</li>
                                ),
                                code: ({ children, className }) => {
                                  const isInline = !className;
                                  if (isInline) {
                                    return (
                                      <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono text-gray-800 dark:text-gray-200">
                                        {children}
                                      </code>
                                    );
                                  }
                                  return (
                                    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto mb-4">
                                      <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
                                        {children}
                                      </code>
                                    </pre>
                                  );
                                },
                                blockquote: ({ children }) => (
                                  <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-400 mb-4">
                                    {children}
                                  </blockquote>
                                ),
                                strong: ({ children }) => (
                                  <strong className="font-semibold text-gray-800 dark:text-white">
                                    {children}
                                  </strong>
                                ),
                                em: ({ children }) => (
                                  <em className="italic text-gray-600 dark:text-gray-400">
                                    {children}
                                  </em>
                                ),
                              }}
                            >
                              {currentStepData.content}
                            </ReactMarkdown>
                          </div>
                        </div>

                        {/* Examples */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                            <Target className="w-5 h-5 text-green-600" />
                            {t("examples")}
                          </h3>
                          <div className="grid gap-3">
                            {currentStepData.examples.map((example, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-green-600 dark:text-green-400">
                                      {index + 1}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <ReactMarkdown
                                      remarkPlugins={[remarkGfm]}
                                      rehypePlugins={[rehypeHighlight]}
                                      components={{
                                        h1: ({ children }) => (
                                          <h1 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">
                                            {children}
                                          </h1>
                                        ),
                                        h2: ({ children }) => (
                                          <h2 className="text-base font-semibold mb-2 text-gray-800 dark:text-white">
                                            {children}
                                          </h2>
                                        ),
                                        h3: ({ children }) => (
                                          <h3 className="text-sm font-semibold mb-1 text-gray-800 dark:text-white">
                                            {children}
                                          </h3>
                                        ),
                                        p: ({ children }) => (
                                          <p className="mb-2 text-gray-700 dark:text-gray-300">
                                            {children}
                                          </p>
                                        ),
                                        ul: ({ children }) => (
                                          <ul className="list-disc list-inside mb-2 space-y-1 text-gray-700 dark:text-gray-300">
                                            {children}
                                          </ul>
                                        ),
                                        ol: ({ children }) => (
                                          <ol className="list-decimal list-inside mb-2 space-y-1 text-gray-700 dark:text-gray-300">
                                            {children}
                                          </ol>
                                        ),
                                        li: ({ children }) => (
                                          <li className="text-gray-700 dark:text-gray-300">
                                            {children}
                                          </li>
                                        ),
                                        code: ({ children, className }) => {
                                          const isInline = !className;
                                          if (isInline) {
                                            return (
                                              <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono text-gray-800 dark:text-gray-200">
                                                {children}
                                              </code>
                                            );
                                          }
                                          return (
                                            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto mb-2">
                                              <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
                                                {children}
                                              </code>
                                            </pre>
                                          );
                                        },
                                        blockquote: ({ children }) => (
                                          <blockquote className="border-l-4 border-green-500 pl-3 italic text-gray-600 dark:text-gray-400 mb-2">
                                            {children}
                                          </blockquote>
                                        ),
                                        strong: ({ children }) => (
                                          <strong className="font-semibold text-gray-800 dark:text-white">
                                            {children}
                                          </strong>
                                        ),
                                        em: ({ children }) => (
                                          <em className="italic text-gray-600 dark:text-gray-400">
                                            {children}
                                          </em>
                                        ),
                                      }}
                                    >
                                      {example}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        {/* Tips */}
                        {showTips && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-700"
                          >
                            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 flex items-center gap-2 mb-4">
                              <Lightbulb className="w-5 h-5" />
                              {t("aiLearningTips")}
                            </h3>
                            <div className="space-y-3">
                              {currentStepData.tips.map((tip, index) => (
                                <div key={index} className="flex items-start gap-3">
                                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <div className="flex-1">
                                    <ReactMarkdown
                                      remarkPlugins={[remarkGfm]}
                                      rehypePlugins={[rehypeHighlight]}
                                      components={{
                                        h1: ({ children }) => (
                                          <h1 className="text-base font-bold mb-1 text-yellow-800 dark:text-yellow-300">
                                            {children}
                                          </h1>
                                        ),
                                        h2: ({ children }) => (
                                          <h2 className="text-sm font-semibold mb-1 text-yellow-800 dark:text-yellow-300">
                                            {children}
                                          </h2>
                                        ),
                                        h3: ({ children }) => (
                                          <h3 className="text-xs font-semibold mb-1 text-yellow-800 dark:text-yellow-300">
                                            {children}
                                          </h3>
                                        ),
                                        p: ({ children }) => (
                                          <p className="mb-1 text-yellow-700 dark:text-yellow-300">
                                            {children}
                                          </p>
                                        ),
                                        ul: ({ children }) => (
                                          <ul className="list-disc list-inside mb-1 space-y-1 text-yellow-700 dark:text-yellow-300">
                                            {children}
                                          </ul>
                                        ),
                                        ol: ({ children }) => (
                                          <ol className="list-decimal list-inside mb-1 space-y-1 text-yellow-700 dark:text-yellow-300">
                                            {children}
                                          </ol>
                                        ),
                                        li: ({ children }) => (
                                          <li className="text-yellow-700 dark:text-yellow-300">
                                            {children}
                                          </li>
                                        ),
                                        code: ({ children, className }) => {
                                          const isInline = !className;
                                          if (isInline) {
                                            return (
                                              <code className="bg-yellow-100 dark:bg-yellow-900 px-1 py-0.5 rounded text-sm font-mono text-yellow-800 dark:text-yellow-300">
                                                {children}
                                              </code>
                                            );
                                          }
                                          return (
                                            <pre className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-lg overflow-x-auto mb-1">
                                              <code className="text-sm font-mono text-yellow-800 dark:text-yellow-300">
                                                {children}
                                              </code>
                                            </pre>
                                          );
                                        },
                                        blockquote: ({ children }) => (
                                          <blockquote className="border-l-4 border-yellow-500 pl-2 italic text-yellow-600 dark:text-yellow-400 mb-1">
                                            {children}
                                          </blockquote>
                                        ),
                                        strong: ({ children }) => (
                                          <strong className="font-semibold text-yellow-800 dark:text-yellow-300">
                                            {children}
                                          </strong>
                                        ),
                                        em: ({ children }) => (
                                          <em className="italic text-yellow-600 dark:text-yellow-400">
                                            {children}
                                          </em>
                                        ),
                                      }}
                                    >
                                      {tip}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8">
              <Button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                variant="outline"
                className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("previous")}
              </Button>

              <Button
                onClick={handleNext}
                disabled={currentStep === steps.length - 1 || Boolean(generatingStepId)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              >
                {generatingStepId ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("generating") || "Generating..."}
                  </>
                ) : (
                  <>
                    {t("next")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Steps Overview */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">
                      {t("topicSteps")}
                    </CardTitle>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t("learningPathExplanation")}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      for (let i = 0; i < steps.length; i++) {
                        if (!isStepGenerated(steps[i])) {
                          await ensureStepIsGenerated(i);
                        }
                      }
                    }}
                    disabled={Boolean(generatingStepId)}
                    className="text-xs"
                  >
                    {t("generateAll")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => goToStep(index)}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        index === currentStep
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                          : completedSteps?.has(step.id)
                            ? "bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-700"
                            : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === currentStep
                              ? "bg-white text-blue-600"
                              : completedSteps?.has(step.id)
                                ? "bg-green-500 text-white"
                                : "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {generatingStepId === step.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : completedSteps?.has(step.id) ? (
                            "✓"
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className="flex-1">
                          <h4
                            className={`font-medium ${
                              index === currentStep ? "text-white" : "text-gray-800 dark:text-white"
                            }`}
                          >
                            {step.title}
                            {!isStepGenerated(step) && generatingStepId !== step.id && (
                              <span className="ml-1 text-[10px] opacity-70">⚡</span>
                            )}
                          </h4>
                          <p
                            className={`text-xs ${
                              index === currentStep
                                ? "text-blue-100"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {t("minutes", { time: step.estimatedTime })}
                            {!isStepGenerated(step) && " • on demand"}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            void regenerateStep(index);
                          }}
                          disabled={Boolean(generatingStepId)}
                          className="h-6 px-1 text-[10px] opacity-70 hover:opacity-100"
                        >
                          <RotateCcw className="w-3 h-3 mr-0.5" />
                          {t("regenerate")}
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">
                  {t("myNotes")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder={t("notesPlaceholder")}
                  className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                />
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {t("notesAutoSave")}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">
                  {t("quickActions")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => setShowTips(!showTips)}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  {showTips ? t("hideTips") : t("showTips")}
                </Button>
                <Button
                  onClick={() => {
                    toast({
                      title: t("voiceNarration"),
                      description: t("voiceControlsDesc"),
                    });
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Volume className="w-4 h-4 mr-2" />
                  {t("voiceControls")}
                </Button>
                <Button
                  onClick={handleRestart}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t("restart")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reusable AI Floating Chat - accesses current topic data */}
        <AIFloatingChat
          subject={subject}
          topicData={topicData}
          currentStepTitle={currentStepData?.title}
        />
      </div>
    </div>
  );
};

export default TopicExplainer;
