"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getStoredAiPreferences, isAiConfigured } from "@/lib/ai-preferences";
import { useTranslations, useLocale } from "next-intl";
import { shouldUseDemoData, getDemoSubjects } from "@/data/demo-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import FeatureCards from "@/components/ui/feature-cards";
import { settingsFeatures } from "@/data/feature-cards-data";
import {
  Settings,
  Palette,
  Database,
  Trash2,
  Download,
  Upload,
  BookOpen,
  GraduationCap,
  Loader2,
  Bot,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { getSubjectName } from "@/lib/question-manager-labels";
import { UnifiedStorageService } from "@/services/unified-storage-service";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import MobileNav from "@/components/mobile-nav";

interface Subject {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  isActive: boolean;
}

const SETTINGS_FEATURE_KEYS = [
  "ai_learning",
  "ai_tutor",
  "goal_focused",
  "quick_quiz",
  "achievement_tracking",
  "premium",
] as const;

export default function SettingsPage() {
  const t = useTranslations("Settings");
  const tSubjects = useTranslations("Subjects");
  const locale = useLocale();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const translatedFeatures = useMemo(
    () =>
      settingsFeatures.map((feature, index) => ({
        ...feature,
        title: t(`features.${SETTINGS_FEATURE_KEYS[index]}.title`),
        description: t(`features.${SETTINGS_FEATURE_KEYS[index]}.description`),
      })),
    [t],
  );

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    reminders: true,
    achievements: true,
  });

  const [appearance, setAppearance] = useState({
    fontSize: "medium",
    compactMode: false,
  });

  const [studyPreferences, setStudyPreferences] = useState({
    defaultSubject: "",
    questionsPerQuiz: 10,
    timeLimit: 30,
    showTimer: true,
    autoSubmit: false,
  });

  const [aiPreferences, setAiPreferences] = useState({
    provider: "gemini",
    geminiApiKey: "",
    geminiModel: "gemini-2.0-flash",
    groqApiKey: "",
    groqModel: "llama3-8b-8192",
    ollamaBaseUrl: "http://localhost:11434",
    ollamaLocalModel: "llama3",
    ollamaCloudApiKey: "",
    ollamaCloudModel: "llama3",
  });

  const provider = aiPreferences.provider;

  const hasAiKey = isAiConfigured(aiPreferences);

  // Helper to immediately persist AI prefs (more reliable than effect)
  const persistAiPreferences = (updated: any) => {
    try {
      localStorage.setItem("aiPreferences", JSON.stringify(updated));
    } catch {}
  };

  // Also save on manual full save for AI part (already does, but ensure)

  // Custom values state
  const [customQuestionsValue, setCustomQuestionsValue] = useState("");
  const [customTimeValue, setCustomTimeValue] = useState("");

  useEffect(() => {
    const initializeSettings = async () => {
      setLoading(true);

      // Default values
      let loadedStudyPrefs = {
        defaultSubject: "",
        questionsPerQuiz: 10,
        timeLimit: 30,
        showTimer: true,
        autoSubmit: false,
      };
      let loadedNotifications = {
        email: true,
        push: false,
        reminders: true,
        achievements: true,
      };
      let loadedAppearance = {
        fontSize: "medium",
        compactMode: false,
      };

      // 1. Load settings from localStorage
      const saved = localStorage.getItem("userSettings");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.studyPreferences) {
            loadedStudyPrefs = {
              ...loadedStudyPrefs,
              ...parsed.studyPreferences,
            };
          }
          if (parsed.notifications) {
            loadedNotifications = {
              ...loadedNotifications,
              ...parsed.notifications,
            };
          }
          if (parsed.appearance) {
            loadedAppearance = { ...loadedAppearance, ...parsed.appearance };
          }
        } catch {
          // Failed to parse settings from localStorage
        }
      }

      const savedAiPreferences = getStoredAiPreferences();
      if (Object.keys(savedAiPreferences).length > 0) {
        setAiPreferences(savedAiPreferences as any);
      }

      // 2. Load subjects from IndexedDB (demo-aware for Default Subject selector)
      try {
        let parsedSubjects: Subject[] = [];

        // Make sure the IndexedDB-backed cache is ready before reading
        await UnifiedStorageService.initialize();

        if (shouldUseDemoData()) {
          // Load demo subjects (canonical names like "Matematik" + i18n display)
          const demoSubjects = getDemoSubjects(locale);
          parsedSubjects = demoSubjects;
          // Persist so other pages/components see the demo subjects
          if (demoSubjects.length > 0) {
            UnifiedStorageService.saveSubjects(demoSubjects);
          }
        } else {
          parsedSubjects = UnifiedStorageService.getSubjects();
        }

        const activeSubjects = parsedSubjects.filter((s: Subject) => s.isActive);

        setSubjects(activeSubjects);

        // 3. Default subject ayarla (use first active if none set)
        if (!loadedStudyPrefs.defaultSubject && activeSubjects.length > 0) {
          const firstActiveSubject = activeSubjects.find((s: Subject) => s.isActive);
          if (firstActiveSubject) {
            loadedStudyPrefs.defaultSubject = firstActiveSubject.name;
          }
        }
      } catch {
        setSubjects([]);
      }

      // 4. Custom deÄŸerleri ayarla
      const standardQuestionOptions = [5, 10, 15, 20];
      if (
        loadedStudyPrefs.questionsPerQuiz &&
        !standardQuestionOptions.includes(loadedStudyPrefs.questionsPerQuiz)
      ) {
        setCustomQuestionsValue(loadedStudyPrefs.questionsPerQuiz.toString());
        loadedStudyPrefs.questionsPerQuiz = -1;
      }

      const standardTimeOptions = [15, 30, 45, 60];
      if (loadedStudyPrefs.timeLimit && !standardTimeOptions.includes(loadedStudyPrefs.timeLimit)) {
        setCustomTimeValue(loadedStudyPrefs.timeLimit.toString());
        loadedStudyPrefs.timeLimit = -1;
      }

      // 5. Set states
      setNotifications(loadedNotifications);
      setAppearance(loadedAppearance);
      setStudyPreferences(loadedStudyPrefs);

      // 6. Apply font size and compact mode immediately
      const root = document.documentElement;

      // Font size ayarla
      switch (loadedAppearance.fontSize) {
        case "small":
          root.style.fontSize = "14px";
          break;
        case "medium":
          root.style.fontSize = "16px";
          break;
        case "large":
          root.style.fontSize = "18px";
          break;
        default:
          root.style.fontSize = "16px";
          break;
      }

      // Compact mode ayarla
      if (loadedAppearance.compactMode) {
        root.classList.add("compact-mode");
      } else {
        root.classList.remove("compact-mode");
      }

      setLoading(false);
    };

    initializeSettings();
  }, []); // Sadece mount time'da Ã§alÄ±ÅŸ

  // Apply compact mode and font size changes instantly
  useEffect(() => {
    const root = document.documentElement;

    // Kompakt mod ayarla
    if (appearance.compactMode) {
      root.classList.add("compact-mode");
    } else {
      root.classList.remove("compact-mode");
    }

    // Font size ayarla
    switch (appearance.fontSize) {
      case "small":
        root.style.fontSize = "14px";
        break;
      case "medium":
        root.style.fontSize = "16px";
        break;
      case "large":
        root.style.fontSize = "18px";
        break;
      default:
        root.style.fontSize = "16px";
        break;
    }
  }, [appearance.compactMode, appearance.fontSize]);

  const handleExportData = () => {
    // Export user data
    const userData = {
      performance: localStorage.getItem("performanceData"),
      settings: {
        notifications,
        appearance,
        studyPreferences,
      },
    };

    const blob = new Blob([JSON.stringify(userData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mindhouse-settings-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            if (data.performance) {
              localStorage.setItem("performanceData", data.performance);
            }
            if (data.settings) {
              setNotifications(data.settings.notifications || notifications);
              setAppearance(data.settings.appearance || appearance);
              setStudyPreferences(data.settings.studyPreferences || studyPreferences);
            }
            toast({
              title: t("toasts.success"),
              description: t("toasts.import_success"),
            });
          } catch {
            toast({
              title: t("toasts.import_error"),
              description: t("toasts.invalid_file"),
              variant: "destructive",
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClearData = () => {
    localStorage.clear();
    toast({
      title: t("toasts.success"),
      description: t("toasts.clear_success"),
    });
  };

  const handleSaveSettings = () => {
    const settingsToSave = {
      ...studyPreferences,
    };

    if (settingsToSave.questionsPerQuiz === -1) {
      settingsToSave.questionsPerQuiz = parseInt(customQuestionsValue) || 10; // default to 10 if invalid
    }
    if (settingsToSave.timeLimit === -1) {
      settingsToSave.timeLimit = parseInt(customTimeValue) || 30; // default to 30 if invalid
    }

    const settings = {
      notifications,
      appearance: {
        ...appearance,
      },
      studyPreferences: settingsToSave,
    };
    localStorage.setItem("userSettings", JSON.stringify(settings));
    localStorage.setItem("aiPreferences", JSON.stringify(aiPreferences));
    toast({
      title: t("toasts.save_success_title"),
      description: t("toasts.save_success_desc"),
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-transparent dark:!bg-none">
      <MobileNav />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                {t("title")}
              </h1>
              <p className="text-[#86868b] dark:text-[#a1a1a6] text-sm font-medium">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Appearance */}
          <div className="apple-glass-card h-full">
            <div className="flex flex-col h-full w-full relative z-10 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-sm">
                  <Palette className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    {t("appearance")}
                  </h2>
                  <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                    {t("appearance_desc")}
                  </p>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wide">
                    {t("theme")}
                  </Label>
                  <Select value={theme || "system"} onValueChange={setTheme}>
                    <SelectTrigger className="bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 rounded-xl backdrop-blur-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">{t("light")}</SelectItem>
                      <SelectItem value="dark">{t("dark")}</SelectItem>
                      <SelectItem value="system">{t("system")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wide">
                    {t("font_size")}
                  </Label>
                  <Select
                    value={appearance.fontSize}
                    onValueChange={(value) => setAppearance({ ...appearance, fontSize: value })}
                  >
                    <SelectTrigger className="bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 rounded-xl backdrop-blur-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">{t("small")}</SelectItem>
                      <SelectItem value="medium">{t("medium")}</SelectItem>
                      <SelectItem value="large">{t("large")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10">
                  <div>
                    <Label
                      htmlFor="compact-mode"
                      className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]"
                    >
                      {t("compact_mode")}
                    </Label>
                    <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                      {t("compact_mode_desc")}
                    </p>
                  </div>
                  <Switch
                    id="compact-mode"
                    checked={appearance.compactMode}
                    onCheckedChange={(checked) =>
                      setAppearance({ ...appearance, compactMode: checked })
                    }
                    className="data-[state=checked]:bg-indigo-600 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Study Preferences */}
          <div className="apple-glass-card h-full">
            <div className="flex flex-col h-full w-full relative z-10 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    {t("study_preferences")}
                  </h2>
                  <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                    {t("study_preferences_desc")}
                  </p>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wide">
                    {t("default_subject")}
                  </Label>
                  <Select
                    value={studyPreferences.defaultSubject}
                    onValueChange={(value) =>
                      setStudyPreferences({ ...studyPreferences, defaultSubject: value })
                    }
                    disabled={loading}
                  >
                    <SelectTrigger className="bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 rounded-xl backdrop-blur-sm">
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t("loading_subjects")}
                        </div>
                      ) : (
                        <SelectValue placeholder={t("select_default_subject")} />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.filter((s) => s.isActive).length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                          <BookOpen className="w-12 h-12 text-muted-foreground/50 mb-3" />
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            {t("no_subjects_yet")}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mb-4">
                            {t("add_subject_from_manager")}
                          </p>
                          <Link href="/subject-manager">
                            <Button size="sm" variant="outline" className="text-xs">
                              <GraduationCap className="w-3 h-3 mr-1" />
                              {t("add_subject")}
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        subjects
                          .filter((s) => s.isActive)
                          .map((s) => (
                            <SelectItem key={s.id} value={s.name}>
                              {getSubjectName(s.name, tSubjects)}
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wide">
                    {t("questions_per_quiz")}
                  </Label>
                  <div className="flex gap-2">
                    <Select
                      value={
                        studyPreferences.questionsPerQuiz === -1
                          ? "custom"
                          : studyPreferences.questionsPerQuiz.toString()
                      }
                      onValueChange={(value) => {
                        setStudyPreferences({
                          ...studyPreferences,
                          questionsPerQuiz: value === "custom" ? -1 : parseInt(value),
                        });
                        if (value !== "custom") {
                          setCustomQuestionsValue("");
                        }
                      }}
                    >
                      <SelectTrigger className="bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 rounded-xl backdrop-blur-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">{t("questions_count", { count: 5 })}</SelectItem>
                        <SelectItem value="10">{t("questions_count", { count: 10 })}</SelectItem>
                        <SelectItem value="15">{t("questions_count", { count: 15 })}</SelectItem>
                        <SelectItem value="20">{t("questions_count", { count: 20 })}</SelectItem>
                        <SelectItem value="custom">{t("custom")}</SelectItem>
                      </SelectContent>
                    </Select>
                    {studyPreferences.questionsPerQuiz === -1 && (
                      <Input
                        type="number"
                        placeholder={t("example_25")}
                        value={customQuestionsValue}
                        onChange={(e) => setCustomQuestionsValue(e.target.value)}
                        className="w-28 bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 rounded-xl"
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wide">
                    {t("time_limit")}
                  </Label>
                  <div className="flex gap-2">
                    <Select
                      value={
                        studyPreferences.timeLimit === -1
                          ? "custom"
                          : studyPreferences.timeLimit.toString()
                      }
                      onValueChange={(value) => {
                        setStudyPreferences({
                          ...studyPreferences,
                          timeLimit: value === "custom" ? -1 : parseInt(value),
                        });
                        if (value !== "custom") {
                          setCustomTimeValue("");
                        }
                      }}
                    >
                      <SelectTrigger className="bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 rounded-xl backdrop-blur-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">{t("minutes_count", { count: 15 })}</SelectItem>
                        <SelectItem value="30">{t("minutes_count", { count: 30 })}</SelectItem>
                        <SelectItem value="45">{t("minutes_count", { count: 45 })}</SelectItem>
                        <SelectItem value="60">{t("minutes_count", { count: 60 })}</SelectItem>
                        <SelectItem value="custom">{t("custom")}</SelectItem>
                      </SelectContent>
                    </Select>
                    {studyPreferences.timeLimit === -1 && (
                      <Input
                        type="number"
                        placeholder={t("example_50")}
                        value={customTimeValue}
                        onChange={(e) => setCustomTimeValue(e.target.value)}
                        className="w-28 bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 rounded-xl"
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10">
                  <div>
                    <Label
                      htmlFor="show-timer"
                      className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]"
                    >
                      {t("show_timer")}
                    </Label>
                    <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                      {t("show_timer_desc")}
                    </p>
                  </div>
                  <Switch
                    id="show-timer"
                    checked={studyPreferences.showTimer}
                    onCheckedChange={(checked) =>
                      setStudyPreferences({ ...studyPreferences, showTimer: checked })
                    }
                    className="data-[state=checked]:bg-indigo-600 transition-colors"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10">
                  <div>
                    <Label
                      htmlFor="auto-submit"
                      className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]"
                    >
                      {t("auto_submit")}
                    </Label>
                    <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                      {t("auto_submit_desc")}
                    </p>
                  </div>
                  <Switch
                    id="auto-submit"
                    checked={studyPreferences.autoSubmit}
                    onCheckedChange={(checked) =>
                      setStudyPreferences({ ...studyPreferences, autoSubmit: checked })
                    }
                    className="data-[state=checked]:bg-indigo-600 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="apple-glass-card h-full">
            <div className="flex flex-col h-full w-full relative z-10 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-sm">
                  <Database className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    {t("data_management")}
                  </h2>
                  <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                    {t("data_management_desc")}
                  </p>
                </div>
              </div>

              <div className="space-y-3 flex-1">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleExportData}
                    variant="outline"
                    className="flex-1 bg-white/60 dark:bg-white/5 border-white/30 dark:border-white/10 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-700 hover:text-blue-700 dark:hover:text-blue-300 transition-all"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t("export_data")}
                  </Button>
                  <Button
                    onClick={handleImportData}
                    variant="outline"
                    className="flex-1 bg-white/60 dark:bg-white/5 border-white/30 dark:border-white/10 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-200 dark:hover:border-purple-700 hover:text-purple-700 dark:hover:text-purple-300 transition-all"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {t("import_data")}
                  </Button>
                </div>

                <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                  {t("export_description")}
                </p>

                <div className="pt-1">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full rounded-xl bg-red-50/60 dark:bg-red-500/10 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t("clear_all_data")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("clear_data_title")}</AlertDialogTitle>
                        <AlertDialogDescription>{t("clear_data_confirm")}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleClearData}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {t("delete")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </div>

          {/* AI Provider */}
          <div className="apple-glass-card h-full">
            <div className="flex flex-col h-full w-full relative z-10 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    {t("ai_provider")}
                  </h2>
                  <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                    {t("ai_provider_desc")}
                  </p>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wide">
                    {t("provider")}
                  </Label>
                  <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                    {t("provider_desc_hint")}
                  </p>
                  <Select
                    value={aiPreferences.provider}
                    onValueChange={(value) => {
                      const updated = { ...aiPreferences, provider: value };
                      setAiPreferences(updated);
                      persistAiPreferences(updated);
                    }}
                  >
                    <SelectTrigger className="bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 rounded-xl backdrop-blur-sm">
                      <SelectValue placeholder={t("select_ai_provider")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gemini">{t("providers.gemini")}</SelectItem>
                      <SelectItem value="groq">{t("providers.groq")}</SelectItem>
                      <SelectItem value="ollama-local">{t("providers.ollama_local")}</SelectItem>
                      <SelectItem value="ollama-cloud">{t("providers.ollama_cloud")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2 text-xs mt-1">
                    {provider === "ollama-local" ? (
                      <span className="text-blue-600 dark:text-blue-400">
                        {t("ollama_local_no_key")}
                      </span>
                    ) : hasAiKey ? (
                      <span className="text-green-600 dark:text-green-400">
                        {t("key_configured")}
                      </span>
                    ) : null}
                  </div>
                </div>

                {aiPreferences.provider === "gemini" && (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wide">
                        {t("gemini_api_key")}
                      </Label>
                      <Input
                        id="gemini-key"
                        type="password"
                        placeholder="AIzaSy..."
                        value={aiPreferences.geminiApiKey}
                        onChange={(e) => {
                          const updated = { ...aiPreferences, geminiApiKey: e.target.value };
                          setAiPreferences(updated);
                          persistAiPreferences(updated);
                        }}
                        className="bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 rounded-xl"
                      />
                      <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                        {t("gemini_api_key_hint")}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wide">
                        {t("model_name")}
                      </Label>
                      <Input
                        id="gemini-model"
                        placeholder="gemini-2.0-flash, gemini-1.5-pro vs."
                        value={aiPreferences.geminiModel || "gemini-2.0-flash"}
                        onChange={(e) =>
                          setAiPreferences({ ...aiPreferences, geminiModel: e.target.value })
                        }
                        className="bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 rounded-xl"
                      />
                      <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                        {t("gemini_model_hint")}
                      </p>
                    </div>
                  </>
                )}

                {aiPreferences.provider === "groq" && (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wide">
                        {t("groq_api_key")}
                      </Label>
                      <Input
                        id="groq-key"
                        type="password"
                        placeholder="gsk_..."
                        value={aiPreferences.groqApiKey}
                        onChange={(e) => {
                          const updated = { ...aiPreferences, groqApiKey: e.target.value };
                          setAiPreferences(updated);
                          persistAiPreferences(updated);
                        }}
                        className="bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wide">
                        {t("model_name")}
                      </Label>
                      <Input
                        id="groq-model"
                        placeholder="llama3-8b-8192"
                        value={aiPreferences.groqModel || "llama3-8b-8192"}
                        onChange={(e) =>
                          setAiPreferences({ ...aiPreferences, groqModel: e.target.value })
                        }
                        className="bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 rounded-xl"
                      />
                      <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                        {t("groq_model_hint")}
                      </p>
                    </div>
                  </>
                )}

                {aiPreferences.provider === "ollama-local" && (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wide">
                        {t("ollama_local_url")}
                      </Label>
                      <Input
                        id="ollama-local-url"
                        placeholder="http://localhost:11434"
                        value={aiPreferences.ollamaBaseUrl}
                        onChange={(e) => {
                          const updated = { ...aiPreferences, ollamaBaseUrl: e.target.value };
                          setAiPreferences(updated);
                          persistAiPreferences(updated);
                        }}
                        className="bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 rounded-xl"
                      />
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        {t("ollama_local_warning")}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wide">
                        {t("model_name")}
                      </Label>
                      <Input
                        id="ollama-local-model"
                        placeholder="llama3, mistral, gemma vs."
                        value={aiPreferences.ollamaLocalModel || "llama3"}
                        onChange={(e) => {
                          const updated = { ...aiPreferences, ollamaLocalModel: e.target.value };
                          setAiPreferences(updated);
                          persistAiPreferences(updated);
                        }}
                        className="bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 rounded-xl"
                      />
                      <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                        {t("ollama_local_model_hint")}
                      </p>
                    </div>
                  </>
                )}

                {aiPreferences.provider === "ollama-cloud" && (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wide">
                        {t("model_name")}
                      </Label>
                      <Input
                        id="ollama-cloud-model"
                        placeholder="llama3, mistral, gemma vs."
                        value={aiPreferences.ollamaCloudModel || "llama3"}
                        onChange={(e) => {
                          const updated = { ...aiPreferences, ollamaCloudModel: e.target.value };
                          setAiPreferences(updated);
                          persistAiPreferences(updated);
                        }}
                        className="bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 rounded-xl"
                      />
                      <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                        {t("ollama_cloud_model_hint")}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wide">
                        {t("api_key")}
                      </Label>
                      <Input
                        id="ollama-cloud-key"
                        type="password"
                        placeholder={t("api_key_placeholder")}
                        value={aiPreferences.ollamaCloudApiKey}
                        onChange={(e) => {
                          const updated = { ...aiPreferences, ollamaCloudApiKey: e.target.value };
                          setAiPreferences(updated);
                          persistAiPreferences(updated);
                        }}
                        className="bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 rounded-xl"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end mb-8">
          <Button
            className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all"
            onClick={handleSaveSettings}
          >
            <Settings className="w-4 h-4 mr-2" />
            {t("save_settings")}
          </Button>
        </div>

        {/* Feature Cards */}
        <FeatureCards title={t("platform_features")} features={translatedFeatures} columns={3} />
      </div>
    </div>
  );
}
