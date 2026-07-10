import type { Question } from "@/lib/types";
import type { Subject } from "@/types/question-manager";
import { createClient } from "@supabase/supabase-js";
import localforage from "localforage";
import { shouldUseDemoData } from "@/data/demo-data";

// Flashcard interface
export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  explanation: string;
  topic: string;
  difficulty: string;
  subject: string;
  createdAt: Date;
  // Progress tracking fields for spaced repetition
  reviewCount?: number;
  confidence?: number;
  lastReviewed?: Date;
  nextReview?: Date;
}

// Topic Explainer interfaces
export interface TopicStepData {
  id: string;
  title: string;
  content: string;
  examples: string[];
  tips: string[];
  difficulty: "easy" | "medium" | "hard";
  estimatedTime: number;
  visualDescription?: string;
  confidence?: number;
}

export interface SavedTopicContent {
  id: string;
  topic: string;
  subject: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  stepData?: TopicStepData[];
}

// Unified storage service with single storage keys
export class UnifiedStorageService {
  // Single storage keys for the entire application
  private static readonly QUESTIONS_KEY = "mindhouse_questions";
  private static readonly SUBJECTS_KEY = "mindhouse_subjects";
  private static readonly FLASHCARDS_KEY = "mindhouse_flashcards";

  // In-memory caches for synchronous access
  private static cache = {
    questions: null as Question[] | null,
    subjects: null as Subject[] | null,
    flashcards: null as Flashcard[] | null,
    topics: {} as Record<string, SavedTopicContent[]>,
  };
  private static isInitialized = false;

  static get isReady() {
    return this.isInitialized;
  }

  // Initialize storage from localforage to RAM
  static async initialize(): Promise<void> {
    if (typeof window === "undefined" || this.isInitialized) {
      return;
    }

    try {
      this.cache.questions = await localforage.getItem<Question[]>(this.QUESTIONS_KEY);
      this.cache.subjects = await localforage.getItem<Subject[]>(this.SUBJECTS_KEY);
      this.cache.flashcards = await localforage.getItem<Flashcard[]>(this.FLASHCARDS_KEY);

      // Load all topic explainers (iterate over subjects)
      if (this.cache.subjects) {
        for (const subject of this.cache.subjects) {
          const subjectKey = `mindhouse_topic_explainer_${subject.name}`;
          const topics = await localforage.getItem<SavedTopicContent[]>(subjectKey);
          if (topics) {
            this.cache.topics[subject.name] = topics;
          }
        }
      }

      // Migration: If localforage is empty but localStorage has data, move it
      if (!this.cache.questions && typeof localStorage !== "undefined") {
        const lsQ = localStorage.getItem(this.QUESTIONS_KEY);
        if (lsQ) {
          this.cache.questions = JSON.parse(lsQ);
          await localforage.setItem(this.QUESTIONS_KEY, this.cache.questions);
        }
      }
      if (!this.cache.subjects && typeof localStorage !== "undefined") {
        const lsS = localStorage.getItem(this.SUBJECTS_KEY);
        if (lsS) {
          this.cache.subjects = JSON.parse(lsS);
          await localforage.setItem(this.SUBJECTS_KEY, this.cache.subjects);
        }
      }
      if (!this.cache.flashcards && typeof localStorage !== "undefined") {
        const lsF = localStorage.getItem(this.FLASHCARDS_KEY);
        if (lsF) {
          this.cache.flashcards = JSON.parse(lsF);
          await localforage.setItem(this.FLASHCARDS_KEY, this.cache.flashcards);
        }
      }

      this.cache.questions = this.cache.questions || [];
      this.cache.subjects = this.cache.subjects || [];
      this.cache.flashcards = this.cache.flashcards || [];

      // Clean up demo data from local storage if demo mode is disabled
      if (!shouldUseDemoData()) {
        if (this.cache.subjects && this.cache.subjects.length > 0) {
          const originalLength = this.cache.subjects.length;
          this.cache.subjects = this.cache.subjects.filter(
            (s) => (s as any).createdBy !== "demo_user_btk_2025" && !s.id.startsWith("subj_"),
          );
          if (this.cache.subjects.length !== originalLength) {
            await localforage.setItem(this.SUBJECTS_KEY, this.cache.subjects);
          }
        }
        if (this.cache.questions && this.cache.questions.length > 0) {
          const originalLength = this.cache.questions.length;
          this.cache.questions = this.cache.questions.filter(
            (q) => !q.id.startsWith("q_") && (q as any).createdBy !== "demo_user_btk_2025",
          );
          if (this.cache.questions.length !== originalLength) {
            await localforage.setItem(this.QUESTIONS_KEY, this.cache.questions);
          }
        }
        if (this.cache.flashcards && this.cache.flashcards.length > 0) {
          const originalLength = this.cache.flashcards.length;
          this.cache.flashcards = this.cache.flashcards.filter((f) => !f.id.startsWith("fc_"));
          if (this.cache.flashcards.length !== originalLength) {
            await localforage.setItem(this.FLASHCARDS_KEY, this.cache.flashcards);
          }
        }
      }

      this.isInitialized = true;
    } catch (error) {
      console.error("Storage init error:", error);
      this.cache.questions = [];
      this.cache.subjects = [];
      this.cache.flashcards = [];
      this.isInitialized = true;
    }
  }

  // Supabase client for server-side operations
  private static getSupabaseClient() {
    if (typeof window !== "undefined") {
      // Client-side: use public anon key
      return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );
    }
    return null;
  }

  // Get current user ID (you might need to adapt this to your auth system)
  private static async getCurrentUserId(): Promise<string | null> {
    const supabase = this.getSupabaseClient();
    if (!supabase) {
      return null;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user?.id) {
        return session.user.id;
      }

      return null;
    } catch {
      return null;
    }
  }

  // Questions storage methods
  static getQuestions(): Question[] {
    if (typeof window === "undefined") {
      return [];
    }
    if (!this.cache.questions) {
      return [];
    }

    try {
      let questions = this.cache.questions;

      // Filter out demo questions if demo mode is off
      if (!shouldUseDemoData()) {
        questions = questions.filter(
          (q) => !q.id.startsWith("q_") && (q as any).createdBy !== "demo_user_btk_2025",
        );
      }

      // Auto-cleanup duplicates on load (safety measure)
      if (questions.length > 0) {
        const uniqueQuestions = questions.filter(
          (question: Question, index: number, self: Question[]) =>
            index === self.findIndex((q: Question) => q.id === question.id),
        );

        if (uniqueQuestions.length !== questions.length) {
          this.saveQuestions(uniqueQuestions);
          return uniqueQuestions;
        }
      }

      return questions;
    } catch {
      return [];
    }
  }

  static saveQuestions(questions: Question[]): void {
    if (typeof window === "undefined") {
      return;
    }
    this.cache.questions = questions;
    localforage.setItem(this.QUESTIONS_KEY, questions).catch(console.error);
  }

  static addQuestion(question: Omit<Question, "id">): Question {
    const newQuestion: Question = {
      ...question,
      id: `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    const questions = this.getQuestions();

    // Prevent duplicate IDs (safety check)
    const existingQuestion = questions.find((q) => q.id === newQuestion.id);
    if (existingQuestion) {
      if (process.env.NODE_ENV === "development") {
        //console.warn("⚠️ Duplicate ID detected, generating new ID:", newQuestion.id);
      }
      newQuestion.id = `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    questions.push(newQuestion);
    this.saveQuestions(questions);

    if (process.env.NODE_ENV === "development") {
      //console.log("✅ Question added to localStorage:", newQuestion.id);
    }
    return newQuestion;
  }

  static updateQuestion(id: string, updates: Partial<Question>): boolean {
    try {
      if (process.env.NODE_ENV === "development") {
        //console.log("🔍 UnifiedStorageService: Updating question", { id, updates });
      }

      const questions = this.getQuestions();
      if (process.env.NODE_ENV === "development") {
        //console.log("🔍 UnifiedStorageService: Current questions count:", questions.length);
      }

      const index = questions.findIndex((q) => q.id === id);
      if (process.env.NODE_ENV === "development") {
        //console.log("🔍 UnifiedStorageService: Question index:", index);
      }

      if (index === -1) {
        if (process.env.NODE_ENV === "development") {
          //console.error("🔴 UnifiedStorageService: Question not found with ID:", id);
          // Debug: List all question IDs
          //console.log("🔍 Available question IDs:", questions.map(q => q.id));
        }
        return false;
      }

      const existingQuestion = questions[index];
      if (process.env.NODE_ENV === "development") {
        //console.log("🔍 UnifiedStorageService: Existing question:", existingQuestion);
      }

      if (existingQuestion) {
        const updatedQuestion = {
          ...existingQuestion,
          ...updates,
        };
        if (process.env.NODE_ENV === "development") {
          //console.log("🔍 UnifiedStorageService: Updated question:", updatedQuestion);
        }

        questions[index] = updatedQuestion;
        this.saveQuestions(questions);

        if (process.env.NODE_ENV === "development") {
          //console.log("✅ UnifiedStorageService: Question updated successfully");
        }
        return true;
      } else {
        if (process.env.NODE_ENV === "development") {
          //console.error("🔴 UnifiedStorageService: Existing question is null/undefined");
        }
        return false;
      }
    } catch /* (error) */ {
      if (process.env.NODE_ENV === "development") {
        //console.error("🔴 UnifiedStorageService: Update error:", error);
      }
      return false;
    }
  }

  static deleteQuestion(id: string): boolean {
    try {
      const questions = this.getQuestions();
      const initialLength = questions.length;
      const filtered = questions.filter((q) => q.id !== id);

      if (filtered.length === initialLength) {
        if (process.env.NODE_ENV === "development") {
          //console.error("🔴 Question not found for deletion:", id);
        }
        return false;
      }

      this.saveQuestions(filtered);
      if (process.env.NODE_ENV === "development") {
        //console.log("✅ Question deleted from localStorage:", id);
      }
      return true;
    } catch /* (error) */ {
      if (process.env.NODE_ENV === "development") {
        //console.error("🔴 Error deleting question:", error);
      }
      return false;
    }
  }

  static getQuestionsBySubject(subject: string): Question[] {
    const questions = this.getQuestions();

    // Normalize subject names for better matching
    const normalizedRequestedSubject = subject.trim().toLowerCase();

    const filteredQuestions = questions.filter((q) => {
      const normalizedQuestionSubject = q.subject.trim().toLowerCase();
      const matches = normalizedQuestionSubject === normalizedRequestedSubject;
      return matches;
    });

    if (process.env.NODE_ENV === "development") {
      //console.log(`🔍 Found ${filteredQuestions.length} questions for subject: ${subject}`);
    }
    return filteredQuestions;
  }

  // Subjects storage methods
  static getSubjects(): Subject[] {
    if (typeof window === "undefined") {
      return [];
    }
    if (!this.cache.subjects) {
      return [];
    }
    try {
      let subjects = this.cache.subjects;

      // Filter out demo subjects if demo mode is off
      if (!shouldUseDemoData()) {
        subjects = subjects.filter(
          (s) => (s as any).createdBy !== "demo_user_btk_2025" && !s.id.startsWith("subj_"),
        );
      }

      return subjects;
    } catch {
      return [];
    }
  }

  static saveSubjects(subjects: Subject[]): void {
    if (typeof window === "undefined") {
      return;
    }
    this.cache.subjects = subjects;
    localforage.setItem(this.SUBJECTS_KEY, subjects).catch(console.error);
  }

  static addSubject(subject: Omit<Subject, "id">): Subject {
    const newSubject: Subject = {
      ...subject,
      id: `subject_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    const subjects = this.getSubjects();
    subjects.push(newSubject);
    this.saveSubjects(subjects);

    if (process.env.NODE_ENV === "development") {
      //console.log("✅ Subject added to localStorage:", newSubject.id);
    }
    return newSubject;
  }

  // 🚀 FIXED: Wrong filter condition
  static updateSubject(id: string, updates: Partial<Subject>): boolean {
    try {
      const subjects = this.getSubjects();
      const index = subjects.findIndex((s) => s.id === id); // FIX: was s.id !== id

      if (index === -1) {
        if (process.env.NODE_ENV === "development") {
          //console.error("🔴 Subject not found for update:", id);
        }
        return false;
      }

      const existingSubject = subjects[index];
      if (existingSubject) {
        subjects[index] = {
          ...existingSubject,
          ...updates,
        };
        this.saveSubjects(subjects);
        if (process.env.NODE_ENV === "development") {
          //console.log("✅ Subject updated in localStorage:", id);
        }
        return true;
      }
      return false;
    } catch /* (error) */ {
      if (process.env.NODE_ENV === "development") {
        //console.error("🔴 Error updating subject:", error);
      }
      return false;
    }
  }

  static deleteSubject(id: string): boolean {
    try {
      const subjects = this.getSubjects();
      const initialLength = subjects.length;
      const filtered = subjects.filter((s) => s.id !== id);

      if (filtered.length === initialLength) {
        if (process.env.NODE_ENV === "development") {
          //console.error("🔴 Subject not found for deletion:", id);
        }
        return false;
      }

      this.saveSubjects(filtered);
      if (process.env.NODE_ENV === "development") {
        //console.log("✅ Subject deleted from localStorage:", id);
      }
      return true;
    } catch /* (error) */ {
      if (process.env.NODE_ENV === "development") {
        //console.error("🔴 Error deleting subject:", error);
      }
      return false;
    }
  }

  // 🆕 Flashcard storage methods
  static getFlashcards(): Flashcard[] {
    if (typeof window === "undefined") {
      return [];
    }
    if (!this.cache.flashcards) {
      return [];
    }

    try {
      const flashcards = this.cache.flashcards;

      // Auto-cleanup duplicates on load (safety measure)
      if (flashcards.length > 0) {
        const uniqueFlashcards = flashcards.filter(
          (flashcard: Flashcard, index: number, self: Flashcard[]) =>
            index === self.findIndex((f: Flashcard) => f.id === flashcard.id),
        );

        if (uniqueFlashcards.length !== flashcards.length) {
          this.saveFlashcards(uniqueFlashcards);
          return uniqueFlashcards;
        }
      }

      // Ensure createdAt is a Date object for all flashcards
      const processedFlashcards = flashcards.map((flashcard: Flashcard) => ({
        ...flashcard,
        createdAt:
          flashcard.createdAt instanceof Date ? flashcard.createdAt : new Date(flashcard.createdAt),
      }));

      return processedFlashcards;
    } catch {
      return [];
    }
  }

  static saveFlashcards(flashcards: Flashcard[]): void {
    if (typeof window === "undefined") {
      return;
    }
    this.cache.flashcards = flashcards;
    localforage.setItem(this.FLASHCARDS_KEY, flashcards).catch(console.error);
  }

  static async addFlashcard(flashcard: Omit<Flashcard, "id">): Promise<Flashcard> {
    const newFlashcard: Flashcard = {
      ...flashcard,
      id: `flashcard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    const flashcards = this.getFlashcards();

    // Prevent duplicate IDs (safety check)
    const existingFlashcard = flashcards.find((f) => f.id === newFlashcard.id);
    if (existingFlashcard) {
      if (process.env.NODE_ENV === "development") {
        //console.warn("⚠️ Duplicate ID detected, generating new ID:", newFlashcard.id);
      }
      newFlashcard.id = `flashcard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Save to localStorage first (immediate)
    flashcards.push(newFlashcard);
    this.saveFlashcards(flashcards);

    // Try to sync to Supabase (background)
    this.syncFlashcardToSupabase(newFlashcard).catch(() => {
      if (process.env.NODE_ENV === "development") {
      }
    });

    if (process.env.NODE_ENV === "development") {
      //console.log("✅ Flashcard added to localStorage:", newFlashcard.id);
    }
    return newFlashcard;
  }

  // Sync single flashcard to Supabase with enhanced error handling
  private static async syncFlashcardToSupabase(flashcard: Flashcard): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return;
      }

      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          question: flashcard.question,
          answer: flashcard.answer,
          explanation: flashcard.explanation,
          topic: flashcard.topic,
          difficulty: flashcard.difficulty,
          subject: flashcard.subject,
          confidence: flashcard.confidence || 0,
          reviewCount: flashcard.reviewCount || 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to sync flashcard to Supabase: ${response.status} ${response.statusText} - ${errorData.error || "Unknown error"}`,
        );
      }

      // Response processed successfully
      await response.json();
      if (process.env.NODE_ENV === "development") {
        //console.log("✅ Flashcard synced to Supabase");
      }
      // Successfully synced
    } catch (error) {
      // Re-throw the error without capturing it
      throw error;
    }
  }

  static updateFlashcard(id: string, updates: Partial<Flashcard>): boolean {
    try {
      const flashcards = this.getFlashcards();
      const index = flashcards.findIndex((f) => f.id === id);

      if (index === -1) {
        if (process.env.NODE_ENV === "development") {
          //console.error("🔴 Flashcard not found for update:", id);
        }
        return false;
      }

      const existingFlashcard = flashcards[index];
      if (existingFlashcard) {
        flashcards[index] = {
          ...existingFlashcard,
          ...updates,
        };
        this.saveFlashcards(flashcards);
        if (process.env.NODE_ENV === "development") {
          //console.log("✅ Flashcard updated in localStorage:", id);
        }
        return true;
      }
      return false;
    } catch {
      if (process.env.NODE_ENV === "development") {
        //console.error("🔴 Error updating flashcard");
      }
      return false;
    }
  }

  static deleteFlashcard(id: string): boolean {
    try {
      const flashcards = this.getFlashcards();
      const initialLength = flashcards.length;
      const filtered = flashcards.filter((f) => f.id !== id);

      if (filtered.length === initialLength) {
        if (process.env.NODE_ENV === "development") {
          //console.error("🔴 Flashcard not found for deletion:", id);
        }
        return false;
      }

      this.saveFlashcards(filtered);
      if (process.env.NODE_ENV === "development") {
        //console.log("✅ Flashcard deleted from localStorage:", id);
      }
      return true;
    } catch {
      if (process.env.NODE_ENV === "development") {
        //console.error("🔴 Error deleting flashcard");
      }
      return false;
    }
  }

  static getFlashcardsBySubject(subject: string): Flashcard[] {
    const flashcards = this.getFlashcards();

    // Normalize subject names for better matching
    const normalizedRequestedSubject = subject.trim().toLowerCase();

    const filteredFlashcards = flashcards.filter((f) => {
      const normalizedFlashcardSubject = f.subject.trim().toLowerCase();
      const matches = normalizedFlashcardSubject === normalizedRequestedSubject;
      return matches;
    });

    // Ensure createdAt is a Date object for filtered flashcards
    const processedFlashcards = filteredFlashcards.map((flashcard: Flashcard) => ({
      ...flashcard,
      createdAt:
        flashcard.createdAt instanceof Date ? flashcard.createdAt : new Date(flashcard.createdAt),
    }));

    if (process.env.NODE_ENV === "development") {
      //console.log(`🔍 Found ${processedFlashcards.length} flashcards for subject: ${subject}`);
    }
    return processedFlashcards;
  }

  // 🆕 Update flashcard progress (for spaced repetition system)
  static updateFlashcardProgress(
    id: string,
    progress: {
      confidence?: number;
      reviewCount?: number;
      lastReviewed?: Date;
      nextReview?: Date;
    },
  ): boolean {
    try {
      const flashcards = this.getFlashcards();
      const index = flashcards.findIndex((f) => f.id === id);

      if (index === -1) {
        if (process.env.NODE_ENV === "development") {
          //console.error("🔴 Flashcard not found for progress update:", id);
        }
        return false;
      }

      const existingFlashcard = flashcards[index];
      if (existingFlashcard) {
        flashcards[index] = {
          ...existingFlashcard,
          ...progress,
        };
        this.saveFlashcards(flashcards);
        if (process.env.NODE_ENV === "development") {
          //console.log("✅ Flashcard progress updated:", id, progress);
        }
        return true;
      }
      return false;
    } catch /* (error) */ {
      if (process.env.NODE_ENV === "development") {
        //console.error("🔴 Error updating flashcard progress:", error);
      }
      return false;
    }
  }

  // Clean up old storage keys (migration helper)
  static cleanupOldStorage(): void {
    if (typeof window === "undefined") {
      return;
    }
    try {
      // Remove old storage keys
      const oldKeys = [
        "exam_training_questions",
        "mindhouse_questions_v2",
        "exam_training_subjects",
      ];

      oldKeys.forEach((key) => {
        const existed = localStorage.getItem(key) !== null;
        if (existed) {
          localStorage.removeItem(key);
          if (process.env.NODE_ENV === "development") {
            //console.log(`🧹 Cleaned up old storage key: ${key}`);
          }
        }
      });
    } catch /* (error) */ {
      if (process.env.NODE_ENV === "development") {
        //console.error("🔴 Error during cleanup:", error);
      }
    }
  }

  // Get storage info for debugging
  static getStorageInfo(): {
    questions: number;
    subjects: number;
    flashcards: number;
    totalSize: number;
  } {
    if (typeof window === "undefined") {
      return { questions: 0, subjects: 0, flashcards: 0, totalSize: 0 };
    }
    try {
      const questions = this.getQuestions();
      const subjects = this.getSubjects();
      const flashcards = this.getFlashcards();
      const totalSize = new Blob([
        JSON.stringify(questions),
        JSON.stringify(subjects),
        JSON.stringify(flashcards),
      ]).size;

      return {
        questions: questions.length,
        subjects: subjects.length,
        flashcards: flashcards.length,
        totalSize,
      };
    } catch /* (error) */ {
      if (process.env.NODE_ENV === "development") {
        //console.error("🔴 Error getting storage info:", error);
      }
      return { questions: 0, subjects: 0, flashcards: 0, totalSize: 0 };
    }
  }

  // Clean up duplicate questions by ID
  static cleanupDuplicateQuestions(): { removed: number; total: number } {
    if (typeof window === "undefined") {
      return { removed: 0, total: 0 };
    }

    try {
      const questions = this.getQuestions();
      const total = questions.length;

      // Remove duplicates by ID (keep the first occurrence)
      const uniqueQuestions = questions.filter(
        (question, index, self) => index === self.findIndex((q) => q.id === question.id),
      );

      const removed = total - uniqueQuestions.length;

      if (removed > 0) {
        if (process.env.NODE_ENV === "development") {
          //console.log(`🧹 Cleaned up ${removed} duplicate questions`);
        }
        this.saveQuestions(uniqueQuestions);
      }

      return { removed, total: uniqueQuestions.length };
    } catch /* (error) */ {
      if (process.env.NODE_ENV === "development") {
        //console.error("🔴 Error cleaning duplicates:", error);
      }
      return { removed: 0, total: 0 };
    }
  }

  // Validate question data integrity
  static validateQuestions(): {
    valid: number;
    invalid: number;
    errors: string[];
  } {
    if (typeof window === "undefined") {
      return { valid: 0, invalid: 0, errors: [] };
    }

    try {
      const questions = this.getQuestions();
      const errors: string[] = [];
      let valid = 0;
      let invalid = 0;

      questions.forEach((question, index) => {
        if (!question.id || !question.subject || !question.text || !question.explanation) {
          invalid++;
          errors.push(`Question at index ${index}: Missing required fields`);
        } else if (!Array.isArray(question.options) || question.options.length === 0) {
          invalid++;
          errors.push(`Question at index ${index}: Invalid options array`);
        } else {
          valid++;
        }
      });

      return { valid, invalid, errors };
    } catch /* (error) */ {
      if (process.env.NODE_ENV === "development") {
        //console.error("🔴 Error validating questions:", error);
      }
      return { valid: 0, invalid: 0, errors: [] };
    }
  }

  // 🆕 Debug helper - find questions by partial ID
  static findQuestionsByPartialId(partialId: string): Question[] {
    const questions = this.getQuestions();
    return questions.filter((q) => q.id.includes(partialId));
  }

  // 🆕 Debug helper - list all question IDs
  static getAllQuestionIds(): string[] {
    const questions = this.getQuestions();
    return questions.map((q) => q.id);
  }

  // ===== TOPIC EXPLAINER STORAGE METHODS =====

  // Get all saved topic content
  static getSavedTopics(): SavedTopicContent[] {
    if (typeof window === "undefined") {
      return [];
    }
    try {
      const allTopics: SavedTopicContent[] = [];
      for (const subject in this.cache.topics) {
        const subjectTopics = this.cache.topics[subject];
        if (subjectTopics && Array.isArray(subjectTopics)) {
          allTopics.push(...subjectTopics);
        }
      }
      return allTopics;
    } catch {
      return [];
    }
  }

  // Save topic content with subject-based key
  static saveTopic(
    topic: string,
    subject: string,
    content: string,
    stepData?: TopicStepData[],
  ): SavedTopicContent {
    const savedTopic: SavedTopicContent = {
      id: `topic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      topic,
      subject,
      content,
      ...(stepData && { stepData }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Use subject-based key for storage
    const topics = this.getTopicsBySubject(subject);
    topics.push(savedTopic);
    this.saveTopicsBySubject(subject, topics);

    return savedTopic;
  }

  // Update topic content
  static updateTopic(id: string, updates: Partial<Omit<SavedTopicContent, "id">>): boolean {
    const topics = this.getSavedTopics();
    const index = topics.findIndex((t) => t.id === id);
    if (index === -1) {
      return false;
    }

    const topicToUpdate = topics[index];
    if (!topicToUpdate) {
      return false;
    }

    const updatedTopic = {
      ...topicToUpdate,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Update in the specific subject's storage
    const subjectTopics = this.getTopicsBySubject(topicToUpdate.subject);
    const subjectIndex = subjectTopics.findIndex((t) => t.id === id);
    if (subjectIndex !== -1) {
      subjectTopics[subjectIndex] = updatedTopic;
      this.saveTopicsBySubject(topicToUpdate.subject, subjectTopics);
      return true;
    }

    return false;
  }

  // Delete topic content
  static deleteTopic(id: string): boolean {
    const topics = this.getSavedTopics();
    const topicToDelete = topics.find((t) => t.id === id);
    if (!topicToDelete) {
      return false;
    }

    const subjectTopics = this.getTopicsBySubject(topicToDelete.subject);
    const filtered = subjectTopics.filter((t) => t.id !== id);

    if (filtered.length === subjectTopics.length) {
      return false;
    }

    this.saveTopicsBySubject(topicToDelete.subject, filtered);
    return true;
  }

  // Get topic by ID
  static getTopicById(id: string): SavedTopicContent | null {
    const topics = this.getSavedTopics();
    return topics.find((t) => t.id === id) || null;
  }

  // Get topics by subject (subject-based organization)
  static getTopicsBySubject(subject: string): SavedTopicContent[] {
    if (typeof window === "undefined") {
      return [];
    }
    return this.cache.topics[subject] || [];
  }

  // Get topics by topic name
  static getTopicsByTopic(topic: string): SavedTopicContent[] {
    const topics = this.getSavedTopics();
    return topics.filter((t) => t.topic === topic);
  }

  // Clear all topics for a specific subject
  static clearTopicsBySubject(subject: string): number {
    const topics = this.getTopicsBySubject(subject);
    const removedCount = topics.length;

    if (removedCount > 0) {
      delete this.cache.topics[subject];
      const subjectKey = `mindhouse_topic_explainer_${subject}`;
      localforage.removeItem(subjectKey).catch(console.error);
    }

    return removedCount;
  }

  // Private method to save topics for a specific subject
  private static saveTopicsBySubject(subject: string, topics: SavedTopicContent[]): void {
    if (typeof window === "undefined") {
      return;
    }
    this.cache.topics[subject] = topics;
    const subjectKey = `mindhouse_topic_explainer_${subject}`;
    localforage.setItem(subjectKey, topics).catch(console.error);
  }

  // 🆕 Bulk sync all localStorage flashcards to Supabase
  static async syncAllFlashcardsToSupabase(): Promise<{
    success: number;
    errors: number;
  }> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        if (process.env.NODE_ENV === "development") {
        }
        return { success: 0, errors: 0 };
      }

      const flashcards = this.getFlashcards();
      if (flashcards.length === 0) {
        return { success: 0, errors: 0 };
      }

      const response = await fetch("/api/flashcards/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          flashcards: flashcards.map((fc) => ({
            question: fc.question,
            answer: fc.answer,
            explanation: fc.explanation,
            topic: fc.topic,
            difficulty: fc.difficulty,
            subject: fc.subject,
            confidence: fc.confidence || 0,
            reviewCount: fc.reviewCount || 0,
            createdAt: fc.createdAt,
            lastReviewed: fc.lastReviewed,
            nextReview: fc.nextReview,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Bulk sync failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (process.env.NODE_ENV === "development") {
      }

      return { success: result.created || 0, errors: 0 };
    } catch {
      if (process.env.NODE_ENV === "development") {
        //console.error("🔴 Error syncing flashcards to Supabase");
      }
      return { success: 0, errors: 1 };
    }
  }

  // 🆕 Load flashcards from Supabase and merge with localStorage (Enhanced)
  static async loadFlashcardsFromSupabase(): Promise<{
    loaded: number;
    merged: number;
    authStatus: "authenticated" | "unauthenticated" | "error";
  }> {
    try {
      const userId = await this.getCurrentUserId();

      if (!userId) {
        return { loaded: 0, merged: 0, authStatus: "unauthenticated" };
      }

      const response = await fetch(`/api/flashcards?userId=${userId}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401) {
          // Guest or expired session: keep using local data
          return { loaded: 0, merged: 0, authStatus: "unauthenticated" };
        }

        if (response.status === 404) {
          // User has no flashcards in Supabase yet
          return { loaded: 0, merged: 0, authStatus: "unauthenticated" };
        }

        // Handle specific error cases
        if (response.status === 500 && errorData.details?.includes("does not exist")) {
          return { loaded: 0, merged: 0, authStatus: "unauthenticated" };
        }

        return { loaded: 0, merged: 0, authStatus: "error" };
      }

      const supabaseFlashcards = await response.json();
      if (!Array.isArray(supabaseFlashcards)) {
        throw new Error("Invalid response format from Supabase");
      }

      const localFlashcards = this.getFlashcards();

      // Simple merge: add Supabase flashcards that don't exist locally
      const localIds = new Set(localFlashcards.map((fc) => fc.id));

      // Type-safe interface for Supabase flashcard data
      interface SupabaseFlashcard {
        id: string;
        question: string;
        answer: string;
        explanation?: string;
        topic?: string;
        difficulty?: string;
        subject: string;
        created_at: string;
        review_count?: number;
        confidence?: number;
        last_reviewed?: string;
        next_review?: string;
      }

      const newFlashcards = supabaseFlashcards.filter(
        (fc: SupabaseFlashcard) => !localIds.has(fc.id),
      );

      if (newFlashcards.length > 0) {
        const mergedFlashcards = [
          ...localFlashcards,
          ...newFlashcards.map((fc: SupabaseFlashcard) => ({
            id: fc.id,
            question: fc.question,
            answer: fc.answer,
            explanation: fc.explanation || "",
            topic: fc.topic || "",
            difficulty: fc.difficulty || "medium",
            subject: fc.subject,
            createdAt: new Date(fc.created_at),
            reviewCount: fc.review_count || 0,
            confidence: fc.confidence || 0,
            ...(fc.last_reviewed && {
              lastReviewed: new Date(fc.last_reviewed),
            }),
            ...(fc.next_review && { nextReview: new Date(fc.next_review) }),
          })),
        ];

        this.saveFlashcards(mergedFlashcards);

        if (process.env.NODE_ENV === "development") {
        }
      }

      return {
        loaded: supabaseFlashcards.length,
        merged: newFlashcards.length,
        authStatus: "authenticated",
      };
    } catch {
      // Don't throw error, just return empty result to allow localStorage fallback
      return { loaded: 0, merged: 0, authStatus: "error" };
    }
  }

  // 🆕 Enhanced method to check if user has authenticated access to cloud data
  static async checkCloudDataAccess(): Promise<{
    hasAccess: boolean;
    isAuthenticated: boolean;
    userId: string | null;
  }> {
    try {
      const userId = await this.getCurrentUserId();
      const isAuthenticated = Boolean(userId);

      if (!isAuthenticated) {
        return { hasAccess: false, isAuthenticated: false, userId: null };
      }

      // Try a simple query to check access
      const response = await fetch(`/api/flashcards/check-access?userId=${userId}`);
      const hasAccess = response.ok;

      return { hasAccess, isAuthenticated, userId };
    } catch {
      return { hasAccess: false, isAuthenticated: false, userId: null };
    }
  }

  // 🆕 Force refresh flashcards from all sources
  static async refreshAllFlashcards(): Promise<{
    local: number;
    cloud: number;
    merged: number;
    authStatus: string;
  }> {
    try {
      // Get current local count (not needed for this operation)
      // const localFlashcards = this.getFlashcards();
      // Note: localCount is available if needed for debugging
      // const localCount = localFlashcards.length;

      // Attempt cloud sync
      const cloudResult = await this.loadFlashcardsFromSupabase();

      // Get updated local count after merge
      const updatedLocalFlashcards = this.getFlashcards();
      const updatedLocalCount = updatedLocalFlashcards.length;

      return {
        local: updatedLocalCount,
        cloud: cloudResult.loaded,
        merged: cloudResult.merged,
        authStatus: cloudResult.authStatus,
      };
    } catch {
      const localFlashcards = this.getFlashcards();
      return {
        local: localFlashcards.length,
        cloud: 0,
        merged: 0,
        authStatus: "error",
      };
    }
  }
}
