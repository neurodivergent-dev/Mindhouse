"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSubjectName } from "@/lib/question-manager-labels";
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
  const tCommon = useTranslations("Common");
  const tSubjects = useTranslations("Subjects");
  const { toast } = useToast();

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
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-transparent dark:!bg-none">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/flashcard">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 flex items-center gap-2 text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("backToFlashcard")}
            </Button>
          </Link>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shrink-0">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-4xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {t("title")}
                </h1>
                {isDemoMode && (
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs px-2.5 py-0.5">
                    {t("demoMode")}
                  </Badge>
                )}
              </div>
              <p className="text-[#86868b] dark:text-[#a1a1a6] text-sm md:text-base font-medium mt-0.5">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 max-w-2xl mx-auto gap-2 sm:gap-0 h-auto sm:h-12 p-1.5 bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-2xl backdrop-blur-md">
            <TabsTrigger
              value="manage"
              className="flex items-center justify-center gap-2 text-sm sm:text-base h-10 w-full rounded-xl transition-all text-[#86868b] dark:text-[#a1a1a6] hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-blue-900 hover:border-0 dark:hover:from-blue-600 dark:hover:to-purple-600 dark:hover:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-100 data-[state=active]:to-purple-100 data-[state=active]:text-blue-900 dark:data-[state=active]:from-blue-600 dark:data-[state=active]:to-purple-600 dark:data-[state=active]:text-white"
            >
              <BookOpen className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">{t("tabManage")}</span>
              <span className="sm:hidden">{t("tabManageShort")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="manual"
              className="flex items-center justify-center gap-2 text-sm sm:text-base h-10 w-full rounded-xl transition-all text-[#86868b] dark:text-[#a1a1a6] hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-blue-900 hover:border-0 dark:hover:from-blue-600 dark:hover:to-purple-600 dark:hover:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-100 data-[state=active]:to-purple-100 data-[state=active]:text-blue-900 dark:data-[state=active]:from-blue-600 dark:data-[state=active]:to-purple-600 dark:data-[state=active]:text-white"
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">{t("tabManual")}</span>
              <span className="sm:hidden">{t("tabManualShort")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="ai"
              className="flex items-center justify-center gap-2 text-sm sm:text-base h-10 w-full rounded-xl transition-all text-[#86868b] dark:text-[#a1a1a6] hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-blue-900 hover:border-0 dark:hover:from-blue-600 dark:hover:to-purple-600 dark:hover:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-100 data-[state=active]:to-purple-100 data-[state=active]:text-blue-900 dark:data-[state=active]:from-blue-600 dark:data-[state=active]:to-purple-600 dark:data-[state=active]:text-white"
            >
              <Sparkles className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">{t("tabAi")}</span>
              <span className="sm:hidden">{t("tabAiShort")}</span>
            </TabsTrigger>
          </TabsList>

          {/* Manage Existing Flashcards */}
          <TabsContent value="manage">
            <div className="apple-glass-card max-w-4xl mx-auto">
              <div className="w-full relative z-10 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm shrink-0">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {t("manageTitle")}
                    </h2>
                    <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                      {t("manageDescription")}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Subject Selector */}
                  <div className="p-4 rounded-xl bg-white/20 dark:bg-white/5 border border-white/20 dark:border-white/10">
                    <label className="text-sm font-semibold mb-2 block text-[#1d1d1f] dark:text-[#f5f5f7]">{t("selectSubject")}</label>
                    {loading ? (
                      <div className="flex items-center gap-2 p-3 border border-white/20 dark:border-white/10 rounded-xl bg-white/40 dark:bg-white/5">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        <span className="text-sm text-[#86868b] dark:text-[#a1a1a6]">{t("loadingSubjects")}</span>
                      </div>
                    ) : (
                      <Select
                        value={selectedSubjectForManage}
                        onValueChange={setSelectedSubjectForManage}
                      >
                        <SelectTrigger className="bg-white/80 dark:bg-white/5 border-slate-200/90 dark:border-white/10 shadow-sm shadow-slate-200/60 rounded-xl backdrop-blur-sm h-12 text-sm font-medium">
                          <SelectValue placeholder={t("selectSubjectPlaceholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.name}>
                              {getSubjectName(subject.name, tSubjects)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Flashcards List */}
                  {selectedSubjectForManage && (
                    <div className="space-y-4">
                      {isEditing && editingFlashcard && (
                        <div className="bg-blue-500/10 dark:bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <Edit className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
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
                            className="text-blue-500 border-blue-500/20 hover:bg-blue-500/10 rounded-lg"
                          >
                            {t("cancelEdit")}
                          </Button>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                          {t("subjectFlashcardCount", { subject: selectedSubjectForManage, count: existingFlashcards.length })}
                        </h3>
                        <Button
                          onClick={() => {
                            setSelectedSubjectForManage("");
                            setExistingFlashcards([]);
                          }}
                          variant="outline"
                          size="sm"
                          className="rounded-lg"
                        >
                          {t("clear")}
                        </Button>
                      </div>

                      {loading ? (
                        <div className="text-center py-12 text-[#86868b] dark:text-[#a1a1a6]">
                          <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2 text-blue-500" />
                          <p className="text-sm">{t("loadingFlashcards")}</p>
                        </div>
                      ) : existingFlashcards.length === 0 ? (
                        <div className="text-center py-12 text-[#86868b] dark:text-[#a1a1a6] text-sm bg-white/10 dark:bg-white/5 border border-dashed border-white/20 dark:border-white/10 rounded-2xl">
                          {t("noFlashcardsForSubject")}
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {existingFlashcards.map((flashcard) => (
                            <div key={flashcard.id} className="p-5 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                <div className="flex-1 space-y-2 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="outline" className="text-xs px-2.5 py-0.5 font-semibold bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400">
                                      {flashcard.topic}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs px-2.5 py-0.5 font-semibold">
                                      {getDifficultyLabel(flashcard.difficulty)}
                                    </Badge>
                                    <span className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium">
                                      {flashcard.createdAt instanceof Date
                                        ? flashcard.createdAt.toLocaleDateString(dateLocale)
                                        : new Date(flashcard.createdAt).toLocaleDateString(dateLocale)
                                      }
                                    </span>
                                  </div>
                                  <h4 className="font-bold text-[#1d1d1f] dark:text-[#f5f5f7] text-base leading-relaxed break-words">
                                    {flashcard.question}
                                  </h4>
                                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words">
                                    {flashcard.answer}
                                  </p>
                                  {flashcard.explanation && (
                                    <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] leading-relaxed break-words bg-white/20 dark:bg-white/5 p-2.5 rounded-lg border border-white/10">
                                      {flashcard.explanation}
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-2 sm:flex-col sm:gap-1.5 shrink-0 self-end sm:self-start">
                                  <Button
                                    onClick={() => handleEditFlashcard(flashcard)}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-lg border-white/20"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteFlashcard(flashcard.id)}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg border-white/20"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Manual Flashcard Creation */}
          <TabsContent value="manual">
            <div className="apple-glass-card max-w-2xl mx-auto">
              <div className="w-full relative z-10 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm shrink-0">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {isEditing ? t("editTitle") : t("manualTitle")}
                    </h2>
                    <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                      {isEditing ? t("editDescription") : t("manualDescription")}
                    </p>
                  </div>
                </div>

                <form onSubmit={(e) => { handleManualSubmit(e); }} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold mb-2 block text-[#1d1d1f] dark:text-[#f5f5f7]">{t("subjectLabel")}</label>
                      <Select
                        value={manualForm.subject}
                        onValueChange={(value) => setManualForm(prev => ({ ...prev, subject: value }))}
                      >
                        <SelectTrigger className="bg-white/80 dark:bg-white/5 border-slate-200/90 dark:border-white/10 shadow-sm shadow-slate-200/60 rounded-xl h-11 text-sm font-medium">
                          <SelectValue placeholder={t("selectSubjectOption")} />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.name}>
                              {getSubjectName(subject.name, tSubjects)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-2 block text-[#1d1d1f] dark:text-[#f5f5f7]">{t("difficultyLabel")}</label>
                      <Select
                        value={manualForm.difficulty}
                        onValueChange={(value) => setManualForm(prev => ({ ...prev, difficulty: value }))}
                      >
                        <SelectTrigger className="bg-white/80 dark:bg-white/5 border-slate-200/90 dark:border-white/10 shadow-sm shadow-slate-200/60 rounded-xl h-11 text-sm font-medium">
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
                    <label className="text-sm font-semibold mb-2 block text-[#1d1d1f] dark:text-[#f5f5f7]">{t("topicLabel")}</label>
                    <Input
                      placeholder={t("topicPlaceholder")}
                      value={manualForm.topic}
                      onChange={(e) => setManualForm(prev => ({ ...prev, topic: e.target.value }))}
                      className="bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 rounded-xl h-11"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block text-[#1d1d1f] dark:text-[#f5f5f7]">{t("questionLabel")}</label>
                    <Textarea
                      placeholder={t("questionPlaceholder")}
                      value={manualForm.question}
                      onChange={(e) => setManualForm(prev => ({ ...prev, question: e.target.value }))}
                      rows={3}
                      className="bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block text-[#1d1d1f] dark:text-[#f5f5f7]">{t("answerLabel")}</label>
                    <Textarea
                      placeholder={t("answerPlaceholder")}
                      value={manualForm.answer}
                      onChange={(e) => setManualForm(prev => ({ ...prev, answer: e.target.value }))}
                      rows={3}
                      className="bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block text-[#1d1d1f] dark:text-[#f5f5f7]">{t("explanationLabel")}</label>
                    <Textarea
                      placeholder={t("explanationPlaceholder")}
                      value={manualForm.explanation}
                      onChange={(e) => setManualForm(prev => ({ ...prev, explanation: e.target.value }))}
                      rows={2}
                      className="bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 rounded-xl"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl h-11 text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all border-0">
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
                        className="flex-1 h-11 rounded-xl"
                      >
                        {t("cancel")}
                      </Button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </TabsContent>

          {/* AI Flashcard Generation */}
          <TabsContent value="ai">
            <div className="space-y-6">
              {/* AI Generation Form */}
              <div className="apple-glass-card max-w-2xl mx-auto">
                <div className="w-full relative z-10 p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-sm shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                        {t("aiTitle")}
                      </h2>
                      <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                        {t("aiDescription")}
                      </p>
                    </div>
                  </div>

                  {/* AI Status Info */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/20 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-blue-800 dark:text-blue-200 text-sm mb-2">
                          {t("aiStatusTitle")}
                        </h4>
                        <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1 leading-relaxed">
                          <p>• {t("aiStatusGemini")}</p>
                          <p>• {t("aiStatusTurkish")}</p>
                          <p>• {t("aiStatusDynamic")}</p>
                          <p>• {t("aiStatusQuality")}</p>
                        </div>
                        <div className="mt-3 text-xs text-[#86868b] dark:text-[#a1a1a6] leading-relaxed pt-2 border-t border-white/10">
                          <p className="mb-1">{t("aiStatusNote")}</p>
                          <p>
                            {t("aiSetupGuidePrefix")}{" "}
                            <Link href="/ai-flashcard-setup" className="underline font-semibold text-blue-600 dark:text-blue-400">
                              {t("aiSetupGuideLink")}
                            </Link>{" "}
                            {t("aiSetupGuideSuffix")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={(e) => { handleAIGeneration(e); }} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold mb-2 block text-[#1d1d1f] dark:text-[#f5f5f7]">{t("subjectLabel")}</label>
                        <Select
                          value={aiForm.subject}
                          onValueChange={(value) => setAiForm(prev => ({ ...prev, subject: value }))}
                        >
                          <SelectTrigger className="bg-white/80 dark:bg-white/5 border-slate-200/90 dark:border-white/10 shadow-sm shadow-slate-200/60 rounded-xl h-11 text-sm font-medium">
                            <SelectValue placeholder={t("selectSubjectOption")} />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.name}>
                                {getSubjectName(subject.name, tSubjects)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-semibold mb-2 block text-[#1d1d1f] dark:text-[#f5f5f7]">{t("difficultyLabel")}</label>
                        <Select
                          value={aiForm.difficulty}
                          onValueChange={(value) => setAiForm(prev => ({ ...prev, difficulty: value }))}
                        >
                          <SelectTrigger className="bg-white/80 dark:bg-white/5 border-slate-200/90 dark:border-white/10 shadow-sm shadow-slate-200/60 rounded-xl h-11 text-sm font-medium">
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
                      <label className="text-sm font-semibold mb-2 block text-[#1d1d1f] dark:text-[#f5f5f7]">{t("topicLabel")}</label>
                      <Input
                        placeholder={t("topicPlaceholder")}
                        value={aiForm.topic}
                        onChange={(e) => setAiForm(prev => ({ ...prev, topic: e.target.value }))}
                        className="bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 rounded-xl h-11"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold mb-2 block text-[#1d1d1f] dark:text-[#f5f5f7]">{t("cardCountLabel")}</label>
                        <Select
                          value={aiForm.count.toString()}
                          onValueChange={(value) => setAiForm(prev => ({ ...prev, count: parseInt(value) }))}
                        >
                          <SelectTrigger className="bg-white/80 dark:bg-white/5 border-slate-200/90 dark:border-white/10 shadow-sm shadow-slate-200/60 rounded-xl h-11 text-sm font-medium">
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
                        <label className="text-sm font-semibold mb-2 block text-[#1d1d1f] dark:text-[#f5f5f7]">{t("guidelinesLabel")}</label>
                        <Input
                          placeholder={t("guidelinesPlaceholder")}
                          value={aiForm.guidelines}
                          onChange={(e) => setAiForm(prev => ({ ...prev, guidelines: e.target.value }))}
                          className="bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 rounded-xl h-11"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={aiGenerating}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl h-11 text-sm font-semibold shadow-lg shadow-purple-500/20 transition-all border-0 pt-1"
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
                </div>
              </div>

              {/* Generated Flashcards Preview */}
              {generatedFlashcards.length > 0 && (
                <div className="apple-glass-card max-w-4xl mx-auto">
                  <div className="w-full relative z-10 p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg sm:text-xl text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          {t("generatedTitle", { count: generatedFlashcards.length })}
                        </h3>
                        <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                          {t("generatedDescription")}
                        </p>
                      </div>
                      {aiMetadata && (
                        <div className="text-center sm:text-right shrink-0">
                          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs sm:text-sm px-2.5 py-0.5 font-semibold">
                            {t("quality", { percent: Math.round(qualityScore * 100) })}
                          </Badge>
                          <p className="text-[10px] sm:text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1.5 font-medium">
                            {aiMetadata.aiModel} • {aiMetadata.generationTimestamp}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {generatedFlashcards.map((flashcard, index) => (
                        <div key={flashcard.id} className="p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10">
                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                            <Badge variant="outline" className="text-xs px-2.5 py-0.5 font-semibold bg-white/40 border-0 text-[#1d1d1f] dark:text-[#f5f5f7]">
                              {getDifficultyLabel(flashcard.difficulty)}
                            </Badge>
                            <span className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-bold">#{index + 1}</span>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="text-[11px] sm:text-xs font-bold text-purple-600 dark:text-purple-400 block mb-1 uppercase tracking-wider">{t("questionField")}</label>
                              <p className="text-sm sm:text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed break-words">{flashcard.question}</p>
                            </div>

                            <div>
                              <label className="text-[11px] sm:text-xs font-bold text-green-600 dark:text-green-400 block mb-1 uppercase tracking-wider">{t("answerField")}</label>
                              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words">{flashcard.answer}</p>
                            </div>

                            {flashcard.explanation && (
                              <div>
                                <label className="text-[11px] sm:text-xs font-bold text-[#86868b] dark:text-[#a1a1a6] block mb-1 uppercase tracking-wider">{t("explanationField")}</label>
                                <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] leading-relaxed break-words bg-white/20 dark:bg-white/5 p-2.5 rounded-lg border border-white/10">{flashcard.explanation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* AI Insights */}
                    {(suggestions.length > 0 || studyTips.length > 0) && (
                      <div className="mt-6 p-5 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl border border-white/25">
                        <h4 className="font-bold text-[#1d1d1f] dark:text-[#f5f5f7] text-base mb-4 flex items-center gap-2">
                          <Brain className="w-5 h-5 text-purple-600" />
                          {t("aiInsightsTitle")}
                        </h4>

                        {suggestions.length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-sm font-bold text-purple-700 dark:text-purple-400 mb-2">💡 {t("improvementSuggestions")}</h5>
                            <ul className="text-xs sm:text-sm text-[#86868b] dark:text-[#a1a1a6] space-y-1.5 font-medium pl-1">
                              {suggestions.map((suggestion, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-purple-500 shrink-0 font-bold">•</span>
                                  {suggestion}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {studyTips.length > 0 && (
                          <div>
                            <h5 className="text-sm font-bold text-green-700 dark:text-green-400 mb-2">📚 {t("studyTips")}</h5>
                            <ul className="text-xs sm:text-sm text-[#86868b] dark:text-[#a1a1a6] space-y-1.5 font-medium pl-1">
                              {studyTips.map((tip, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-green-500 shrink-0 font-bold">•</span>
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
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl h-11 text-sm font-semibold shadow-lg shadow-green-500/20 transition-all border-0"
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
                        className="flex-1 h-11 rounded-xl text-sm font-semibold"
                      >
                        {t("clear")}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Features Section */}
        <div className="mt-12">
          <div className="apple-glass-card">
            <div className="w-full relative z-10 p-6 md:p-8">
              <h2 className="text-center text-xl font-bold mb-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
                <Zap className="w-6 h-6 inline mr-2 text-yellow-500" />
                {t("featuresTitle")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold mb-2 text-sm sm:text-base text-[#1d1d1f] dark:text-[#f5f5f7]">{t("featureManualTitle")}</h3>
                  <p className="text-xs sm:text-sm text-[#86868b] dark:text-[#a1a1a6] leading-relaxed">
                    {t("featureManualDesc")}
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-bold mb-2 text-sm sm:text-base text-[#1d1d1f] dark:text-[#f5f5f7]">{t("featureAiTitle")}</h3>
                  <p className="text-xs sm:text-sm text-[#86868b] dark:text-[#a1a1a6] leading-relaxed">
                    {t("featureAiDesc")}
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-bold mb-2 text-sm sm:text-base text-[#1d1d1f] dark:text-[#f5f5f7]">{t("featureSmartTitle")}</h3>
                  <p className="text-xs sm:text-sm text-[#86868b] dark:text-[#a1a1a6] leading-relaxed">
                    {t("featureSmartDesc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
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
