"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getStoredAiPreferences, isAiConfigured } from "@/lib/ai-preferences";
import { useTranslations, useLocale } from "next-intl";
import { shouldUseDemoData, getDemoSubjects } from "@/data/demo-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
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
  Bell,
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
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/routing";
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

  const getSubjectName = (name: string) => {
    try {
      return tSubjects(name as any);
    } catch {
      return name;
    }
  };

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

      // 2. Load subjects from localStorage (demo-aware for Default Subject selector)
      try {
        let parsedSubjects: Subject[] = [];

        if (shouldUseDemoData()) {
          // Load demo subjects (canonical names like "Matematik" + i18n display)
          parsedSubjects = getDemoSubjects(locale);
          // Persist so other pages/components see the demo subjects
          if (parsedSubjects.length > 0) {
            localStorage.setItem("mindhouse_subjects", JSON.stringify(parsedSubjects));
          }
        } else {
          const localSubjects = localStorage.getItem("mindhouse_subjects");
          if (localSubjects) {
            parsedSubjects = JSON.parse(localSubjects);
          }
        }

        const activeSubjects = parsedSubjects.filter((s: Subject) => s.isActive);

        setSubjects(activeSubjects);

        // 3. Default subject ayarla (use first active if none set)
        if (!loadedStudyPrefs.defaultSubject && activeSubjects.length > 0) {
          const firstActiveSubject = activeSubjects.find(
            (s: Subject) => s.isActive,
          );
          if (firstActiveSubject) {
            loadedStudyPrefs.defaultSubject = firstActiveSubject.name;
          }
        }
      } catch {
        setSubjects([]);
      }

      // 4. Custom değerleri ayarla
      const standardQuestionOptions = [5, 10, 15, 20];
      if (
        loadedStudyPrefs.questionsPerQuiz &&
        !standardQuestionOptions.includes(loadedStudyPrefs.questionsPerQuiz)
      ) {
        setCustomQuestionsValue(loadedStudyPrefs.questionsPerQuiz.toString());
        loadedStudyPrefs.questionsPerQuiz = -1;
      }

      const standardTimeOptions = [15, 30, 45, 60];
      if (
        loadedStudyPrefs.timeLimit &&
        !standardTimeOptions.includes(loadedStudyPrefs.timeLimit)
      ) {
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
  }, []); // Sadece mount time'da çalış

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
              setStudyPreferences(
                data.settings.studyPreferences || studyPreferences,
              );
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
    <div className="min-h-screen">
      {/* Responsive Navigation Bar */}
      <MobileNav />

      <div className="p-4 md:p-8">
        <div className="container mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-headline font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t("title")}
              </h1>
              <p className="text-muted-foreground">
                {t("subtitle")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Notifications */}
            {false && (
              <Card className="glass-card relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 backdrop-blur-sm z-10"></div>

                <div className="relative z-10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      {t("notifications")}
                      <Badge className="ml-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs">
                        {t("comingSoon")}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {t("notification_settings")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 opacity-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-notifications">
                          {t("email_notifications")}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {t("email_notifications_desc")}
                        </p>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={false}
                        disabled
                        className="data-[state=checked]:bg-indigo-600 hover:bg-indigo-600/20 transition-colors"
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="push-notifications">
                          {t("push_notifications")}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {t("push_notifications_desc")}
                        </p>
                      </div>
                      <Switch
                        id="push-notifications"
                        checked={false}
                        disabled
                        className="data-[state=checked]:bg-indigo-600 hover:bg-indigo-600/20 transition-colors"
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="reminders">{t("reminders")}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t("reminders_desc")}
                        </p>
                      </div>
                      <Switch
                        id="reminders"
                        checked={false}
                        disabled
                        className="data-[state=checked]:bg-indigo-600 hover:bg-indigo-600/20 transition-colors"
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="achievements">{t("achievements")}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t("achievements_desc")}
                        </p>
                      </div>
                      <Switch
                        id="achievements"
                        checked={false}
                        disabled
                        className="data-[state=checked]:bg-indigo-600 hover:bg-indigo-600/20 transition-colors"
                      />
                    </div>
                  </CardContent>
                </div>
              </Card>
            )}

            {/* Appearance */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  {t("appearance")}
                </CardTitle>
                <CardDescription>
                  {t("appearance_desc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="theme">{t("theme")}</Label>
                  <Select value={theme || "system"} onValueChange={setTheme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="light"

                      >
                        {t("light")}
                      </SelectItem>
                      <SelectItem
                        value="dark"

                      >
                        {t("dark")}
                      </SelectItem>
                      <SelectItem
                        value="system"

                      >
                        {t("system")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="font-size">{t("font_size")}</Label>
                  <Select
                    value={appearance.fontSize}
                    onValueChange={(value) =>
                      setAppearance({ ...appearance, fontSize: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="small"

                      >
                        {t("small")}
                      </SelectItem>
                      <SelectItem
                        value="medium"

                      >
                        {t("medium")}
                      </SelectItem>
                      <SelectItem
                        value="large"

                      >
                        {t("large")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="compact-mode">{t("compact_mode")}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("compact_mode_desc")}
                    </p>
                  </div>
                  <Switch
                    id="compact-mode"
                    checked={appearance.compactMode}
                    onCheckedChange={(checked) =>
                      setAppearance({ ...appearance, compactMode: checked })
                    }
                    className="data-[state=checked]:bg-indigo-600 hover:bg-indigo-600/20 transition-colors"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Study Preferences */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {t("study_preferences")}
                </CardTitle>
                <CardDescription>
                  {t("study_preferences_desc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="default-subject">{t("default_subject")}</Label>
                  <Select
                    value={studyPreferences.defaultSubject}
                    onValueChange={(value) =>
                      setStudyPreferences({
                        ...studyPreferences,
                        defaultSubject: value,
                      })
                    }
                    disabled={loading}
                  >
                    <SelectTrigger>
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
                      {subjects.filter((subject) => subject.isActive)
                        .length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                          <BookOpen className="w-12 h-12 text-muted-foreground/50 mb-3" />
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            {t("no_subjects_yet")}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mb-4">
                            {t("add_subject_from_manager")}
                          </p>
                          <Link href="/subject-manager">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                            >
                              <GraduationCap className="w-3 h-3 mr-1" />
                              {t("add_subject")}
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        subjects
                          .filter((subject) => subject.isActive)
                          .map((subject) => (
                            <SelectItem
                              key={subject.id}
                              value={subject.name}
      
                            >
                              {getSubjectName(subject.name)}
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="questions-per-quiz">
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
                          questionsPerQuiz:
                            value === "custom" ? -1 : parseInt(value),
                        });
                        if (value !== "custom") {
                          setCustomQuestionsValue("");
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="5"
  
                        >
                          {t("questions_count", { count: 5 })}
                        </SelectItem>
                        <SelectItem
                          value="10"
  
                        >
                          {t("questions_count", { count: 10 })}
                        </SelectItem>
                        <SelectItem
                          value="15"
  
                        >
                          {t("questions_count", { count: 15 })}
                        </SelectItem>
                        <SelectItem
                          value="20"
  
                        >
                          {t("questions_count", { count: 20 })}
                        </SelectItem>
                        <SelectItem
                          value="custom"
  
                        >
                          {t("custom")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {studyPreferences.questionsPerQuiz === -1 && (
                      <Input
                        type="number"
                        placeholder={t("example_25")}
                        value={customQuestionsValue}
                        onChange={(e) =>
                          setCustomQuestionsValue(e.target.value)
                        }
                        className="w-28"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="time-limit">{t("time_limit")}</Label>
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
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="15"
  
                        >
                          {t("minutes_count", { count: 15 })}
                        </SelectItem>
                        <SelectItem
                          value="30"
  
                        >
                          {t("minutes_count", { count: 30 })}
                        </SelectItem>
                        <SelectItem
                          value="45"
  
                        >
                          {t("minutes_count", { count: 45 })}
                        </SelectItem>
                        <SelectItem
                          value="60"
  
                        >
                          {t("minutes_count", { count: 60 })}
                        </SelectItem>
                        <SelectItem
                          value="custom"
  
                        >
                          {t("custom")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {studyPreferences.timeLimit === -1 && (
                      <Input
                        type="number"
                        placeholder={t("example_50")}
                        value={customTimeValue}
                        onChange={(e) => setCustomTimeValue(e.target.value)}
                        className="w-28"
                      />
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-timer">{t("show_timer")}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("show_timer_desc")}
                    </p>
                  </div>
                  <Switch
                    id="show-timer"
                    checked={studyPreferences.showTimer}
                    onCheckedChange={(checked) =>
                      setStudyPreferences({
                        ...studyPreferences,
                        showTimer: checked,
                      })
                    }
                    className="data-[state=checked]:bg-indigo-600 hover:bg-indigo-600/20 transition-colors"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-submit">{t("auto_submit")}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("auto_submit_desc")}
                    </p>
                  </div>
                  <Switch
                    id="auto-submit"
                    checked={studyPreferences.autoSubmit}
                    onCheckedChange={(checked) =>
                      setStudyPreferences({
                        ...studyPreferences,
                        autoSubmit: checked,
                      })
                    }
                    className="data-[state=checked]:bg-indigo-600 hover:bg-indigo-600/20 transition-colors"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  {t("data_management")}
                </CardTitle>
                <CardDescription>
                  {t("data_management_desc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleExportData}
                    variant="outline"
                          className="hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-blue-900 dark:hover:from-blue-600 dark:hover:to-purple-600 dark:hover:text-white hover:border-0"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t("export_data")}
                  </Button>
                  <Button
                    onClick={handleImportData}
                    variant="outline"
                          className="hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-blue-900 dark:hover:from-blue-600 dark:hover:to-purple-600 dark:hover:text-white hover:border-0"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {t("import_data")}
                  </Button>
                </div>
                <Separator />
                <div className="flex gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="flex-1 hover:bg-gradient-to-r hover:from-red-600 hover:to-pink-600 hover:text-white hover:border-0"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t("clear_all_data")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("clear_data_title")}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("clear_data_confirm")}
                        </AlertDialogDescription>
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
                <p className="text-xs text-muted-foreground">
                  {t("export_description")}
                </p>
              </CardContent>
            </Card>

            {/* AI Settings */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-500" />
                  {t("ai_provider")}
                </CardTitle>
                <CardDescription>
                  {t("ai_provider_desc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>{t("provider")}</Label>
                  <p className="text-xs text-muted-foreground mb-1">
                    The AI system will use the provider you select here + its key. Configure the correct one for your setup.
                  </p>
                  <Select
                    value={aiPreferences.provider}
                    onValueChange={(value) => {
                      const updated = { ...aiPreferences, provider: value };
                      setAiPreferences(updated);
                      persistAiPreferences(updated);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("select_ai_provider")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gemini">{t("providers.gemini")}</SelectItem>
                      <SelectItem value="groq">{t("providers.groq")}</SelectItem>
                      <SelectItem value="ollama-local">{t("providers.ollama_local")}</SelectItem>
                      <SelectItem value="ollama-cloud">{t("providers.ollama_cloud")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2 text-sm mt-1">
                    {provider === "ollama-local" ? (
                      <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        🖥️ Local Ollama - no API key needed (make sure Ollama is running at the base URL)
                      </span>
                    ) : hasAiKey ? (
                      <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                        ✓ Key configured for this provider
                      </span>
                    ) : null}
                  </div>
                </div>

                {aiPreferences.provider === "gemini" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="gemini-key">{t("gemini_api_key")}</Label>
                      <Input
                        id="gemini-key"
                        type="password"
                        placeholder="AIzaSy..."
                        value={aiPreferences.geminiApiKey}
                        onChange={(e) => {
                          const updated = {
                            ...aiPreferences,
                            geminiApiKey: e.target.value,
                          };
                          setAiPreferences(updated);
                          persistAiPreferences(updated);
                        }}
                      />
                      <p className="text-xs text-muted-foreground">{t("gemini_api_key_hint")}</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gemini-model">{t("model_name")}</Label>
                      <Input
                        id="gemini-model"
                        placeholder="gemini-2.0-flash, gemini-1.5-pro vs."
                        value={aiPreferences.geminiModel || "gemini-2.0-flash"}
                        onChange={(e) =>
                          setAiPreferences({
                            ...aiPreferences,
                            geminiModel: e.target.value,
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">{t("gemini_model_hint")}</p>
                    </div>
                  </>
                )}

                {aiPreferences.provider === "groq" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="groq-key">{t("groq_api_key")}</Label>
                      <Input
                        id="groq-key"
                        type="password"
                        placeholder="gsk_..."
                        value={aiPreferences.groqApiKey}
                        onChange={(e) => {
                          const updated = {
                            ...aiPreferences,
                            groqApiKey: e.target.value,
                          };
                          setAiPreferences(updated);
                          persistAiPreferences(updated);
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="groq-model">{t("model_name")}</Label>
                      <Input
                        id="groq-model"
                        placeholder="llama3-8b-8192"
                        value={aiPreferences.groqModel || "llama3-8b-8192"}
                        onChange={(e) =>
                          setAiPreferences({
                            ...aiPreferences,
                            groqModel: e.target.value,
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">{t("groq_model_hint")}</p>
                    </div>
                  </>
                )}

                {aiPreferences.provider === "ollama-local" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="ollama-local-url">{t("ollama_local_url")}</Label>
                      <Input
                        id="ollama-local-url"
                        placeholder="http://localhost:11434"
                        value={aiPreferences.ollamaBaseUrl}
                        onChange={(e) => {
                          const updated = {
                            ...aiPreferences,
                            ollamaBaseUrl: e.target.value,
                          };
                          setAiPreferences(updated);
                          persistAiPreferences(updated);
                        }}
                      />
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        ⚠️ Make sure Ollama is running locally (`ollama serve` or the Ollama app). Use http://localhost:11434 (no /api).
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ollama-local-model">{t("model_name")}</Label>
                      <Input
                        id="ollama-local-model"
                        placeholder="llama3, mistral, gemma vs."
                        value={aiPreferences.ollamaLocalModel || "llama3"}
                        onChange={(e) => {
                          const updated = {
                            ...aiPreferences,
                            ollamaLocalModel: e.target.value,
                          };
                          setAiPreferences(updated);
                          persistAiPreferences(updated);
                        }}
                      />
                      <p className="text-xs text-muted-foreground">{t("ollama_local_model_hint")}</p>
                    </div>
                  </>
                )}

                {aiPreferences.provider === "ollama-cloud" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="ollama-cloud-model">{t("model_name")}</Label>
                      <Input
                        id="ollama-cloud-model"
                        placeholder="llama3, mistral, gemma vs."
                        value={aiPreferences.ollamaCloudModel || "llama3"}
                        onChange={(e) => {
                          const updated = {
                            ...aiPreferences,
                            ollamaCloudModel: e.target.value,
                          };
                          setAiPreferences(updated);
                          persistAiPreferences(updated);
                        }}
                      />
                      <p className="text-xs text-muted-foreground">{t("ollama_cloud_model_hint")}</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ollama-cloud-key">{t("api_key")}</Label>
                      <Input
                        id="ollama-cloud-key"
                        type="password"
                        placeholder={t("api_key_placeholder")}
                        value={aiPreferences.ollamaCloudApiKey}
                        onChange={(e) => {
                          const updated = {
                            ...aiPreferences,
                            ollamaCloudApiKey: e.target.value,
                          };
                          setAiPreferences(updated);
                          persistAiPreferences(updated);
                        }}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              onClick={handleSaveSettings}
            >
              <Settings className="w-4 h-4 mr-2" />
              {t("save_settings")}
            </Button>
          </div>

          {/* Feature Cards */}
          <FeatureCards
            title={t("platform_features")}
            features={translatedFeatures}
            columns={3}
          />
        </div>
      </div>
    </div>
  );
}
