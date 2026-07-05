"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Plus,
  Brain,
  Sparkles,
  Loader2,
  Target,
  Zap,
  CheckCircle,
  BookOpen,
  Edit,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { shouldUseDemoData, getDemoSubjects } from "@/data/demo-data";
import { generateFlashcards, type FlashcardGenerationOutput } from "@/ai/flows/flashcard-generation";
import { getStoredAiPreferences, isAiConfigured } from "@/lib/ai-preferences";
import { UnifiedStorageService, type Flashcard } from "@/services/unified-storage-service";
import { SubjectService } from "@/services/supabase-service";
import { supabase } from "@/lib/supabase";
import { errorLogger } from "@/lib/error-logger";
// Local interface for the data structure actually used in this component
interface LocalSubject {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  isActive: boolean;
}

export default function FlashcardManagerPage() {
  const locale = useLocale();
  const t = useTranslations("FlashcardManager");
  const tSubjects = useTranslations("Subjects");
  const tCommon = useTranslations("Common");
  const { toast } = useToast();

  const getSubjectName = (name: string) => {
    try {
      return tSubjects(name as any);
    } catch {
      return name;
    }
  };
  const dateLocale = locale === "tr" ? "tr-TR" : "en-US";

  const getDifficultyLabel = useCallback(
    (difficulty: string) => {
      const map: Record<string, string> = {
        Easy: t("difficultyEasy"),
        Medium: t("difficultyMedium"),
        Hard: t("difficultyHard"),
        Kolay: t("difficultyEasy"),
        Orta: t("difficultyMedium"),
        Zor: t("difficultyHard"),
      };
      return map[difficulty] ?? difficulty;
    },
    [t],
  );
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [subjects, setSubjects] = useState<LocalSubject[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Manual flashcard form state
  const [manualForm, setManualForm] = useState({
    subject: "",
    topic: "",
    question: "",
    answer: "",
    explanation: "",
    difficulty: "Medium",
  });

  // AI flashcard generation state
  const [aiForm, setAiForm] = useState({
    subject: "",
    topic: "",
    difficulty: "Medium",
    count: 5,
    guidelines: "",
  });

  // Generated flashcards
  const [generatedFlashcards, setGeneratedFlashcards] = useState<Flashcard[]>([]);
  const [aiMetadata, setAiMetadata] = useState<FlashcardGenerationOutput['metadata'] | null>(null);
  const [qualityScore, setQualityScore] = useState<number>(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [studyTips, setStudyTips] = useState<string[]>([]);

  // Existing flashcards management
  const [existingFlashcards, setExistingFlashcards] = useState<Flashcard[]>([]);
  const [selectedSubjectForManage, setSelectedSubjectForManage] = useState<string>("");
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("manage");

  // Delete confirmation state
  const [flashcardToDelete, setFlashcardToDelete] = useState<Flashcard | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(Boolean(session?.user));
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setLoading(true);
        const demoMode = shouldUseDemoData();
        setIsDemoMode(demoMode);

        if (demoMode) {
          // Demo subjects
          const localizedDemoSubjects = getDemoSubjects(locale);
          const demoSubjects: LocalSubject[] = localizedDemoSubjects.map((demoSubject: any) => ({
            id: demoSubject.id,
            name: demoSubject.name,
            category: demoSubject.category,
            difficulty: demoSubject.difficulty,
            isActive: demoSubject.isActive,
          }));
          setSubjects(demoSubjects);
        } else {
          let loadedSubjects: LocalSubject[] = [];

          if (isAuthenticated) {
            try {
              // Try loading from Supabase first
              const dbSubjects = await SubjectService.getSubjects();

              if (dbSubjects && dbSubjects.length > 0) {
                loadedSubjects = dbSubjects.map(subject => ({
                  id: subject.id,
                  name: subject.name,
                  category: subject.category,
                  difficulty: subject.difficulty,
                  isActive: subject.is_active,
                }));
                // Successfully loaded from Supabase
              } else {
                // Fallback to localStorage
                loadedSubjects = UnifiedStorageService.getSubjects();
                // Silent fallback - no need to log as error
              }
            } catch {
              // Fallback to localStorage on error
              loadedSubjects = UnifiedStorageService.getSubjects();
              // Supabase failed, using localStorage fallback
            }
          } else {
            // Not authenticated, use localStorage
            loadedSubjects = UnifiedStorageService.getSubjects();
            // Silent fallback - no need to log as error
          }

          // Only show active subjects
          const activeSubjects = loadedSubjects.filter((s: LocalSubject) => s.isActive);
          setSubjects(activeSubjects);
        }
      } catch {
        //do nothing
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Load existing flashcards when subject changes
  useEffect(() => {
    const loadFlashcards = async () => {
      if (selectedSubjectForManage) {
        setLoading(true);
        try {
          // Small delay to show loading state
          await new Promise(resolve => setTimeout(resolve, 100));

          const flashcards = UnifiedStorageService.getFlashcardsBySubject(selectedSubjectForManage);
          // Ensure createdAt is a Date object
          const processedFlashcards = flashcards.map(flashcard => ({
            ...flashcard,
            createdAt: flashcard.createdAt instanceof Date ? flashcard.createdAt : new Date(flashcard.createdAt),
          }));
          setExistingFlashcards(processedFlashcards);
        } catch (error) {
          errorLogger.logError('Error loading flashcards', error, { subject: selectedSubjectForManage });
        } finally {
          setLoading(false);
        }
      } else {
        setExistingFlashcards([]);
      }
    };

    loadFlashcards();
  }, [selectedSubjectForManage]);

  // Flashcard management functions
  const handleEditFlashcard = (flashcard: Flashcard) => {
    setEditingFlashcard(flashcard);
    setManualForm({
      subject: flashcard.subject,
      topic: flashcard.topic,
      question: flashcard.question,
      answer: flashcard.answer,
      explanation: flashcard.explanation,
      difficulty: flashcard.difficulty,
    });
    setIsEditing(true);

    // Automatically switch to the manual tab for editing
    setActiveTab("manual");
  };

  const handleDeleteFlashcard = (id: string) => {
    const flashcard = existingFlashcards.find(f => f.id === id);
    if (flashcard) {
      setFlashcardToDelete(flashcard);
      setShowDeleteDialog(true);
    }
  };

  const confirmDeleteFlashcard = async () => {
    if (!flashcardToDelete) {
      return;
    }

    try {
      const success = UnifiedStorageService.deleteFlashcard(flashcardToDelete.id);
      if (success) {
        // Reload flashcards efficiently
        if (selectedSubjectForManage) {
          const flashcards = UnifiedStorageService.getFlashcardsBySubject(selectedSubjectForManage);
          const processedFlashcards = flashcards.map(flashcard => ({
            ...flashcard,
            createdAt: flashcard.createdAt instanceof Date ? flashcard.createdAt : new Date(flashcard.createdAt),
          }));
          setExistingFlashcards(processedFlashcards);
        }
        toast({
          title: t("success"),
          description: t("deletedDesc"),
          variant: "default",
        });
      } else {
        toast({
          title: tCommon("error"),
          description: t("deleteError"),
          variant: "destructive",
        });
      }
    } catch (error) {
      errorLogger.logError('Error confirming flashcard deletion', error, { flashcardId: flashcardToDelete?.id });
      toast({
        title: tCommon("error"),
        description: t("deleteError"),
        variant: "destructive",
      });
    }

    setShowDeleteDialog(false);
    setFlashcardToDelete(null);
  };

  const handleUpdateFlashcard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFlashcard) {
      return;
    }

    try {
      const success = UnifiedStorageService.updateFlashcard(editingFlashcard.id, {
        question: manualForm.question,
        answer: manualForm.answer,
        explanation: manualForm.explanation,
        topic: manualForm.topic,
        difficulty: manualForm.difficulty,
        subject: manualForm.subject,
      });

      if (success) {
        // Reload flashcards efficiently
        if (selectedSubjectForManage) {
          const flashcards = UnifiedStorageService.getFlashcardsBySubject(selectedSubjectForManage);
          const processedFlashcards = flashcards.map(flashcard => ({
            ...flashcard,
            createdAt: flashcard.createdAt instanceof Date ? flashcard.createdAt : new Date(flashcard.createdAt),
          }));
          setExistingFlashcards(processedFlashcards);
        }

        // Reset form
        setManualForm({
          subject: "",
          topic: "",
          question: "",
          answer: "",
          explanation: "",
          difficulty: "Medium",
        });
        setEditingFlashcard(null);
        setIsEditing(false);
        setActiveTab("manage");

        toast({
          title: t("success"),
          description: t("updatedDesc"),
          variant: "default",
        });
      } else {
        toast({
          title: tCommon("error"),
          description: t("updateError"),
          variant: "destructive",
        });
      }
    } catch (error) {
      errorLogger.logError('Error updating flashcard', error, { flashcardId: editingFlashcard?.id });
      toast({
        title: tCommon("error"),
        description: t("updateError"),
        variant: "destructive",
      });
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!manualForm.subject || !manualForm.topic || !manualForm.question || !manualForm.answer) {
      toast({
        title: t("missingInfo"),
        description: t("fillRequiredFields"),
        variant: "destructive",
      });
      return;
    }

    // Handle editing existing flashcard
    if (isEditing && editingFlashcard) {
      await handleUpdateFlashcard(e);
      return;
    }

    try {
      const newFlashcard: Omit<Flashcard, "id"> = {
        subject: manualForm.subject,
        topic: manualForm.topic,
        question: manualForm.question,
        answer: manualForm.answer,
        explanation: manualForm.explanation,
        difficulty: manualForm.difficulty,
        createdAt: new Date(),
      };

      errorLogger.logError("Creating flashcard", undefined, { flashcard: newFlashcard });

      // Use UnifiedStorageService which handles both localStorage and Supabase sync
      const createdFlashcard = await UnifiedStorageService.addFlashcard(newFlashcard);
      errorLogger.logError("Flashcard created successfully", undefined, { id: createdFlashcard.id });

      // Reset form
      setManualForm({
        subject: "",
        topic: "",
        question: "",
        answer: "",
        explanation: "",
        difficulty: "Medium",
      });

      // Show success message with authentication context
      if (isAuthenticated) {
        toast({
          title: t("successExclaim"),
          description: t("addedSyncedDesc"),
          variant: "default",
        });
      } else {
        toast({
          title: t("successExclaim"),
          description: t("addedLocalDesc"),
          variant: "default",
        });
      }

      // Reload existing flashcards if we're on the manage tab
      if (selectedSubjectForManage === manualForm.subject) {
        const flashcards = UnifiedStorageService.getFlashcardsBySubject(manualForm.subject);
        const processedFlashcards = flashcards.map(flashcard => ({
          ...flashcard,
          createdAt: flashcard.createdAt instanceof Date ? flashcard.createdAt : new Date(flashcard.createdAt),
        }));
        setExistingFlashcards(processedFlashcards);
      }

    } catch (error) {
      errorLogger.logError("Error creating flashcard", error);

      // Show specific error message
      const errorMessage = error instanceof Error ? error.message : t("unknownError");
      toast({
        title: tCommon("error"),
        description: t("addError", { message: errorMessage }),
        variant: "destructive",
      });
    }
  };

  const handleAIGeneration = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!aiForm.subject || !aiForm.topic) {
      toast({
        title: t("missingInfo"),
        description: t("selectSubjectAndTopic"),
        variant: "destructive",
      });
      return;
    }

    try {
      setAiGenerating(true);

      toast({
        title: t("aiGeneratingToast"),
        description: t("aiGeneratingToastDesc", { count: aiForm.count }),
        variant: "default",
      });

      const aiPrefs = getStoredAiPreferences();
      if (!isAiConfigured(aiPrefs)) {
        toast({
          title: t("aiError"),
          description: t("aiApiKeyError") || "AI service configuration error. Please check your API key in Settings.",
          variant: "destructive",
        });
        setAiGenerating(false);
        return;
      }

      const aiResponse = await generateFlashcards({
        subject: aiForm.subject,
        topic: aiForm.topic,
        difficulty: aiForm.difficulty as "Easy" | "Medium" | "Hard",
        count: aiForm.count,
        language: locale === "tr" ? "tr" : "en",
        guidelines: aiForm.guidelines || undefined,
      }, aiPrefs);

      // Convert AI response to Flashcard format
      const convertedFlashcards: Flashcard[] = aiResponse.flashcards.map((aiCard, i) => ({
        id: `ai_flashcard_${Date.now()}_${i}`,
        subject: aiForm.subject,
        topic: aiCard.topic,
        difficulty: aiCard.difficulty,
        question: aiCard.question,
        answer: aiCard.answer,
        explanation: aiCard.explanation,
        createdAt: new Date(),
      }));

      setGeneratedFlashcards(convertedFlashcards);
      setAiMetadata(aiResponse.metadata);
      setQualityScore(aiResponse.qualityScore);
      setSuggestions(aiResponse.suggestions);
      setStudyTips(aiResponse.studyTips);

      // Check if we got fallback flashcards due to AI errors
      if (aiResponse.metadata.aiModel.includes("Fallback") || aiResponse.metadata.aiModel.includes("Error")) {
        toast({
          title: t("aiFallbackTitle"),
          description: t("aiFallbackDesc"),
          variant: "destructive",
        });
      } else {
        toast({
          title: t("aiCompleteTitle"),
          description: t("aiCompleteDesc", {
            count: aiForm.count,
            percent: Math.round(aiResponse.qualityScore * 100),
          }),
          variant: "default",
        });
      }

    } catch (error) {
      let errorMessage = t("aiGenerateError");

      if (error instanceof Error) {
        if (
          error.message.toLowerCase().includes("api key") ||
          error.message.includes("not configured")
        ) {
          errorMessage = t("aiApiKeyError");
        } else if (error.message.includes("Failed to generate")) {
          errorMessage = t("aiNetworkError");
        }
      }

      toast({
        title: t("aiError"),
        description: errorMessage,
        variant: "destructive",
      });

      const fallbackFlashcards: Flashcard[] = [];
      for (let i = 0; i < aiForm.count; i++) {
        fallbackFlashcards.push({
          id: `fallback_${Date.now()}_${i}`,
          subject: aiForm.subject,
          topic: aiForm.topic,
          difficulty: aiForm.difficulty,
          question: t("fallbackQuestion", { index: i + 1 }),
          answer: t("fallbackAnswer"),
          explanation: t("fallbackExplanation"),
          createdAt: new Date(),
        });
      }

      setGeneratedFlashcards(fallbackFlashcards);
      setAiMetadata({
        totalGenerated: fallbackFlashcards.length,
        subject: aiForm.subject,
        topic: aiForm.topic,
        averageDifficulty: aiForm.difficulty,
        generationTimestamp: new Date().toISOString(),
        aiModel: "Fallback - AI Error",
      });
      setQualityScore(0.1);
      setSuggestions([t("fallbackSuggestion")]);
      setStudyTips([t("fallbackStudyTip")]);
    } finally {
      setAiGenerating(false);
    }
  };

  const saveGeneratedFlashcards = async () => {
    try {
      errorLogger.logError("Saving AI generated flashcards", undefined, { count: generatedFlashcards.length });

      // Save all generated flashcards with proper error handling
      const results = await Promise.allSettled(
        generatedFlashcards.map(async (flashcard) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id: _, ...flashcardData } = flashcard;
          return UnifiedStorageService.addFlashcard(flashcardData);
        }),
      );

      // Count successful and failed saves
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      errorLogger.logError("Save results", undefined, { successful, failed, total: generatedFlashcards.length });

      // Clear generated flashcards after saving
      setGeneratedFlashcards([]);

      // Show appropriate success message
      if (failed === 0) {
        if (isAuthenticated) {
          toast({
            title: t("successExclaim"),
            description: t("savedAllSyncedDesc", { count: successful }),
            variant: "default",
          });
        } else {
          toast({
            title: t("successExclaim"),
            description: t("savedAllLocalDesc", { count: successful }),
            variant: "default",
          });
        }
      } else {
        toast({
          title: t("partialSuccess"),
          description: t("partialSuccessDesc", { successful, failed }),
          variant: "destructive",
        });
      }

      // Reload existing flashcards for the current subject
      if (selectedSubjectForManage) {
        const flashcards = UnifiedStorageService.getFlashcardsBySubject(selectedSubjectForManage);
        const processedFlashcards = flashcards.map(flashcard => ({
          ...flashcard,
          createdAt: flashcard.createdAt instanceof Date ? flashcard.createdAt : new Date(flashcard.createdAt),
        }));
        setExistingFlashcards(processedFlashcards);
      }

    } catch (error) {
      errorLogger.logError("Error saving generated flashcards", error);

      const errorMessage = error instanceof Error ? error.message : t("unknownError");
      toast({
        title: tCommon("error"),
        description: t("saveError", { message: errorMessage }),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-transparent dark:!bg-none p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/flashcard">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("backToFlashcard")}
            </Button>
          </Link>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              {t("title")}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t("subtitle")}
            </p>
            {isDemoMode && (
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white mt-2">
                {t("demoMode")}
              </Badge>
            )}
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 max-w-2xl mx-auto gap-2 sm:gap-0 h-auto sm:h-10 p-2 sm:p-1">
            <TabsTrigger
              value="manage"
              className="flex items-center justify-center gap-2 text-sm sm:text-base h-10 sm:h-auto w-full"
            >
              <BookOpen className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">{t("tabManage")}</span>
              <span className="sm:hidden">{t("tabManageShort")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="manual"
              className="flex items-center justify-center gap-2 text-sm sm:text-base h-10 sm:h-auto w-full"
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">{t("tabManual")}</span>
              <span className="sm:hidden">{t("tabManualShort")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="ai"
              className="flex items-center justify-center gap-2 text-sm sm:text-base h-10 sm:h-auto w-full"
            >
              <Brain className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">{t("tabAi")}</span>
              <span className="sm:hidden">{t("tabAiShort")}</span>
            </TabsTrigger>
          </TabsList>

          {/* Manage Existing Flashcards */}
          <TabsContent value="manage">
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {t("manageTitle")}
                </CardTitle>
                <CardDescription>
                  {t("manageDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Subject Selector */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t("selectSubject")}</label>
                    {loading ? (
                      <div className="flex items-center gap-2 p-3 border rounded-md bg-gray-50 dark:bg-gray-900">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{t("loadingSubjects")}</span>
                      </div>
                    ) : (
                      <Select
                        value={selectedSubjectForManage}
                        onValueChange={setSelectedSubjectForManage}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("selectSubjectPlaceholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.name}>
                              {getSubjectName(subject.name)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Flashcards List */}
                  {selectedSubjectForManage && (
                    <div className="space-y-3">
                      {isEditing && editingFlashcard && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Edit className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                {t("editingFlashcard", { question: editingFlashcard.question.substring(0, 50) })}
                              </span>
                            </div>
                            <Button
                              onClick={() => {
                                setIsEditing(false);
                                setEditingFlashcard(null);
                                setActiveTab("manage");
                                setManualForm({
                                  subject: "",
                                  topic: "",
                                  question: "",
                                  answer: "",
                                  explanation: "",
                                  difficulty: "Medium",
                                });
                              }}
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-300 hover:bg-blue-100"
                            >
                              {t("cancelEdit")}
                            </Button>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">
                          {t("subjectFlashcardCount", { subject: selectedSubjectForManage, count: existingFlashcards.length })}
                        </h3>
                        <Button
                          onClick={() => {
                            setSelectedSubjectForManage("");
                            setExistingFlashcards([]);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          {t("clear")}
                        </Button>
                      </div>

                      {loading ? (
                        <div className="text-center py-8 text-gray-500">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                          <p>{t("loadingFlashcards")}</p>
                        </div>
                      ) : existingFlashcards.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          {t("noFlashcardsForSubject")}
                        </div>
                      ) : (
                        <div className="grid gap-3 sm:gap-4">
                          {existingFlashcards.map((flashcard) => (
                            <Card key={flashcard.id} className="border-l-4 border-l-blue-500">
                              <CardContent className="p-3 sm:p-4">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                                  <div className="flex-1 space-y-2 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <Badge variant="outline" className="text-xs px-2 py-1">
                                        {flashcard.topic}
                                      </Badge>
                                      <Badge variant="secondary" className="text-xs px-2 py-1">
                                        {getDifficultyLabel(flashcard.difficulty)}
                                      </Badge>
                                      <span className="text-xs text-gray-500 whitespace-nowrap">
                                        {flashcard.createdAt instanceof Date
                                          ? flashcard.createdAt.toLocaleDateString(dateLocale)
                                          : new Date(flashcard.createdAt).toLocaleDateString(dateLocale)
                                        }
                                      </span>
                                    </div>
                                    <h4 className="font-medium text-sm sm:text-base leading-relaxed break-words">
                                      {flashcard.question}
                                    </h4>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed break-words">
                                      {flashcard.answer}
                                    </p>
                                    {flashcard.explanation && (
                                      <p className="text-xs text-gray-500 leading-relaxed break-words">
                                        {flashcard.explanation}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex gap-2 sm:flex-col sm:gap-1 sm:ml-0 self-end sm:self-start">
                                    <Button
                                      onClick={() => handleEditFlashcard(flashcard)}
                                      variant="outline"
                                      size="sm"
                                      className="h-8 w-8 sm:h-7 sm:w-7 p-0 flex-shrink-0"
                                    >
                                      <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </Button>
                                    <Button
                                      onClick={() => handleDeleteFlashcard(flashcard.id)}
                                      variant="outline"
                                      size="sm"
                                      className="h-8 w-8 sm:h-7 sm:w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                    >
                                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manual Flashcard Creation */}
          <TabsContent value="manual">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  {isEditing ? t("editTitle") : t("manualTitle")}
                </CardTitle>
                <CardDescription>
                  {isEditing ? t("editDescription") : t("manualDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { handleManualSubmit(e); }} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">{t("subjectLabel")}</label>
                      <Select
                        value={manualForm.subject}
                        onValueChange={(value) => setManualForm(prev => ({ ...prev, subject: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("selectSubjectOption")} />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.name}>
                              {getSubjectName(subject.name)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">{t("difficultyLabel")}</label>
                      <Select
                        value={manualForm.difficulty}
                        onValueChange={(value) => setManualForm(prev => ({ ...prev, difficulty: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Easy">{t("difficultyEasy")}</SelectItem>
                          <SelectItem value="Medium">{t("difficultyMedium")}</SelectItem>
                          <SelectItem value="Hard">{t("difficultyHard")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">{t("topicLabel")}</label>
                    <Input
                      placeholder={t("topicPlaceholder")}
                      value={manualForm.topic}
                      onChange={(e) => setManualForm(prev => ({ ...prev, topic: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">{t("questionLabel")}</label>
                    <Textarea
                      placeholder={t("questionPlaceholder")}
                      value={manualForm.question}
                      onChange={(e) => setManualForm(prev => ({ ...prev, question: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">{t("answerLabel")}</label>
                    <Textarea
                      placeholder={t("answerPlaceholder")}
                      value={manualForm.answer}
                      onChange={(e) => setManualForm(prev => ({ ...prev, answer: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">{t("explanationLabel")}</label>
                    <Textarea
                      placeholder={t("explanationPlaceholder")}
                      value={manualForm.explanation}
                      onChange={(e) => setManualForm(prev => ({ ...prev, explanation: e.target.value }))}
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                      {isEditing ? (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          {t("update")}
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          {t("addFlashcard")}
                        </>
                      )}
                    </Button>
                    {isEditing && (
                      <Button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setEditingFlashcard(null);
                          setActiveTab("manage");
                          setManualForm({
                            subject: "",
                            topic: "",
                            question: "",
                            answer: "",
                            explanation: "",
                            difficulty: "Medium",
                          });
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        {t("cancel")}
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Flashcard Generation */}
          <TabsContent value="ai">
            <div className="space-y-6">
              {/* AI Generation Form */}
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    {t("aiTitle")}
                  </CardTitle>
                  <CardDescription>
                    {t("aiDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* AI Status Info */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                          {t("aiStatusTitle")}
                        </h4>
                        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                          <p>• {t("aiStatusGemini")}</p>
                          <p>• {t("aiStatusTurkish")}</p>
                          <p>• {t("aiStatusDynamic")}</p>
                          <p>• {t("aiStatusQuality")}</p>
                        </div>
                        <div className="mt-3 text-xs text-blue-600 dark:text-blue-400">
                          <p>{t("aiStatusNote")}</p>
                          <p>
                            {t("aiSetupGuidePrefix")}
                            <Link href="/ai-flashcard-setup" className="underline hover:text-blue-800">
                              {t("aiSetupGuideLink")}
                            </Link>
                            {t("aiSetupGuideSuffix")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={(e) => { handleAIGeneration(e); }} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">{t("subjectLabel")}</label>
                        <Select
                          value={aiForm.subject}
                          onValueChange={(value) => setAiForm(prev => ({ ...prev, subject: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t("selectSubjectOption")} />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.name}>
                                {getSubjectName(subject.name)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">{t("difficultyLabel")}</label>
                        <Select
                          value={aiForm.difficulty}
                          onValueChange={(value) => setAiForm(prev => ({ ...prev, difficulty: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Easy">{t("difficultyEasy")}</SelectItem>
                            <SelectItem value="Medium">{t("difficultyMedium")}</SelectItem>
                            <SelectItem value="Hard">{t("difficultyHard")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">{t("topicLabel")}</label>
                      <Input
                        placeholder={t("topicPlaceholder")}
                        value={aiForm.topic}
                        onChange={(e) => setAiForm(prev => ({ ...prev, topic: e.target.value }))}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">{t("cardCountLabel")}</label>
                        <Select
                          value={aiForm.count.toString()}
                          onValueChange={(value) => setAiForm(prev => ({ ...prev, count: parseInt(value) }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">{t("cards3")}</SelectItem>
                            <SelectItem value="5">{t("cards5")}</SelectItem>
                            <SelectItem value="10">{t("cards10")}</SelectItem>
                            <SelectItem value="15">{t("cards15")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">{t("guidelinesLabel")}</label>
                        <Input
                          placeholder={t("guidelinesPlaceholder")}
                          value={aiForm.guidelines}
                          onChange={(e) => setAiForm(prev => ({ ...prev, guidelines: e.target.value }))}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={aiGenerating}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0"
                    >
                      {aiGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t("aiGenerating")}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          {t("generateWithAi")}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

                             {/* Generated Flashcards Preview */}
               {generatedFlashcards.length > 0 && (
                 <Card className="max-w-4xl mx-auto">
                   <CardHeader>
                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                       <div className="flex-1 min-w-0">
                         <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                           <CheckCircle className="w-5 h-5 text-green-600" />
                           {t("generatedTitle", { count: generatedFlashcards.length })}
                         </CardTitle>
                         <CardDescription className="text-sm sm:text-base">
                           {t("generatedDescription")}
                         </CardDescription>
                       </div>
                       {aiMetadata && (
                         <div className="text-center sm:text-right">
                           <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white mb-2 text-xs sm:text-sm">
                             {t("quality", { percent: Math.round(qualityScore * 100) })}
                           </Badge>
                           <p className="text-xs text-gray-500">
                             {aiMetadata.aiModel} • {aiMetadata.generationTimestamp}
                           </p>
                         </div>
                       )}
                     </div>
                   </CardHeader>
                  <CardContent>
                    <div className="space-y-3 sm:space-y-4">
                      {generatedFlashcards.map((flashcard, index) => (
                        <div key={flashcard.id} className="border rounded-lg p-3 sm:p-4 bg-gray-50 dark:bg-gray-800">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 mb-3">
                            <Badge variant="outline" className="text-xs px-2 py-1 self-start">
                              {getDifficultyLabel(flashcard.difficulty)}
                            </Badge>
                            <span className="text-xs text-gray-500 self-end sm:self-start">#{index + 1}</span>
                          </div>

                          <div className="space-y-2 sm:space-y-3">
                            <div>
                              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">{t("questionField")}</label>
                              <p className="text-xs sm:text-sm text-gray-800 dark:text-white leading-relaxed break-words">{flashcard.question}</p>
                            </div>

                            <div>
                              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">{t("answerField")}</label>
                              <p className="text-xs sm:text-sm text-gray-800 dark:text-white leading-relaxed break-words">{flashcard.answer}</p>
                            </div>

                            {flashcard.explanation && (
                              <div>
                                <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">{t("explanationField")}</label>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed break-words">{flashcard.explanation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                                         {/* AI Insights */}
                     {(suggestions.length > 0 || studyTips.length > 0) && (
                       <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                         <h4 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                           <Brain className="w-4 h-4 text-purple-600" />
                           {t("aiInsightsTitle")}
                         </h4>

                         {suggestions.length > 0 && (
                           <div className="mb-4">
                             <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">💡 {t("improvementSuggestions")}</h5>
                             <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                               {suggestions.map((suggestion, index) => (
                                 <li key={index} className="flex items-start gap-2">
                                   <span className="text-purple-500">•</span>
                                   {suggestion}
                                 </li>
                               ))}
                             </ul>
                           </div>
                         )}

                         {studyTips.length > 0 && (
                           <div>
                             <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">📚 {t("studyTips")}</h5>
                             <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                               {studyTips.map((tip, index) => (
                                 <li key={index} className="flex items-start gap-2">
                                   <span className="text-green-500">•</span>
                                   {tip}
                                 </li>
                               ))}
                             </ul>
                           </div>
                         )}
                       </div>
                     )}

                     <div className="flex flex-col sm:flex-row gap-3 mt-6">
                       <Button
                         onClick={() => {
                           void saveGeneratedFlashcards();
                         }}
                         className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 text-sm sm:text-base py-2 sm:py-2.5"
                       >
                         <CheckCircle className="w-4 h-4 mr-2" />
                         {t("saveAll")}
                       </Button>

                       <Button
                         onClick={() => {
                           setGeneratedFlashcards([]);
                           setAiMetadata(null);
                           setQualityScore(0);
                           setSuggestions([]);
                           setStudyTips([]);
                         }}
                         variant="outline"
                         className="flex-1 text-sm sm:text-base py-2 sm:py-2.5"
                       >
                         {t("clear")}
                       </Button>
                     </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Features Section */}
        <div className="mt-12">
          <Card className="border-gradient-question bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-center text-xl">
                <Zap className="w-6 h-6 inline mr-2 text-yellow-500" />
                {t("featuresTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Plus className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                  <h3 className="font-semibold mb-2">{t("featureManualTitle")}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("featureManualDesc")}
                  </p>
                </div>

                <div className="text-center">
                  <Brain className="w-12 h-12 mx-auto mb-3 text-purple-600" />
                  <h3 className="font-semibold mb-2">{t("featureAiTitle")}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("featureAiDesc")}
                  </p>
                </div>

                <div className="text-center">
                  <Target className="w-12 h-12 mx-auto mb-3 text-green-600" />
                  <h3 className="font-semibold mb-2">{t("featureSmartTitle")}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("featureSmartDesc")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteDialogTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDialogDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteDialog(false);
              setFlashcardToDelete(null);
            }}>
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                void confirmDeleteFlashcard();
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
