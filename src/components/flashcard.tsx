"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  getFlashcardRecommendation,
  type FlashcardRecommendationOutput,
} from "../ai/flows/flashcard-recommendation";
import { getSubjectName } from "@/lib/question-manager-labels";
import { getStoredAiPreferences, isAiConfigured } from "@/lib/ai-preferences";
import { Button } from "@/components/ui/button";
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
  Frown,
  Meh,
  Smile,
  Star,
  Target,
  Shuffle,
  Brain,
  BookOpen,
  Zap,
  MousePointer2,
  BarChart3,
  CheckCircle,
  Lightbulb,
  Eye,
  RotateCcw,
} from "lucide-react";
import VoiceAssistant from "./voice-assistant";
import { getDemoFlashcards } from "@/data/demo-data";
import MobileNav from "@/components/mobile-nav";
import { useToast } from "@/hooks/use-toast";
import { UnifiedStorageService } from "@/services/unified-storage-service";
import AIFloatingChat from "./ai-floating-chat";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  explanation: string;
  topic: string;
  difficulty: string;
  lastReviewed?: Date;
  nextReview?: Date;
  reviewCount: number;
  confidence: number; // 1-5 scale
  options?: Array<{ text: string; isCorrect: boolean }> | undefined; // Added for multiple choice questions
}

interface FlashcardProps {
  subject: string;
  isDemoMode?: boolean;
  onBack?: () => void;
}

const FlashcardComponent: React.FC<FlashcardProps> = ({ subject, isDemoMode = false, onBack }) => {
  const { toast } = useToast();
  const t = useTranslations("Flashcard");
  const tCommon = useTranslations("Common");
  const tSubjects = useTranslations("Subjects");
  const locale = useLocale();

  const getStudyModeLabel = useCallback(
    (mode: string) => {
      if (mode === "review") {
        return t("modeReview");
      }
      if (mode === "new") {
        return t("modeNew");
      }
      return t("modeDifficult");
    },
    [t],
  );

  const formatReviewWhen = useCallback(
    (days: number) => {
      if (days === 1) {
        return t("reviewTomorrow");
      }
      if (days < 30) {
        return t("reviewInDays", { days });
      }
      return t("reviewInMonth");
    },
    [t],
  );
  // Check demo mode from localStorage
  const demoModeActive =
    isDemoMode ||
    (typeof window !== "undefined" && localStorage.getItem("btk_demo_mode") === "true");

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [studyMode, setStudyMode] = useState<"review" | "new" | "difficult">("review");
  const [stats, setStats] = useState({
    total: 0,
    reviewed: 0,
    mastered: 0,
    needsReview: 0,
  });
  const [aiRecommendation, setAiRecommendation] = useState<FlashcardRecommendationOutput | null>(
    null,
  );
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Reset confirmation state
  const [showResetDialog, setShowResetDialog] = useState(false);

  // Load flashcards from localStorage or demo data
  useEffect(() => {
    const loadFlashcards = async () => {
      try {
        if (demoModeActive) {
          // Demo mode - load demo flashcards (localized for current locale)
          const demoFlashcards = getDemoFlashcards(subject, locale);

          setFlashcards(demoFlashcards);
          setStats({
            total: demoFlashcards.length,
            reviewed: demoFlashcards.filter((f: Flashcard) => f.reviewCount > 0).length,
            mastered: demoFlashcards.filter((f: Flashcard) => f.confidence >= 4).length,
            needsReview: demoFlashcards.filter((f: Flashcard) => f.confidence < 4).length,
          });
          return;
        }

        const flashcards = UnifiedStorageService.getFlashcardsBySubject(subject);

        if (flashcards.length === 0) {
          throw new Error(t("noFlashcardsForSubject"));
        }

        // Flashcard'ları component interface'ine uygun hale getir
        const convertedFlashcards: Flashcard[] = flashcards.map((f) => {
          const card: Flashcard = {
            id: f.id,
            question: f.question,
            answer: f.answer,
            explanation: f.explanation,
            topic: f.topic,
            difficulty: f.difficulty,
            reviewCount: f.reviewCount || 0,
            confidence: f.confidence || 3,
            options: undefined,
          };

          // Only add optional properties if they exist
          if (f.lastReviewed) {
            card.lastReviewed =
              f.lastReviewed instanceof Date ? f.lastReviewed : new Date(f.lastReviewed);
          }
          if (f.nextReview) {
            card.nextReview = f.nextReview instanceof Date ? f.nextReview : new Date(f.nextReview);
          }

          return card;
        });

        setFlashcards(convertedFlashcards);
        setStats({
          total: convertedFlashcards.length,
          reviewed: convertedFlashcards.filter((f) => f.reviewCount > 0).length,
          mastered: convertedFlashcards.filter((f) => f.confidence >= 4).length,
          needsReview: convertedFlashcards.filter((f) => f.confidence < 4).length,
        });
      } catch (error) {
        // Show user-friendly error message
        toast({
          title: tCommon("error"),
          description: t("loadError", {
            message: error instanceof Error ? error.message : t("unknownError"),
          }),
          variant: "destructive",
        });
      }
    };

    if (subject) {
      loadFlashcards();
    }
  }, [subject, demoModeActive, toast, t, tCommon, locale]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      setShowAnswer(true);
    }
  };

  const handleConfidence = (level: number) => {
    setConfidence(level);

    // Update flashcard stats
    const updatedFlashcards = [...flashcards];
    const currentCard = updatedFlashcards[currentIndex];

    if (currentCard) {
      currentCard.confidence = level;
      currentCard.reviewCount += 1;
      currentCard.lastReviewed = new Date();

      // Calculate next review date based on confidence (spaced repetition)
      const daysUntilNextReview = calculateNextReview(level, currentCard.reviewCount);
      currentCard.nextReview = new Date(Date.now() + daysUntilNextReview * 24 * 60 * 60 * 1000);

      setFlashcards(updatedFlashcards);

      // Save progress to storage using UnifiedStorageService
      if (currentCard.id.startsWith("flashcard_") || currentCard.id.startsWith("ai_flashcard_")) {
        // This is a flashcard, save progress
        UnifiedStorageService.updateFlashcardProgress(currentCard.id, {
          confidence: currentCard.confidence,
          reviewCount: currentCard.reviewCount,
          lastReviewed: currentCard.lastReviewed,
          nextReview: currentCard.nextReview,
        });
      }

      // Update stats
      updateStats(updatedFlashcards);
    }
  };

  const calculateNextReview = (confidence: number, reviewCount: number): number => {
    // Optimized spaced repetition algorithm with realistic limits
    let daysUntilNextReview: number;

    if (confidence >= 4) {
      // High confidence: gradual increase with cap
      daysUntilNextReview = Math.min(Math.pow(1.5, reviewCount), 30);
    } else if (confidence >= 3) {
      // Medium confidence: moderate increase
      daysUntilNextReview = Math.min(Math.pow(1.3, reviewCount), 14);
    } else if (confidence >= 2) {
      // Low confidence: slow increase
      daysUntilNextReview = Math.min(Math.pow(1.2, reviewCount), 7);
    } else {
      // Very low confidence: review soon
      daysUntilNextReview = 1;
    }

    // Ensure minimum 1 day and maximum 30 days
    return Math.max(1, Math.min(Math.round(daysUntilNextReview), 30));
  };

  const updateStats = (cards: Flashcard[]) => {
    const now = new Date();
    const reviewed = cards.filter((c) => c.lastReviewed).length;
    const mastered = cards.filter((c) => c.confidence >= 4 && c.reviewCount >= 3).length;
    const needsReview = cards.filter((c) => {
      if (!c.nextReview) {
        return true;
      }
      const nextReviewDate = c.nextReview instanceof Date ? c.nextReview : new Date(c.nextReview);
      return nextReviewDate <= now;
    }).length;

    setStats({
      total: cards.length,
      reviewed,
      mastered,
      needsReview,
    });
  };

  const resetAllCards = () => {
    // Reset all flashcards to initial state
    const resetFlashcards = flashcards.map((card) => {
      const { ...cardWithoutDates } = card;
      return {
        ...cardWithoutDates,
        reviewCount: 0,
        confidence: 3, // Default confidence
      };
    });

    setFlashcards(resetFlashcards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowAnswer(false);
    setConfidence(null);

    // Update stats
    updateStats(resetFlashcards);

    // Save reset state to storage
    resetFlashcards.forEach((card) => {
      if (card.id.startsWith("flashcard_") || card.id.startsWith("ai_flashcard_")) {
        UnifiedStorageService.updateFlashcardProgress(card.id, {
          confidence: card.confidence,
          reviewCount: card.reviewCount,
        });
      }
    });

    // Show success message
    toast({
      title: t("resetSuccess"),
      description: t("resetSuccessDesc"),
      variant: "default",
    });
  };

  const getAiRecommendation = async () => {
    setIsLoadingRecommendation(true);
    try {
      // Get comprehensive data from localStorage for AI recommendations
      const performanceData =
        typeof window !== "undefined" ? localStorage.getItem("performanceData") || "{}" : "{}";

      // Get quiz results from localStorage
      const quizResults =
        typeof window !== "undefined" ? localStorage.getItem("quizResults") || "[]" : "[]";

      // Get study history from localStorage
      const studyHistory =
        typeof window !== "undefined" ? localStorage.getItem("studyHistory") || "[]" : "[]";

      // Get current flashcard progress with real data
      const flashcardProgress = flashcards.map((card) => ({
        id: card.id,
        topic: card.topic,
        difficulty: card.difficulty,
        confidence: card.confidence,
        reviewCount: card.reviewCount,
        lastReviewed: card.lastReviewed,
        nextReview: card.nextReview,
      }));

      // Combine all data for comprehensive AI analysis
      const combinedData = {
        performanceData: JSON.parse(performanceData),
        quizResults: JSON.parse(quizResults),
        studyHistory: JSON.parse(studyHistory),
        flashcardProgress,
        currentSubject: subject,
        currentStudyMode: studyMode,
        totalFlashcards: flashcards.length,
        reviewedCount: flashcards.filter((card) => card.lastReviewed).length,
        masteredCount: flashcards.filter((card) => card.confidence >= 4).length,
        needsReviewCount: flashcards.filter((card) => {
          if (!card.nextReview) {
            return true;
          }
          const nextReviewDate =
            card.nextReview instanceof Date ? card.nextReview : new Date(card.nextReview);
          return nextReviewDate <= new Date();
        }).length,
      };

      const flashcardData = JSON.stringify(combinedData);

      const preferences = getStoredAiPreferences();
      if (!isAiConfigured(preferences)) {
        // silently skip or set empty, since it's optional rec
        return;
      }

      const recommendation = await getFlashcardRecommendation({
        userId: "user-123",
        subject,
        performanceData: JSON.stringify(combinedData), // Send combined data
        currentFlashcardData: flashcardData,
        studyMode,
        targetStudyTime: 30, // 30 minutes default
        preferences,
        language: locale === "en" ? "en" : "tr",
      });

      setAiRecommendation(recommendation);
    } catch /* (error) */ {
      if (process.env.NODE_ENV === "development") {
        //console.error("AI recommendation error:", error);
      }
      // Show user-friendly error message
      toast({
        title: t("aiRecommendationFailed"),
        description: t("aiRecommendationFailedDesc"),
        variant: "destructive",
      });
    } finally {
      setIsLoadingRecommendation(false);
    }
  };

  const nextCard = () => {
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      setShowAnswer(false);
      setConfidence(null);
    }
  };

  const previousCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
      setShowAnswer(false);
      setConfidence(null);
    }
  };

  const shuffleCards = () => {
    // Get current card before shuffling
    const currentCard = filteredCards[currentIndex];

    // Create a shuffled copy of the filtered cards
    const shuffled = [...filteredCards].sort(() => Math.random() - 0.5);

    // Update the main flashcards array with the shuffled order
    // but preserve the original cards that aren't in the current filter
    const originalCards = [...flashcards];
    const shuffledIds = new Set(shuffled.map((card) => card.id));

    // Replace cards that are in the current filter with shuffled ones
    const updatedFlashcards = originalCards.map((card) => {
      if (shuffledIds.has(card.id)) {
        return shuffled.find((shuffledCard) => shuffledCard.id === card.id) || card;
      }
      return card;
    });

    setFlashcards(updatedFlashcards);

    // Find the new position of the current card in shuffled array
    if (currentCard) {
      const newIndex = shuffled.findIndex((card) => card.id === currentCard.id);
      setCurrentIndex(newIndex >= 0 ? newIndex : 0);
    } else {
      setCurrentIndex(0);
    }

    setIsFlipped(false);
    setShowAnswer(false);
    setConfidence(null);
  };

  const getCardsForStudyMode = () => {
    switch (studyMode) {
      case "review":
        return flashcards.filter(
          () =>
            // Show all cards in review mode
            // This includes: new cards, cards due for review, and completed cards
            true,
        );
      case "new":
        return flashcards.filter((c) => !c.lastReviewed);
      case "difficult":
        // Show cards with confidence <= 2 OR cards that haven't been reviewed yet
        return flashcards.filter((c) => c.confidence <= 2 || !c.lastReviewed);
      default:
        return flashcards;
    }
  };

  // Handle voice commands
  const handleVoiceCommand = (command: string) => {
    switch (command) {
      case "next":
        if (currentIndex < filteredCards.length - 1) {
          nextCard();
        }
        break;
      case "previous":
        if (currentIndex > 0) {
          previousCard();
        }
        break;
      case "flip":
        handleFlip();
        break;
      case "shuffle":
        shuffleCards();
        break;
      case "show":
        setShowAnswer(true);
        break;
      case "hide":
        setShowAnswer(false);
        break;
      default:
    }
  };

  // Filter cards based on study mode
  let filteredCards = getCardsForStudyMode();

  // Debug filtering
  /* if (process.env.NODE_ENV === 'development') {
    console.log('Filtering Debug:', {
      studyMode,
      totalCards: flashcards.length,
      filteredCards: filteredCards.length,
      cards: flashcards.map(c => ({
        id: c.id,
        confidence: c.confidence,
        lastReviewed: c.lastReviewed,
        nextReview: c.nextReview,
      })),
    });
  } */

  // If no cards found in current mode, fallback to showing all cards
  if (filteredCards.length === 0 && flashcards.length > 0) {
    filteredCards = flashcards;
  }

  const currentCard = filteredCards[currentIndex];

  // Check if all cards are completed (confidence >= 4) - show congratulations
  // More realistic completion condition - all cards must be reviewed multiple times and have max confidence
  const allCardsCompleted =
    flashcards.length > 0 &&
    flashcards.every((card) => card.confidence === 5 && card.reviewCount >= 3);

  if (!currentCard || allCardsCompleted) {
    // Check if current study mode has no cards
    const currentModeCompleted = filteredCards.length === 0 && flashcards.length > 0;

    // Debug info
    /* if (process.env.NODE_ENV === 'development') {
      console.log('Debug Info:', {
        totalCards: flashcards.length,
        completedCards: flashcards.filter(c => c.confidence >= 4).length,
        allCardsCompleted,
        currentModeCompleted,
        studyMode,
        filteredCardsLength: filteredCards.length,
        confidenceDistribution: flashcards.map(c => c.confidence),
      });
    } */

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-transparent dark:!bg-none p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              {t("systemTitle", { subject: getSubjectName(subject, tSubjects) })}
            </h1>

            {allCardsCompleted || currentModeCompleted ? (
              // 🎉 MODERN CONGRATULATIONS SCREEN 🎉
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 border border-gray-200/50 dark:border-gray-600/50 backdrop-blur-sm mx-4 sm:mx-0"
              >
                {/* Modern Celebration Animation */}
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-6 sm:mb-8">
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                      className="relative"
                    >
                      {/* Main achievement badge */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-full flex items-center justify-center shadow-2xl border-2 sm:border-4 border-white/20">
                        <svg
                          className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      </div>

                      {/* Floating success indicators */}
                      <motion.div
                        animate={{
                          y: [0, -8, 0],
                          rotate: [0, 5, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse",
                        }}
                        className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </motion.div>

                      <motion.div
                        animate={{
                          y: [0, -6, 0],
                          rotate: [0, -5, 0],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          repeatType: "reverse",
                          delay: 0.5,
                        }}
                        className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      </motion.div>
                    </motion.div>
                  </div>

                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4 px-4"
                    style={{ lineHeight: "1.2", height: "auto", overflow: "visible" }}
                  >
                    {t("completedTitle")}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-6 sm:mb-8 font-medium px-4"
                  >
                    {allCardsCompleted
                      ? t("completedAllDesc", { subject: getSubjectName(subject, tSubjects) })
                      : t("completedGreatJob")}
                  </motion.p>
                </div>

                {/* Modern Stats Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 px-4"
                >
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-200/50 dark:border-blue-600/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="text-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                        <svg
                          className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      </div>
                      <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent mb-2">
                        {flashcards.length}
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {t("totalCards")}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-green-200/50 dark:border-green-600/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="text-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                        <svg
                          className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-br from-emerald-500 to-teal-600 bg-clip-text text-transparent mb-2">
                        {Math.round(
                          (flashcards.filter((c) => c.confidence >= 4).length / flashcards.length) *
                            100,
                        )}
                        %
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-green-400">
                        {t("successRate")}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-200/50 dark:border-purple-600/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="text-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                        <svg
                          className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      </div>
                      <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent mb-2">
                        {flashcards.reduce((sum, c) => sum + c.reviewCount, 0)}
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-purple-600 dark:text-purple-400">
                        {t("totalReviews")}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Modern Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 px-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      resetAllCards();
                    }}
                    className="w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span>{t("startFresh")}</span>
                  </motion.button>

                  <motion.button
                    onClick={onBack}
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    <span>{t("backToSubjectSelection")}</span>
                  </motion.button>
                </motion.div>
              </motion.div>
            ) : (
              // Modern "no cards" message with better debugging
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 rounded-3xl shadow-2xl p-8 border border-gray-200/50 dark:border-gray-600/50"
              >
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    {filteredCards.length === 0 && flashcards.length > 0
                      ? t("noCardsInMode", { mode: getStudyModeLabel(studyMode) })
                      : t("noCardsForTopic")}
                  </h3>
                </div>

                {filteredCards.length === 0 && flashcards.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-600/50 rounded-2xl p-6 mb-6"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">💡</span>
                      <h4 className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                        {t("tip")}
                      </h4>
                    </div>
                    <p className="text-blue-700 dark:text-blue-300">{t("noCardsInModeTip")}</p>
                  </motion.div>
                )}

                {/* Modern Debug Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6 mb-6 border border-gray-200/50 dark:border-gray-600/50"
                >
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <span className="text-xl">🔍</span>
                    {t("debugInfo")}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/50 dark:border-gray-600/50">
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {flashcards.length}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {t("debugTotal")}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/50 dark:border-gray-600/50">
                      <div className="text-xl font-bold text-green-600 dark:text-green-400">
                        {flashcards.filter((c) => c.confidence >= 4).length}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {t("debugCompleted")}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/50 dark:border-gray-600/50">
                      <div className="text-xl font-bold text-red-600 dark:text-red-400">
                        {flashcards.filter((c) => c.confidence <= 2).length}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {t("debugDifficult")}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/50 dark:border-gray-600/50">
                      <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        {flashcards.filter((c) => !c.lastReviewed).length}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {t("debugNew")}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      <strong>{t("confidenceDistribution")}</strong>{" "}
                      {flashcards.map((c) => `${c.confidence}/5`).join(" • ")}
                    </div>
                    <div>
                      <strong>{t("currentMode")}</strong>{" "}
                      {studyMode === "review"
                        ? `🔄 ${getStudyModeLabel("review")}`
                        : studyMode === "new"
                          ? `🆕 ${getStudyModeLabel("new")}`
                          : `⚠️ ${getStudyModeLabel("difficult")}`}
                    </div>
                    <div>
                      <strong>{t("filteredCards")}</strong> {filteredCards.length}
                    </div>
                  </div>
                </motion.div>

                {filteredCards.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-center"
                  >
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      {studyMode === "review" && `🔄 ${t("modeReviewDesc")}`}
                      {studyMode === "new" && `🆕 ${t("modeNewDesc")}`}
                      {studyMode === "difficult" && `⚠️ ${t("modeDifficultDesc")}`}
                    </p>

                    <div className="flex flex-wrap gap-3 justify-center">
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setStudyMode("review");
                          setCurrentIndex(0);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                      >
                        🔄 {t("showAllCards")}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setStudyMode("new");
                          setCurrentIndex(0);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                      >
                        🆕 {t("newCards")}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setStudyMode("difficult");
                          setCurrentIndex(0);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                      >
                        ⚠️ {t("difficultCards")}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-transparent dark:!bg-none">
      {/* Responsive Navigation Bar */}
      <MobileNav />

      <div className="p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("backToSubjectSelection")}
              </Button>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t("systemTitle", { subject: getSubjectName(subject, tSubjects) })}
              </h1>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="apple-glass-card p-5 text-center flex flex-col items-center justify-center border-0 shadow-lg">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mb-1">
                {stats.total}
              </div>
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("statsTotal")}
              </div>
            </div>

            <div className="apple-glass-card p-5 text-center flex flex-col items-center justify-center border-0 shadow-lg">
              <div className="w-10 h-10 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 flex items-center justify-center mb-3">
                <Eye className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400 mb-1">
                {stats.reviewed}
              </div>
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("statsReviewed")}
              </div>
            </div>

            <div className="apple-glass-card p-5 text-center flex flex-col items-center justify-center border-0 shadow-lg">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center mb-3">
                <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-1">
                {stats.mastered}
              </div>
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("statsMastered")}
              </div>
            </div>

            <div className="apple-glass-card p-5 text-center flex flex-col items-center justify-center border-0 shadow-lg">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center mb-3">
                <RotateCcw className="w-5 h-5 text-amber-600 dark:text-amber-500" />
              </div>
              <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-500 mb-1">
                {stats.needsReview}
              </div>
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("statsNeedsReview")}
              </div>
            </div>
          </div>

          {/* Reset All Cards Button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setShowResetDialog(true)}
              className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 dark:border-red-500/30 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-sm text-sm"
              title={t("resetAllCardsTitle")}
            >
              <RotateCcw className="w-4 h-4" />
              {t("resetAllCards")}
            </button>
          </div>

          {/* Study Mode Selector */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8">
            <div className="inline-flex p-1 bg-gray-200/50 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl border border-black/5 dark:border-white/5 shadow-inner">
              <button
                onClick={() => {
                  setStudyMode("review");
                  setCurrentIndex(0);
                  setIsFlipped(false);
                  setShowAnswer(false);
                  setConfidence(null);
                }}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  studyMode === "review"
                    ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                {t("modeReview")}
              </button>
              <button
                onClick={() => {
                  setStudyMode("new");
                  setCurrentIndex(0);
                  setIsFlipped(false);
                  setShowAnswer(false);
                  setConfidence(null);
                }}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  studyMode === "new"
                    ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                {t("modeNew")}
              </button>
              <button
                onClick={() => {
                  setStudyMode("difficult");
                  setCurrentIndex(0);
                  setIsFlipped(false);
                  setShowAnswer(false);
                  setConfidence(null);
                }}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  studyMode === "difficult"
                    ? "bg-white dark:bg-gray-700 text-red-500 dark:text-red-400 shadow-sm"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                {t("modeDifficult")}
              </button>
            </div>

            <button
              onClick={() => {
                void getAiRecommendation();
              }}
              disabled={isLoadingRecommendation}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-semibold shadow-lg hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-200 disabled:opacity-50 flex items-center gap-2 border border-indigo-400/20"
            >
              {isLoadingRecommendation ? (
                <>
                  <Brain className="w-4 h-4 animate-pulse text-indigo-200" />
                  <span>{t("aiThinking")}</span>
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 text-indigo-100" />
                  <span>{t("aiRecommendation")}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI Recommendation */}
        {aiRecommendation && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 mb-6 border border-blue-200 dark:border-blue-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-indigo-800 dark:text-indigo-300">
                  {t("aiRecommendation")}
                </h3>
                <span className="text-sm text-indigo-600 dark:text-indigo-400">
                  {t("confidenceLabel", { percent: Math.round(aiRecommendation.confidence * 100) })}
                </span>
              </div>
              <button
                onClick={() => setAiRecommendation(null)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1"
                title={t("hideRecommendation")}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-indigo-700 dark:text-indigo-300 mb-2">
                  {t("recommendedMode")} {getStudyModeLabel(aiRecommendation.recommendedStudyMode)}
                </h4>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-3">
                  {aiRecommendation.reasoning}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-indigo-700 dark:text-indigo-300 mb-2">
                  {t("focusTopics")}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {aiRecommendation.recommendedTopics.slice(0, 3).map((topic, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs rounded"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border">
              <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                📚 {t("studyStrategy")}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {aiRecommendation.studyStrategy}
              </p>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {t("estimatedTime", { time: aiRecommendation.estimatedTime })}
              </div>
            </div>

            <button
              onClick={() => {
                setStudyMode(aiRecommendation.recommendedStudyMode);
                setCurrentIndex(0);
                setIsFlipped(false);
                setShowAnswer(false);
                setConfidence(null);
              }}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {t("applyRecommendation")}
            </button>
          </motion.div>
        )}

        {/* Modern Flashcard */}
        <div className="flex justify-center mb-8">
          <motion.div
            className="w-full max-w-5xl cursor-pointer perspective-1000"
            onClick={handleFlip}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.div
              className="relative w-full h-auto min-h-[31rem] sm:min-h-[35rem]"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{
                duration: 0.4,
                ease: "easeOut",
              }}
              style={{ transformStyle: "preserve-3d", willChange: "transform" }}
            >
              {/* Front of card - Modern Design */}
              <div
                className={`absolute w-full h-full bg-white/85 dark:bg-gray-900/65 backdrop-blur-3xl border border-black/5 dark:border-white/10 rounded-[24px] shadow-2xl p-4 sm:p-6 md:p-8 flex flex-col justify-center items-center text-center ${
                  isFlipped ? "backface-hidden" : ""
                }`}
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "translate3d(0, 0, 0)",
                }}
              >
                {/* Header with modern badges */}
                <div className="mb-6 flex flex-wrap justify-center gap-3">
                  <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-full shadow-lg gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{currentCard.topic}</span>
                  </span>
                  <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-semibold rounded-full shadow-lg gap-2">
                    <Zap className="w-4 h-4" />
                    <span>{currentCard.difficulty}</span>
                  </span>
                </div>

                {/* Question with modern typography */}
                <div className="mb-8 px-4 flex-1 flex items-center justify-center">
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 dark:text-white leading-relaxed text-center">
                    {currentCard.question}
                  </h2>
                </div>

                {/* Modern options display */}
                {currentCard.options &&
                  (currentCard.question.toLowerCase().includes("aşağıdakilerden") ||
                    currentCard.question.toLowerCase().includes("hangisi")) && (
                    <div className="w-full max-w-lg mb-6">
                      <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-600/50">
                        {currentCard.options.map((option, index) => (
                          <div key={index} className="mb-3 last:mb-0">
                            <div className="flex items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-600 dark:to-gray-700 rounded-xl hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-600/20 dark:hover:to-blue-700/20 transition-all duration-200">
                              <span className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold rounded-full mr-3 shadow-md">
                                {String.fromCharCode(65 + index)}
                              </span>
                              <span className="text-gray-700 dark:text-gray-200 font-medium">
                                {option.text}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Interactive hint */}
                <div className="mt-auto">
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-400/20 dark:to-purple-400/20 rounded-2xl p-4 border border-blue-200/30 dark:border-blue-600/30">
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium flex items-center justify-center gap-2">
                      <MousePointer2 className="w-4 h-4 animate-pulse text-blue-600 dark:text-blue-400" />
                      <span>{t("clickToSeeAnswer")}</span>
                    </p>
                  </div>
                </div>

                {/* Progress indicator */}
                <div className="absolute bottom-4 right-4">
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg border border-gray-200/50 dark:border-gray-600/50">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                      {currentIndex + 1} / {filteredCards.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Back of card - Modern Design */}
              <div
                className={`absolute w-full h-full bg-white/85 dark:bg-gray-900/65 backdrop-blur-3xl border border-black/5 dark:border-white/10 rounded-[24px] shadow-2xl p-4 sm:p-6 md:p-8 flex flex-col justify-center items-center text-center ${
                  !isFlipped ? "backface-hidden" : ""
                }`}
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg) translate3d(0, 0, 0)",
                }}
              >
                {/* Answer header */}
                <div className="mb-4 sm:mb-6">
                  <span className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs sm:text-sm font-semibold rounded-full shadow-lg gap-2">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{t("answer")}</span>
                  </span>
                </div>

                {/* Answer content */}
                <div className="mb-4 sm:mb-6 px-2 sm:px-4 flex-1 flex items-center justify-center">
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-800 dark:text-white leading-relaxed text-center">
                    {currentCard.answer}
                  </h3>
                </div>

                {/* Explanation in modern card */}
                <div className="w-full max-w-2xl mb-4 sm:mb-6">
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-gray-200/50 dark:border-gray-600/50">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                      <h4 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200">
                        {t("explanation")}
                      </h4>
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                      {currentCard.explanation}
                    </p>
                  </div>
                </div>

                {/* Interactive hint */}
                <div className="mt-auto">
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-400/20 dark:to-emerald-400/20 rounded-2xl p-4 border border-green-200/30 dark:border-green-600/30">
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center justify-center gap-2">
                      <MousePointer2 className="w-4 h-4 animate-pulse text-green-600 dark:text-green-400" />
                      <span>{t("clickToGoBack")}</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Modern Confidence Rating */}
        {showAnswer && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white/85 dark:bg-gray-900/65 backdrop-blur-3xl border border-black/5 dark:border-white/10 rounded-[24px] shadow-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8"
            >
              <div className="text-center mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2 flex items-center justify-center gap-2">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                  <span className="leading-none">{t("confidenceQuestion")}</span>
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  {t("confidenceSubtitle")}
                </p>
              </div>

              <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
                {[1, 2, 3, 4, 5].map((level) => (
                  <motion.button
                    key={level}
                    onClick={() => handleConfidence(level)}
                    disabled={confidence !== null}
                    whileHover={confidence === null ? { scale: 1.08, y: -2 } : {}}
                    whileTap={confidence === null ? { scale: 0.95 } : {}}
                    className={`relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-[16px] font-bold text-base sm:text-lg transition-all duration-200 border bg-transparent ${
                      confidence === level
                        ? level === 1
                          ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/25 scale-105"
                          : level === 2
                            ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/25 scale-105"
                            : level === 3
                              ? "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/25 scale-105"
                              : level === 4
                                ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/25 scale-105"
                                : "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/25 scale-105"
                        : confidence !== null
                          ? "opacity-30 cursor-not-allowed border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-600"
                          : level === 1
                            ? "border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-lg hover:shadow-red-500/10"
                            : level === 2
                              ? "border-orange-500/30 text-orange-500 hover:bg-orange-500 hover:text-white hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/10"
                              : level === 3
                                ? "border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-white hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/10"
                                : level === 4
                                  ? "border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10"
                                  : "border-indigo-500/30 text-indigo-500 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-500/10"
                    }`}
                  >
                    {level}
                    {confidence === level && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 w-4 h-4 sm:w-5 sm:h-5 bg-white text-emerald-600 border border-emerald-500 rounded-full flex items-center justify-center shadow-md font-extrabold text-2xs"
                      >
                        ✓
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="text-center">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-black/5 dark:border-white/10 shadow-sm">
                  <p className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200 flex items-center justify-center gap-2">
                    {confidence === 1 && (
                      <>
                        <Frown className="w-5 h-5 text-red-500" />
                        <span>{t("confidence1")}</span>
                      </>
                    )}
                    {confidence === 2 && (
                      <>
                        <Meh className="w-5 h-5 text-orange-500" />
                        <span>{t("confidence2")}</span>
                      </>
                    )}
                    {confidence === 3 && (
                      <>
                        <Meh className="w-5 h-5 text-yellow-500" />
                        <span>{t("confidence3")}</span>
                      </>
                    )}
                    {confidence === 4 && (
                      <>
                        <Smile className="w-5 h-5 text-green-500" />
                        <span>{t("confidence4")}</span>
                      </>
                    )}
                    {confidence === 5 && (
                      <>
                        <Star className="w-5 h-5 text-blue-500" />
                        <span>{t("confidence5")}</span>
                      </>
                    )}
                  </p>
                  {confidence && (
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {t("cardReviewSchedule", {
                        when: formatReviewWhen(
                          calculateNextReview(confidence, (currentCard?.reviewCount || 0) + 1),
                        ),
                      })}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Modern Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <motion.button
            onClick={previousCard}
            disabled={currentIndex === 0}
            whileHover={{ scale: 1.05, x: -3 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-white/70 dark:bg-gray-800/70 border border-black/5 dark:border-white/10 text-gray-700 dark:text-gray-200 rounded-[16px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 backdrop-blur-sm"
          >
            <span className="text-xl">←</span>
            <span>{t("previous")}</span>
          </motion.button>

          <motion.button
            onClick={shuffleCards}
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-indigo-600 text-white rounded-[16px] font-semibold hover:bg-indigo-700 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-indigo-500/20 flex items-center gap-2"
          >
            <Shuffle className="w-5 h-5 text-white" />
            <span>{t("shuffle")}</span>
          </motion.button>

          <motion.button
            onClick={nextCard}
            disabled={currentIndex === filteredCards.length - 1}
            whileHover={{ scale: 1.05, x: 3 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-white/70 dark:bg-gray-800/70 border border-black/5 dark:border-white/10 text-gray-700 dark:text-gray-200 rounded-[16px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 backdrop-blur-sm"
          >
            <span>{t("next")}</span>
            <span className="text-xl">→</span>
          </motion.button>
        </div>

        {/* Modern Progress Bar */}
        <div className="mt-8">
          <div className="bg-gray-200/55 dark:bg-gray-800/55 rounded-full h-3 border border-black/5 dark:border-white/5 overflow-hidden shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-sm"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentIndex + 1) / filteredCards.length) * 100}%`,
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <div className="text-center mt-4">
            <div className="inline-flex items-center gap-3 bg-white/85 dark:bg-gray-900/65 backdrop-blur-3xl border border-black/5 dark:border-white/10 rounded-[16px] px-6 py-3 shadow-md">
              <span className="text-lg font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>{t("progress")}</span>
              </span>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {currentIndex + 1} / {filteredCards.length}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                (%{Math.round(((currentIndex + 1) / filteredCards.length) * 100)})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Assistant */}
      <VoiceAssistant
        key={`${currentCard?.id}-${currentIndex}`}
        onCommand={handleVoiceCommand}
        currentQuestion={currentCard?.question}
        currentAnswer={currentCard?.answer}
        {...(currentCard?.options && { currentOptions: currentCard.options })}
        currentExplanation={currentCard?.explanation}
        isListening={isListening}
        onListeningChange={setIsListening}
        mode="flashcard"
      />

      {/* AI Floating Chat - accesses flashcard data */}
      <AIFloatingChat
        subject={subject}
        quizData={{
          currentQuestionIndex: currentIndex,
          currentQuestion: currentCard as unknown as Record<string, unknown>,
          totalQuestions: filteredCards.length,
          aiTutorUsed: false, // Flashcards don't have separate AI Tutor like quiz, but can be extended
          showResult: showAnswer,
        }}
      />

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("resetDialogTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("resetDialogDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowResetDialog(false)}>
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resetAllCards();
                setShowResetDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {t("confirmReset")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FlashcardComponent;
