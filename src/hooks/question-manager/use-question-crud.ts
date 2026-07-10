import { useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import { QuestionService } from "@/services/supabase-service";
import { UnifiedStorageService } from "@/services/unified-storage-service";
import { shouldUseDemoData, getDemoQuestions, getAllDemoQuestions } from "@/data/demo-data";
import type { Question } from "@/lib/types";
import type { InsertTables, UpdateTables } from "@/lib/supabase";
import type { Subject, QuestionFormData } from "@/types/question-manager";

export const useQuestionCRUD = (
  isAuthenticated: boolean,
  setQuestions: (questions: Question[] | ((prev: Question[]) => Question[])) => void,
  subjects: Subject[],
  setSubjects: (subjects: Subject[]) => void,
  calculateRealQuestionCount: (subjects: Subject[]) => Promise<Subject[]>,
) => {
  const t = useTranslations("QuestionManager");
  const locale = useLocale();
  const { toast } = useToast();

  // Load questions
  const loadQuestions = useCallback(
    async (selectedSubject: string) => {
      try {
        let loadedQuestions: Question[] = [];

        // Check if demo mode is active
        const isDemoMode = shouldUseDemoData();

        if (isDemoMode) {
          // Load demo questions

          if (selectedSubject && selectedSubject.trim() !== "") {
            const demoQuestions = getDemoQuestions(selectedSubject, locale);

            // Convert demo questions to Question format
            loadedQuestions = demoQuestions.map((demoQ: any) => ({
              id: demoQ.id,
              subject: selectedSubject,
              type: "multiple-choice" as const,
              difficulty:
                demoQ.difficulty === "Başlangıç"
                  ? ("Easy" as const)
                  : demoQ.difficulty === "İleri"
                    ? ("Hard" as const)
                    : ("Medium" as const),
              text: demoQ.question,
              options: demoQ.options.map((opt: any, index: number) => ({
                text: opt,
                isCorrect: index === demoQ.correctAnswer,
              })),
              explanation: demoQ.explanation,
              topic: demoQ.tags?.[0] || "",
              formula: "",
            }));
          } else {
            // Load all demo questions
            const allDemoQuestions = getAllDemoQuestions(locale);

            loadedQuestions = allDemoQuestions.map((demoQ: any) => ({
              id: demoQ.id,
              subject: demoQ.subjectId.includes("matematik")
                ? "Matematik"
                : demoQ.subjectId.includes("fizik")
                  ? "Fizik"
                  : demoQ.subjectId.includes("kimya")
                    ? "Kimya"
                    : demoQ.subjectId.includes("tarih")
                      ? "Tarih"
                      : demoQ.subjectId.includes("biyoloji")
                        ? "Biyoloji"
                        : demoQ.subjectId.includes("edebiyat")
                          ? "Türk Dili ve Edebiyatı"
                          : demoQ.subjectId.includes("ingilizce")
                            ? "İngilizce"
                            : "Genel",
              type: "multiple-choice" as const,
              difficulty:
                demoQ.difficulty === "Başlangıç"
                  ? ("Easy" as const)
                  : demoQ.difficulty === "İleri"
                    ? ("Hard" as const)
                    : ("Medium" as const),
              text: demoQ.question,
              options: demoQ.options.map((opt: any, index: number) => ({
                text: opt,
                isCorrect: index === demoQ.correctAnswer,
              })),
              explanation: demoQ.explanation,
              topic: demoQ.tags?.[0] || "",
              formula: "",
            }));
          }
        } else if (isAuthenticated) {
          try {
            if (selectedSubject && selectedSubject.trim() !== "") {
              // Load questions for specific subject from both Supabase and local storage

              const dbQuestions = await QuestionService.getQuestionsBySubject(selectedSubject);
              const cloudQuestions = dbQuestions.map((question) => ({
                id: question.id,
                subject: question.subject,
                type: question.type as
                  "multiple-choice" | "true-false" | "calculation" | "case-study",
                difficulty: question.difficulty as "Easy" | "Medium" | "Hard",
                text: question.text,
                options: JSON.parse(question.options || "[]"),
                explanation: question.explanation,
                topic: question.topic || "",
                formula: question.formula || "",
              }));

              // Also get local questions for the same subject
              const localQuestions = UnifiedStorageService.getQuestionsBySubject(selectedSubject);

              // Merge both lists, avoiding duplicates by ID (prioritize cloud data)
              const allQuestions = [...cloudQuestions];
              localQuestions.forEach((localQ) => {
                if (!allQuestions.find((cloudQ) => cloudQ.id === localQ.id)) {
                  allQuestions.push({
                    ...localQ,
                    topic: localQ.topic || "",
                    formula: localQ.formula || "",
                  });
                }
              });

              loadedQuestions = allQuestions;
            } else {
              // Load all questions from Supabase when authenticated
              const dbQuestions = await QuestionService.getQuestions();
              const cloudQuestions = dbQuestions.map((question) => ({
                id: question.id,
                subject: question.subject,
                type: question.type as
                  "multiple-choice" | "true-false" | "calculation" | "case-study",
                difficulty: question.difficulty as "Easy" | "Medium" | "Hard",
                text: question.text,
                options: JSON.parse(question.options || "[]"),
                explanation: question.explanation,
                topic: question.topic || "",
                formula: question.formula || "",
              }));

              // Also get local questions
              const localQuestions = UnifiedStorageService.getQuestions();

              // Merge both lists, avoiding duplicates by ID (prioritize cloud data)
              const allQuestions = [...cloudQuestions];
              localQuestions.forEach((localQ) => {
                if (!allQuestions.find((cloudQ) => cloudQ.id === localQ.id)) {
                  allQuestions.push({
                    ...localQ,
                    topic: localQ.topic || "",
                    formula: localQ.formula || "",
                  });
                }
              });
              loadedQuestions = allQuestions;
            }
          } catch {
            // Fallback to unified storage on Supabase error
            if (selectedSubject && selectedSubject.trim() !== "") {
              loadedQuestions = UnifiedStorageService.getQuestionsBySubject(selectedSubject);
            } else {
              loadedQuestions = UnifiedStorageService.getQuestions();
            }
          }
        } else {
          // Load from unified storage if not authenticated
          if (selectedSubject && selectedSubject.trim() !== "") {
            loadedQuestions = UnifiedStorageService.getQuestionsBySubject(selectedSubject);
          } else {
            loadedQuestions = UnifiedStorageService.getQuestions();
          }
        }
        setQuestions(loadedQuestions);
      } catch {
        toast({
          title: t("error"),
          description: t("loadQuestionsError"),
          variant: "destructive",
        });
      }
    },
    [isAuthenticated, toast, setQuestions, locale, t],
  );

  // Create question
  const createQuestion = useCallback(
    async (formData: QuestionFormData) => {
      if (!formData.subject || !formData.text || !formData.explanation) {
        toast({
          title: t("error"),
          description: t("fillRequiredFields"),
          variant: "destructive",
        });
        return false;
      }

      if (formData.type === "Çoktan Seçmeli" && formData.options.length < 2) {
        toast({
          title: t("error"),
          description: t("minOptionsRequired"),
          variant: "destructive",
        });
        return false;
      }

      try {
        const newQuestion: Omit<Question, "id"> = {
          subject: formData.subject,
          type:
            formData.type === "Çoktan Seçmeli"
              ? "multiple-choice"
              : formData.type === "Doğru/Yanlış"
                ? "true-false"
                : formData.type === "Hesaplama"
                  ? "calculation"
                  : "case-study",
          difficulty:
            formData.difficulty === "Kolay"
              ? "Easy"
              : formData.difficulty === "Orta"
                ? "Medium"
                : "Hard",
          text: formData.text,
          options: formData.options,
          explanation: formData.explanation,
          topic: formData.topic,
          formula: formData.formula,
        };

        let createdQuestion: Question;

        if (isAuthenticated) {
          try {
            // Find the subject ID from the subjects list
            const subject = subjects.find((s) => s.name === formData.subject);
            const subjectId =
              subject?.id ||
              `subject_${formData.subject.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now()}`;

            // Convert to database format
            const dbQuestion: InsertTables<"questions"> = {
              subject_id: subjectId,
              subject: formData.subject,
              topic: formData.topic || "",
              type: newQuestion.type,
              difficulty: newQuestion.difficulty,
              text: newQuestion.text,
              options: JSON.stringify(newQuestion.options),
              correct_answer:
                newQuestion.options.find((opt) => opt.isCorrect)?.text ||
                newQuestion.options[0]?.text ||
                "",
              explanation: newQuestion.explanation,
              formula: newQuestion.formula || "",
            };

            const result = await QuestionService.createQuestion(dbQuestion);

            if (result) {
              // Convert database result to local Question type
              createdQuestion = {
                id: result.id,
                subject: result.subject,
                type: result.type as
                  "multiple-choice" | "true-false" | "calculation" | "case-study",
                difficulty: result.difficulty as "Easy" | "Medium" | "Hard",
                text: result.text,
                options: JSON.parse(result.options || "[]"),
                explanation: result.explanation,
                topic: result.topic || "",
                formula: result.formula || "",
              };
            } else {
              createdQuestion = UnifiedStorageService.addQuestion(newQuestion);
            }
          } catch {
            // Fallback to unified storage on Supabase error
            createdQuestion = UnifiedStorageService.addQuestion(newQuestion);
          }
        } else {
          createdQuestion = UnifiedStorageService.addQuestion(newQuestion);
        }

        setQuestions((prev: Question[]) => [...prev, createdQuestion]);

        // Recalculate question count for subjects
        const updatedSubjects = await calculateRealQuestionCount(subjects);
        setSubjects(updatedSubjects);

        toast({
          title: t("success"),
          description: t("questionCreated"),
        });

        return true;
      } catch {
        toast({
          title: t("error"),
          description: t("questionCreateError"),
          variant: "destructive",
        });
        return false;
      }
    },
    [isAuthenticated, subjects, calculateRealQuestionCount, toast, setQuestions, setSubjects, t],
  );

  // Update question
  const updateQuestion = useCallback(
    async (editingQuestion: Question) => {
      if (!editingQuestion) {
        return false;
      }

      try {
        let updateSuccess = false;

        if (isAuthenticated) {
          try {
            // Find the subject ID from the subjects list
            const subject = subjects.find((s) => s.name === editingQuestion.subject);
            const subjectId =
              subject?.id ||
              `subject_${editingQuestion.subject.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now()}`;

            const updateData: UpdateTables<"questions"> = {
              subject_id: subjectId,
              subject: editingQuestion.subject,
              topic: editingQuestion.topic || "",
              type: editingQuestion.type,
              difficulty: editingQuestion.difficulty,
              text: editingQuestion.text,
              options: JSON.stringify(editingQuestion.options),
              correct_answer:
                editingQuestion.options.find((opt) => opt.isCorrect)?.text ||
                editingQuestion.options[0]?.text ||
                "",
              explanation: editingQuestion.explanation,
              formula: editingQuestion.formula || "",
            };

            const result = await QuestionService.updateQuestion(editingQuestion.id, updateData);

            if (result) {
              updateSuccess = true;
            } else {
              const localUpdateSuccess = UnifiedStorageService.updateQuestion(
                editingQuestion.id,
                editingQuestion,
              );
              updateSuccess = localUpdateSuccess;
            }
          } catch {
            // Fallback to unified storage on Supabase error
            const localUpdateSuccess = UnifiedStorageService.updateQuestion(
              editingQuestion.id,
              editingQuestion,
            );
            updateSuccess = localUpdateSuccess;
          }
        } else {
          // Not authenticated, use localStorage only
          const localUpdateSuccess = UnifiedStorageService.updateQuestion(
            editingQuestion.id,
            editingQuestion,
          );
          updateSuccess = localUpdateSuccess;
        }

        // Always update state if any storage method succeeded
        if (updateSuccess) {
          setQuestions((prev: Question[]) =>
            prev.map((q: Question) => (q.id === editingQuestion.id ? editingQuestion : q)),
          );

          // Recalculate question count for subjects
          try {
            const updatedSubjects = await calculateRealQuestionCount(subjects);
            setSubjects(updatedSubjects);
          } catch {
            // Warning ignored for lint
          }

          toast({
            title: t("success"),
            description: t("questionUpdated"),
          });

          return true;
        } else {
          toast({
            title: t("error"),
            description: t("questionUpdateError"),
            variant: "destructive",
          });
          return false;
        }
      } catch {
        toast({
          title: t("error"),
          description: t("questionUpdateErrorGeneric"),
          variant: "destructive",
        });
        return false;
      }
    },
    [isAuthenticated, subjects, calculateRealQuestionCount, toast, setQuestions, setSubjects, t],
  );

  // Delete question
  const deleteQuestion = useCallback(
    async (questionId: string) => {
      try {
        if (isAuthenticated) {
          try {
            await QuestionService.deleteQuestion(questionId);
          } catch {
            // Fallback to unified storage on Supabase error
            UnifiedStorageService.deleteQuestion(questionId);
          }
        } else {
          UnifiedStorageService.deleteQuestion(questionId);
        }

        setQuestions((prev: Question[]) => prev.filter((q: Question) => q.id !== questionId));

        // Recalculate question count for subjects
        const updatedSubjects = await calculateRealQuestionCount(subjects);
        setSubjects(updatedSubjects);

        toast({
          title: t("success"),
          description: t("questionDeleted"),
        });

        return true;
      } catch {
        toast({
          title: t("error"),
          description: t("questionDeleteError"),
          variant: "destructive",
        });
        return false;
      }
    },
    [isAuthenticated, subjects, calculateRealQuestionCount, toast, setQuestions, setSubjects, t],
  );

  return {
    loadQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    UnifiedStorageService,
  };
};
