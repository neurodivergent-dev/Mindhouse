import { useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import { QuestionService } from "@/services/supabase-service";
import { UnifiedStorageService } from "@/services/unified-storage-service";
import type { Question, Answer } from "@/lib/types";
import type { InsertTables } from "@/lib/supabase";
import type { AIGeneratedQuestion, AIGenerationResult, Subject } from "@/types/question-manager";
import { getStoredAiPreferences, isAiConfigured } from "@/lib/ai-preferences";

export const useAIGeneration = (
  isAuthenticated: boolean,
  questions: Question[],
  setAIGeneratedQuestions: (questions: AIGeneratedQuestion[]) => void,
  setAIGenerationResult: (result: AIGenerationResult | null) => void,
  setIsGeneratingAI: (loading: boolean) => void,
  setIsCreating: (creating: boolean) => void,
  _loadQuestions: (selectedSubject?: string) => Promise<void>,
  subjects: Subject[],
  setSubjects: (subjects: Subject[]) => void,
  setQuestions: (questions: Question[] | ((prev: Question[]) => Question[])) => void,
  calculateRealQuestionCount: (subjects: Subject[]) => Promise<Subject[]>,
) => {
  const t = useTranslations("QuestionManager");
  const locale = useLocale();
  const { toast } = useToast();

  // Generate AI questions
  const generateQuestions = useCallback(async (formData: {
    subject: string;
    topic: string;
    type: "multiple-choice" | "true-false" | "calculation" | "case-study";
    difficulty: "Easy" | "Medium" | "Hard";
    count: number;
    guidelines: string;
  }) => {
    try {
      setIsGeneratingAI(true);
      setAIGeneratedQuestions([]);
      setAIGenerationResult(null);

      // Import the AI question generation service
      const { generateQuestions: aiGenerateQuestions } = await import("@/ai/flows/question-generator");

      // Get existing questions to avoid duplicates
      const existingQuestions = questions
        .filter(q => q.subject === formData.subject && q.topic === formData.topic)
        .map(q => q.text);

      // Load AI preferences from localStorage (centralized)
      const aiPreferences = getStoredAiPreferences();
      if (!isAiConfigured(aiPreferences)) {
        toast({
          title: t("aiServiceError"),
          description: t("aiApiKeyError") || "AI service configuration error. Please check your API key in Settings.",
          variant: "destructive",
        });
        return;
      }

      // Call the AI service
      const result = await aiGenerateQuestions({
        subject: formData.subject,
        topic: formData.topic,
        difficulty: formData.difficulty,
        type: formData.type,
        count: formData.count,
        language: locale === "en" ? "en" : "tr",
        existingQuestions: existingQuestions.length > 0 ? existingQuestions : undefined,
        guidelines: formData.guidelines || undefined,
      }, aiPreferences);

      // Ensure type compatibility by handling optional properties
      const compatibleQuestions: AIGeneratedQuestion[] = result.questions.map((q) => ({
        ...q,
        formula: q.formula || "",
        topic: q.topic || formData.topic || "",
        difficulty: q.difficulty || formData.difficulty || "Medium",
        keywords: q.keywords || [],
        learningObjective: q.learningObjective || "",
      }));

      const compatibleResult: AIGenerationResult = {
        ...result,
        questions: compatibleQuestions,
        qualityScore: result.qualityScore || 0.8,
        suggestions: Array.isArray(result.suggestions) ? result.suggestions : (result.suggestions ? [result.suggestions] : []),
        metadata: result.metadata || {
          totalGenerated: compatibleQuestions.length,
          subject: formData.subject || "",
          topic: formData.topic || "",
          averageDifficulty: formData.difficulty || "Medium",
          generationTimestamp: new Date().toISOString(),
        }
      };

      setAIGeneratedQuestions(compatibleQuestions);
      setAIGenerationResult(compatibleResult);

      toast({
        title: t("success"),
        description: t("aiQuestionsGenerated", { count: result.questions.length }),
      });
    } catch (error) {
      // Check if it's an API key issue
      if (error instanceof Error && /api key|not configured/i.test(error.message)) {
        toast({
          title: t("aiServiceError"),
          description: t("aiApiKeyError"),
          variant: "destructive",
        });
      } else {
        toast({
          title: t("error"),
          description: t("aiGenerateError"),
          variant: "destructive",
        });
      }
    } finally {
      setIsGeneratingAI(false);
    }
  }, [questions, toast, locale, t, setAIGeneratedQuestions, setAIGenerationResult, setIsGeneratingAI]); 

  // Approve AI questions
  const approveAIQuestions = useCallback(async (
    questionsToAdd: AIGeneratedQuestion[],
    subject: string,
  ) => {
    try {
      setIsCreating(true);

      const newQuestions: Omit<Question, "id">[] = questionsToAdd.map((q) => ({
        subject,
        type: "multiple-choice",
        difficulty: q.difficulty,
        text: q.text,
        options: q.options,
        explanation: q.explanation,
        topic: q.topic,
        formula: q.formula || "",
      }));

      const createdQuestions: Question[] = [];

      for (const question of newQuestions) {
        if (isAuthenticated) {
          try {
            // Convert to database format
            // Find the subject ID from the subjects list
            const subjectObj = subjects.find(s => s.name === subject);
            const subjectId = subjectObj?.id || `subject_${subject.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now()}`;

            const dbQuestion: InsertTables<"questions"> = {
              subject_id: subjectId,
              subject: question.subject,
              topic: question.topic || "",
              type: question.type,
              difficulty: question.difficulty,
              text: question.text,
              options: JSON.stringify(question.options),
              correct_answer: question.options.find(opt => opt.isCorrect)?.text || question.options[0]?.text || "",
              explanation: question.explanation,
              formula: question.formula || "",
            };

            // Add timeout to prevent hanging
            const createQuestionWithTimeout = async () => Promise.race([
                QuestionService.createQuestion(dbQuestion),
                new Promise((_, reject) =>
                  setTimeout(() => reject(new Error('Supabase request timeout after 10 seconds')), 10000),
                ),
              ]);

            const result = await createQuestionWithTimeout() as Question | null;

            if (result) {
              // Convert database result to local Question type
              const createdQuestion: Question = {
                id: result.id,
                subject: result.subject,
                type: result.type,
                difficulty: result.difficulty,
                text: result.text,
                options: (typeof result.options === 'string' ? JSON.parse(result.options || "[]") : result.options || []) as Answer[],
                explanation: result.explanation,
                topic: result.topic || "",
                formula: result.formula || "",
              };
              createdQuestions.push(createdQuestion);
            } else {
              // Fallback to unified storage
              const createdQuestion = UnifiedStorageService.addQuestion(question);
              createdQuestions.push(createdQuestion);
            }
          } catch {
            // Fallback to unified storage on Supabase error
            const createdQuestion = UnifiedStorageService.addQuestion(question);
            createdQuestions.push(createdQuestion);
          }
        } else {
          const createdQuestion = UnifiedStorageService.addQuestion(question);
          createdQuestions.push(createdQuestion);
        }
      }

      // Update questions state with new questions
      setQuestions((prev: Question[]) => [...prev, ...createdQuestions]);

      // Recalculate question count for subjects
      const updatedSubjects = await calculateRealQuestionCount(subjects);
      setSubjects(updatedSubjects);

      toast({
        title: t("success"),
        description: t("aiQuestionsAdded", { count: questionsToAdd.length }),
      });

      return true;
    } catch {
      toast({
        title: t("error"),
        description: t("aiQuestionsAddError"),
        variant: "destructive",
      });
      return false;
    } finally {
      setIsCreating(false);
    }
  }, [isAuthenticated, subjects, calculateRealQuestionCount, toast, setIsCreating, setQuestions, setSubjects, t]); 

  return {
    generateQuestions,
    approveAIQuestions,
  };
};
