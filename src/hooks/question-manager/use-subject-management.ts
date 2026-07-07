import { useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import { SubjectService, QuestionService } from "@/services/supabase-service";
import { UnifiedStorageService } from "@/services/unified-storage-service";
import { shouldUseDemoData, getDemoSubjects } from "@/data/demo-data";
import type { Subject } from "@/types/question-manager";
import type { Question } from "@/lib/types";

export const useSubjectManagement = (
  isAuthenticated: boolean,
  setSubjects: (subjects: Subject[]) => void,
  setIsLoadingSubjects: (loading: boolean) => void,
) => {
  const t = useTranslations("QuestionManager");
  const locale = useLocale();
  const { toast } = useToast();

  // Function to calculate real question count for subjects
  const calculateRealQuestionCount = async (subjects: Subject[]): Promise<Subject[]> => {
    try {
      // Load questions from both localStorage and Supabase (like Quiz page does)
      let allQuestions: Question[] = [];

      if (isAuthenticated) {
        try {
          // Try to load from Supabase first
          const dbQuestions = await QuestionService.getQuestions();
          const cloudQuestions = dbQuestions.map(question => ({
            id: question.id,
            subject: question.subject,
            type: question.type as "multiple-choice" | "true-false" | "calculation" | "case-study",
            difficulty: question.difficulty as "Easy" | "Medium" | "Hard",
            text: question.text,
            options: JSON.parse(question.options || "[]"),
            explanation: question.explanation,
            topic: question.topic || "",
            formula: question.formula || "",
          }));
          allQuestions = [...cloudQuestions];
        } catch {
          //do nothing
        }
      }

      // Also get local questions and merge
      const localQuestions = UnifiedStorageService.getQuestions();
      localQuestions.forEach(localQ => {
        if (!allQuestions.find(cloudQ => cloudQ.id === localQ.id)) {
          allQuestions.push(localQ);
        }
      });
      const updatedSubjects = subjects.map(subject => {
        const subjectQuestions = allQuestions.filter(q => {
          const normalizedQuestionSubject = q.subject.trim().toLowerCase();
          const normalizedSubjectName = subject.name.trim().toLowerCase();
          return normalizedQuestionSubject === normalizedSubjectName;
        });
        return {
          ...subject,
          questionCount: subjectQuestions.length,
        };
      });

      return updatedSubjects;
    } catch {
      // If calculation fails, return subjects with original counts
      return subjects;
    }
  };

  // Load subjects - Use same simple logic as Subject Manager
  const loadSubjects = useCallback(async () => {
    try {
      setIsLoadingSubjects(true);
      let loadedSubjects: Subject[] = [];

      // Check if demo mode is active
      const isDemoMode = shouldUseDemoData();
      if (isDemoMode) {
        // Load demo subjects
        const localizedDemoSubjects = getDemoSubjects(locale);
        
        loadedSubjects = localizedDemoSubjects.map((demoSubject: any) => ({
          id: demoSubject.id,
          name: demoSubject.name,
          description: demoSubject.description,
          category: demoSubject.category,
          difficulty: demoSubject.difficulty,
          questionCount: demoSubject.questionCount,
          isActive: demoSubject.isActive,
        }));
      } else {
        // Always load local subjects first
        const localSubjects = UnifiedStorageService.getSubjects();
        loadedSubjects = [...localSubjects];

        if (isAuthenticated) {
          try {
            const dbSubjects = await SubjectService.getSubjects();
            if (dbSubjects && dbSubjects.length > 0) {
              // Convert Supabase format to local format
              const mappedDbSubjects = dbSubjects.map(subject => ({
                id: subject.id,
                name: subject.name,
                description: subject.description,
                category: subject.category,
                difficulty: subject.difficulty,
                questionCount: subject.question_count,
                isActive: subject.is_active,
              }));

              // Merge local and db subjects
              mappedDbSubjects.forEach(dbSub => {
                const existingIndex = loadedSubjects.findIndex(ls => ls.id === dbSub.id);
                if (existingIndex !== -1) {
                  loadedSubjects[existingIndex] = dbSub;
                } else {
                  loadedSubjects.push(dbSub);
                }
              });

              // Save to localStorage for future use
              UnifiedStorageService.saveSubjects(loadedSubjects);
            }
          } catch {
            // Silent fail - continue with local subjects
          }
        }
      }
      // Calculate real question count for all subjects (skip in demo mode)
      if (isDemoMode) {
        // In demo mode, use the predefined question counts
        setSubjects(loadedSubjects);
      } else {
        const subjectsWithRealCounts = await calculateRealQuestionCount(loadedSubjects);
        setSubjects(subjectsWithRealCounts);
      }
    } catch {
      toast({
        title: t("error"),
        description: t("loadSubjectsError"),
        variant: "destructive",
      });
    } finally {
      setIsLoadingSubjects(false);
    }
  }, [isAuthenticated, toast, setSubjects, setIsLoadingSubjects, locale, t]);

  return {
    loadSubjects,
    calculateRealQuestionCount,
    UnifiedStorageService,
  };
};
