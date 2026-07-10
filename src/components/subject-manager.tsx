"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { getFormDifficultyLabel, getSubjectName } from "@/lib/question-manager-labels";
import type { Question } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  BookOpen,
  GraduationCap,
  Target,
  Brain,
  Database,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { shouldUseDemoData, getDemoSubjects } from "@/data/demo-data";
import { SubjectService } from "@/services/supabase-service";
import { supabase } from "@/lib/supabase";
import { UnifiedStorageService } from "@/services/unified-storage-service";

interface Subject {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  questionCount: number;
  isActive: boolean;
  createdBy?: string | undefined;
  createdAt?: string;
  updatedAt?: string;
}

interface SubjectManagerProps {
  onRefresh?: () => void;
  refreshTrigger?: number;
}

const SubjectManager = ({ onRefresh, refreshTrigger }: SubjectManagerProps) => {
  const t = useTranslations("SubjectManager");
  const tSubjects = useTranslations("Subjects");
  const locale = useLocale();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 21;
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    difficulty: "Orta",
  });
  const [useSupabase, setUseSupabase] = useState(false);
  const { toast } = useToast();

  const loadSubjects = async () => {
    try {
      setIsLoading(true);

      // Make sure the IndexedDB-backed cache is ready before reading
      await UnifiedStorageService.initialize();

      // Use demo data for demo mode
      if (shouldUseDemoData()) {
        const localizedDemoSubjects = getDemoSubjects(locale);
        setSubjects(localizedDemoSubjects);
        setUseSupabase(false);

        // Save demo subjects to localStorage for Question Manager to use
        UnifiedStorageService.saveSubjects(localizedDemoSubjects);
        return;
      }

      // Fetch data from API
      const response = await fetch("/api/subjects");
      const apiSubjects = await response.json();

      // If API returns demo data and demo mode is off, show empty state
      if (
        apiSubjects.length > 0 &&
        apiSubjects[0].createdBy === "demo_user_btk_2025" &&
        !shouldUseDemoData()
      ) {
        setSubjects([]);
        setUseSupabase(false);
        return;
      }

      // If API returns real data, use it
      if (
        apiSubjects.length > 0 &&
        apiSubjects[0].createdBy !== "demo_user_btk_2025"
      ) {
        setSubjects(apiSubjects);
        setUseSupabase(true);

        // Save API subjects to localStorage for Question Manager to use
        UnifiedStorageService.saveSubjects(apiSubjects);
        return;
      }

      // If API returns empty, check localStorage
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setUseSupabase(false);
        const localSubjects = UnifiedStorageService.getSubjects();

        // Calculate real question count using both localStorage and Supabase
        const getAllQuestions = async () => {
          let allQuestions: Question[] = [];

          try {
            // Check authentication
            const guestUser = localStorage.getItem("guestUser");
            const {
              data: { session: authSession },
            } = await supabase.auth.getSession();
            const isAuth = Boolean(guestUser || authSession);

            if (isAuth) {
              try {
                // Try to load from Supabase first
                const response = await fetch('/api/questions');
                if (response.ok) {
                  const dbQuestions = await response.json();
                  allQuestions = [...dbQuestions];
                }
              } catch {
                //do nothing
              }
            }

            // Also get local questions from IndexedDB and merge
            const localQuestions = UnifiedStorageService.getQuestions();
            localQuestions.forEach((localQ: Question) => {
              if (!allQuestions.find((cloudQ: Question) => cloudQ.id === localQ.id)) {
                allQuestions.push(localQ);
              }
            });

            return allQuestions;
          } catch {
            // Fallback to IndexedDB only
            return UnifiedStorageService.getQuestions();
          }
        };

        const questions = await getAllQuestions();
        // Calculate real question count for each subject
        const updatedSubjects = localSubjects.map((subject) => {
          const subjectQuestions = questions.filter((q: Question) => {
            const normalizedQuestionSubject = q.subject?.trim().toLowerCase();
            const normalizedSubjectName = subject.name.trim().toLowerCase();
            return normalizedQuestionSubject === normalizedSubjectName;
          });
          return {
            ...subject,
            questionCount: subjectQuestions.length,
          };
        });

        setSubjects(updatedSubjects);
        return;
      }

      setUseSupabase(true);

      // Fetch data from Supabase
      const supabaseSubjects = await SubjectService.getSubjects();
      const mappedSupabaseSubjects: Subject[] = supabaseSubjects.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        category: s.category,
        difficulty: s.difficulty,
        questionCount: s.question_count,
        isActive: s.is_active,
        createdBy: s.created_by,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
      }));

      // Merge localStorage and Supabase data
      const localSubjects = UnifiedStorageService.getSubjects();
      const mergedSubjects = [...localSubjects];

      // Check each subject in Supabase
      mappedSupabaseSubjects.forEach((supabaseSubject) => {
        const existingIndex = mergedSubjects.findIndex(
          (local) => local.id === supabaseSubject.id,
        );
        if (existingIndex !== -1) {
          // If same ID exists, update with Supabase data
          mergedSubjects[existingIndex] = supabaseSubject;
        } else {
          // If new subject, add it
          mergedSubjects.push(supabaseSubject);
        }
      });

      // Calculate real question count
      const getQuestionsFromStorage = () => {
        if (typeof window === "undefined") {
          return [];
        }
        try {
          return UnifiedStorageService.getQuestions();
        } catch {
          return [];
        }
      };

      const questions = getQuestionsFromStorage();

      // Calculate real question count for each subject from Supabase or localStorage fallback
      const updatedMergedSubjects = await Promise.all(
        mergedSubjects.map(async (subject) => {
          try {
            // Check if user is authenticated
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
              // Authenticated user - get from Supabase
              const { count } = await supabase
                .from('questions')
                .select('*', { count: 'exact', head: true })
                .eq('subject', subject.name);

              return {
                ...subject,
                questionCount: count || 0,
              };
            } else {
              // Guest user - use local IndexedDB fallback
              const questionCount = questions.filter(
                (q: { subject: string }) =>
                  q.subject?.trim().toLowerCase() === subject.name.trim().toLowerCase(),
              ).length;

              return {
                ...subject,
                questionCount,
              };
            }
          } catch {
            // Fallback to local IndexedDB data on error
            const questionCount = questions.filter(
              (q: { subject: string }) =>
                q.subject?.trim().toLowerCase() === subject.name.trim().toLowerCase(),
            ).length;

            return { ...subject, questionCount };
          }
        }),
      );

      setSubjects(updatedMergedSubjects);

      // Save merged subjects to localStorage for Question Manager to use
      if (updatedMergedSubjects.length > 0) {
        UnifiedStorageService.saveSubjects(updatedMergedSubjects);

      }
    } catch {
      //do nothing
      setSubjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubject = async () => {
    try {
      if (!formData.name || !formData.description || !formData.category) {
        toast({
          title: t("toasts.error"),
          description: t("toasts.fillAllFields"),
          variant: "destructive",
        });
        return;
      }

      const newSubject = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        difficulty: formData.difficulty,
        questionCount: 0,
        isActive: true,
      };

      if (useSupabase) {
        const result = await SubjectService.createSubject({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          difficulty: formData.difficulty,
          question_count: 0,
          is_active: true,
        });

        if (result) {
          const mappedSubject: Subject = {
            id: result.id,
            name: result.name,
            description: result.description,
            category: result.category,
            difficulty: result.difficulty,
            questionCount: result.question_count,
            isActive: result.is_active,
            createdBy: result.created_by,
            createdAt: result.created_at,
            updatedAt: result.updated_at,
          };
          setSubjects((prev) => [mappedSubject, ...prev]);
        }
      } else {
        const result = UnifiedStorageService.addSubject(newSubject);
        setSubjects((prev) => [result, ...prev]);
      }

      toast({
        title: t("toasts.success"),
        description: t("toasts.subjectAdded"),
      });

      setFormData({
        name: "",
        description: "",
        category: "",
        difficulty: "Orta",
      });
      setIsDialogOpen(false);

      // Call refresh callback if provided
      if (onRefresh) {
        onRefresh();
      }
    } catch {
      //do nothing
      toast({
        title: t("toasts.error"),
        description: t("toasts.addError"),
        variant: "destructive",
      });
    }
  };

  const handleEditSubject = async (subject: Subject) => {
    try {
      if (!formData.name || !formData.description || !formData.category) {
        toast({
          title: t("toasts.error"),
          description: t("toasts.fillAllFields"),
          variant: "destructive",
        });
        return;
      }

      if (useSupabase) {
        const result = await SubjectService.updateSubject(subject.id, {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          difficulty: formData.difficulty,
        });

        if (result) {
          const mappedSubject: Subject = {
            id: result.id,
            name: result.name,
            description: result.description,
            category: result.category,
            difficulty: result.difficulty,
            questionCount: result.question_count,
            isActive: result.is_active,
            createdBy: result.created_by,
            createdAt: result.created_at,
            updatedAt: result.updated_at,
          };
          setSubjects((prev) =>
            prev.map((s) => (s.id === subject.id ? mappedSubject : s)),
          );
        }
      } else {
        const result = UnifiedStorageService.updateSubject(subject.id, {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          difficulty: formData.difficulty,
        });

        if (result) {
          setSubjects((prev) =>
            prev.map((s) => (s.id === subject.id ? { ...s, ...formData } : s)),
          );
        }
      }

      toast({
        title: t("toasts.success"),
        description: t("toasts.subjectUpdated"),
      });

      setFormData({
        name: "",
        description: "",
        category: "",
        difficulty: "Orta",
      });
      setEditingSubject(null);
      setIsDialogOpen(false);

      // Call refresh callback if provided
      if (onRefresh) {
        onRefresh();
      }
    } catch {
      //do nothing
      toast({
        title: t("toasts.error"),
        description: t("toasts.updateError"),
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      if (useSupabase) {
        const success = await SubjectService.deleteSubject(id);
        if (success) {
          setSubjects((prev) => prev.filter((s) => s.id !== id));
        }
      } else {
        const success = UnifiedStorageService.deleteSubject(id);
        if (success) {
          setSubjects((prev) => prev.filter((s) => s.id !== id));
        }
      }

      toast({
        title: t("toasts.success"),
        description: t("toasts.subjectDeleted"),
      });

      // Call refresh callback if provided
      if (onRefresh) {
        onRefresh();
      }
    } catch {
      //do nothing
      toast({
        title: t("toasts.error"),
        description: t("toasts.deleteError"),
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      if (useSupabase) {
        const subject = subjects.find((s) => s.id === id);
        if (subject) {
          const result = await SubjectService.toggleActive(
            id,
            !subject.isActive,
          );
          if (result) {
            const mappedSubject: Subject = {
              id: result.id,
              name: result.name,
              description: result.description,
              category: result.category,
              difficulty: result.difficulty,
              questionCount: result.question_count,
              isActive: result.is_active,
            };
            setSubjects((prev) =>
              prev.map((s) => (s.id === id ? mappedSubject : s)),
            );
          }
        }
      } else {
        const subject = subjects.find((s) => s.id === id);
        if (subject) {
          const result = UnifiedStorageService.updateSubject(id, { isActive: !subject.isActive });
          if (result) {
            setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s)));
          }
        }
      }

      toast({
        title: t("toasts.success"),
        description: t("toasts.statusUpdated"),
      });
    } catch {
      //do nothing
      toast({
        title: t("toasts.error"),
        description: t("toasts.statusUpdateError"),
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      description: subject.description,
      category: subject.category,
      difficulty: subject.difficulty,
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingSubject(null);
    setFormData({
      name: "",
      description: "",
      category: "",
      difficulty: "Orta",
    });
    setIsDialogOpen(true);
  };

  useEffect(() => {
    loadSubjects().then(() => {
      // Notify parent after initial load
      if (onRefresh) {
        onRefresh();
      }
    });
  }, []);

  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      loadSubjects();
    }
  }, [refreshTrigger]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-transparent dark:!bg-none p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              {t("loading")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const filteredSubjects = subjects.filter((subject) => {
    const query = searchQuery.toLowerCase();
    const displayName = getSubjectName(subject.name, tSubjects).toLowerCase();
    const displayCategory = subject.category.toLowerCase();
    const displayDescription = (subject.description || "").toLowerCase();

    return (
      displayName.includes(query) ||
      displayCategory.includes(query) ||
      displayDescription.includes(query)
    );
  });

  const totalPages = Math.ceil(filteredSubjects.length / ITEMS_PER_PAGE);
  const paginatedSubjects = filteredSubjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto">

        {/* Actions Bar */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 mx-6 sm:mx-0">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 w-full h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus-visible:ring-blue-500"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={openAddDialog}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 h-11 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 w-full sm:w-auto"
              >
                <Plus className="w-5 h-5 mr-2" />
                {t("addNewSubject")}
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[90vw] sm:w-[95vw] max-w-md h-auto max-h-[85vh] flex flex-col p-6 border-0 rounded-[32px] overflow-hidden shadow-2xl bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-xl">
              <DialogHeader className="pb-3 border-b border-slate-100 dark:border-white/[0.05]">
                <DialogTitle className="text-base sm:text-lg font-black tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {editingSubject ? t("editSubject") : t("addNewSubject")}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-3">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{t("subjectName")}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder={t("exampleMath")}
                    className="w-full rounded-xl border-slate-200 dark:border-white/[0.08] dark:bg-white/[0.02] h-11 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{t("description")}</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder={t("subjectDescription")}
                    className="w-full rounded-xl border-slate-200 dark:border-white/[0.08] dark:bg-white/[0.02] h-11 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{t("category")}</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    placeholder={t("exampleScience")}
                    className="w-full rounded-xl border-slate-200 dark:border-white/[0.08] dark:bg-white/[0.02] h-11 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty" className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{t("difficultyLevel")}</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, difficulty: value }))
                    }
                  >
                    <SelectTrigger className="w-full rounded-xl border-slate-200 dark:border-white/[0.08] dark:bg-white/[0.02] h-11 font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-white/[0.08]">
                      <SelectItem value="Kolay">{t("difficultyEasy")}</SelectItem>
                      <SelectItem value="Orta">{t("difficultyMedium")}</SelectItem>
                      <SelectItem value="Zor">{t("difficultyHard")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    onClick={
                      editingSubject
                        ? () => {
                          void handleEditSubject(editingSubject);
                        }
                        : () => {
                          void handleAddSubject();
                        }
                    }
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 flex-1 h-12 text-base font-extrabold rounded-2xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {editingSubject ? t("update") : t("add")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1 h-12 text-base font-extrabold rounded-2xl border-slate-200 dark:border-white/[0.08] transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {t("cancel")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mx-6 sm:mx-0">
          {paginatedSubjects.map((subject) => (
            <div
              key={subject.id}
              className="apple-glass-card"
            >
              <div className="flex flex-col h-full w-full">
                {/* Header */}
                <div className="p-5 pb-3 flex items-start justify-between border-b border-gray-50 dark:border-gray-700">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 mt-0.5 rounded-xl flex items-center justify-center flex-shrink-0 ${subject.isActive ? 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-800/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      <BookOpen className={`w-5 h-5 ${subject.isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 shadow-sm ${subject.isActive ? 'bg-blue-500 shadow-blue-500/50' : 'bg-gray-300 dark:bg-gray-600'}`} />
                        <span className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 uppercase truncate">
                          {subject.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight line-clamp-2" title={getSubjectName(subject.name, tSubjects)}>
                        {getSubjectName(subject.name, tSubjects)}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 line-clamp-3 leading-relaxed flex-1" title={subject.description}>
                    {subject.description || t("noDescription")}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-auto">
                    <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 font-medium border-0 px-2.5 py-0.5 rounded-md">
                      {getFormDifficultyLabel(subject.difficulty, t)}
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-medium border-0 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5" />
                      {t("questionCount", { count: subject.questionCount })}
                    </Badge>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-4 py-3 bg-gray-50/80 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-700 rounded-b-2xl flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleActive(subject.id)}
                  className={`h-8 px-2 rounded-lg transition-colors ${subject.isActive ? 'text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30'}`}
                  title={subject.isActive ? t("deactivate") : t("activate")}
                >
                  {subject.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditDialog(subject)}
                  className="h-8 px-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-950/30 transition-colors"
                  title={t("edit")}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1"></div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteSubject(subject.id)}
                  className="h-8 px-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-950/30 transition-colors"
                  title={t("delete")}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-9 w-9 p-0 rounded-lg border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                  className={`h-9 w-9 p-0 rounded-lg transition-all ${currentPage === i + 1
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                >
                  {i + 1}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-9 w-9 p-0 rounded-lg border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {subjects.length > 0 && filteredSubjects.length === 0 && (
          <div className="text-center py-12 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 mx-6 sm:mx-0">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t("noResults")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t("noResultsFor", { query: searchQuery })}
            </p>
            <Button
              variant="outline"
              onClick={() => setSearchQuery("")}
              className="mt-4"
            >
              {t("clearSearch")}
            </Button>
          </div>
        )}

        {subjects.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-6 sm:mx-0">
            {/* Card 1: Add Subject */}
            <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 shadow-sm shadow-slate-200/60 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                {t("addFirstSubjectTitle")}
              </h3>
              <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mb-5">
                {t("addFirstSubjectDesc")}
              </p>
              <div className="mt-auto w-full">
                <Button
                  onClick={openAddDialog}
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-sm font-semibold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t("addSubject")}
                </Button>
              </div>
            </div>

            {/* Card 2: How It Works */}
            <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 shadow-sm shadow-slate-200/60 hover:border-green-300 dark:hover:border-green-700 transition-all duration-300 group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                {t("howItWorksTitle")}
              </h3>
              <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mb-5">
                {t("howItWorksDesc")}
              </p>
              <div className="mt-auto w-full flex flex-col gap-2 text-left">
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05]">
                  <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#e8e8ed]">{t("howItWorksAdd")}</span>
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05]">
                  <Target className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#e8e8ed]">{t("howItWorksCategory")}</span>
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05]">
                  <Brain className="w-4 h-4 text-purple-500 shrink-0" />
                  <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#e8e8ed]">{t("howItWorksAi")}</span>
                </div>
              </div>
            </div>

            {/* Card 3: Learning Process */}
            <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 shadow-sm shadow-slate-200/60 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                {t("learningProcessTitle")}
              </h3>
              <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mb-5">
                {t("learningProcessDesc")}
              </p>
              <div className="mt-auto w-full flex flex-col gap-2 text-left">
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05]">
                  <Plus className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#e8e8ed]">{t("learningProcessAdd")}</span>
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05]">
                  <BookOpen className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#e8e8ed]">{t("learningProcessQuestions")}</span>
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05]">
                  <GraduationCap className="w-4 h-4 text-purple-500 shrink-0" />
                  <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#e8e8ed]">{t("learningProcessStart")}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Export the component and the AI handler function
export default SubjectManager;
