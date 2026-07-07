"use client";

import React, { useState, useEffect, Suspense, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import TopicExplainer from "@/components/topic-explainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Brain,
  Lightbulb,
  Target,
  ArrowLeft,
  Plus,
  GraduationCap,
  Trash2,
  Search,
} from "lucide-react";
import { shouldUseDemoData } from "@/data/demo-data";
import TopicExplainerLocalStorageService from "@/services/topic-explainer-service";

interface Topic {
  name: string;
  subject: string;
  difficulty: string;
  estimatedTime: number;
}

interface Subject {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  questionCount: number;
  isActive: boolean;
}

class SubjectLocalStorageService {
  private static readonly STORAGE_KEY = "mindhouse_subjects";

  static getSubjects(): Subject[] {
    if (typeof window === "undefined") {
      return [];
    }
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}

const TopicExplainerPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("TopicExplainer");
  const locale = useLocale();

  const getTranslatedSubject = (name: string) => {
    if (locale === "tr") {return name;}
    const map: Record<string, string> = {
      "Matematik": "Mathematics",
      "Fizik": "Physics",
      "Kimya": "Chemistry",
      "Biyoloji": "Biology",
      "Tarih": "History",
      "Türk Dili ve Edebiyatı": "Turkish Literature",
      "Türk Dili": "Turkish Literature",
      "İngilizce": "English",
      "Coğrafya": "Geography"
    };
    return map[name] || name;
  };

  const getTranslatedCategory = (category: string) => {
    if (locale === "tr") {return category;}
    const map: Record<string, string> = {
      "Sayısal": "Science & Math",
      "Fen Bilimleri": "Science",
      "Sosyal Bilimler": "Social Sciences",
      "Sözel": "Verbal",
      "Yabancı Dil": "Foreign Language"
    };
    return map[category] || category;
  };

  const getTranslatedDescription = (desc: string) => {
    if (locale === "tr") {return desc;}
    const map: Record<string, string> = {
      "Temel matematik konuları: Cebir, Geometri, Analiz": "Basic math topics: Algebra, Geometry, Calculus",
      "Mekanik, Termodinamik, Elektrik ve Manyetizma": "Mechanics, Thermodynamics, Electricity and Magnetism",
      "Genel Kimya, Organik ve Anorganik Kimya": "General Chemistry, Organic and Inorganic Chemistry",
      "Hücre Biyolojisi, Genetik, Ekoloji": "Cell Biology, Genetics, Ecology",
      "Türk Tarihi, Dünya Tarihi, Çağdaş Tarih": "Turkish History, World History, Contemporary History",
      "Dil Bilgisi, Klasik Edebiyat, Çağdaş Edebiyat": "Grammar, Classical Literature, Contemporary Literature",
      "Grammar, Vocabulary, Reading Comprehension": "Grammar, Vocabulary, Reading Comprehension"
    };
    return map[desc] || desc;
  };

  const topic = searchParams.get("topic");
  const subject = searchParams.get("subject");
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSubject, setCurrentSubject] = useState<string | null>(null);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const getDifficultyLabel = useCallback(
    (difficulty: string) => {
      const map: Record<string, string> = {
        Kolay: t("difficultyEasy"),
        Orta: t("difficultyMedium"),
        Zor: t("difficultyHard"),
        easy: t("difficultyEasy"),
        medium: t("difficultyMedium"),
        hard: t("difficultyHard"),
      };
      return map[difficulty] ?? difficulty;
    },
    [t],
  );

  const getDifficultyBadgeClass = (difficulty: string) => {
    if (difficulty === "Kolay" || difficulty === "easy") {
      return "bg-green-500";
    }
    if (difficulty === "Orta" || difficulty === "medium") {
      return "bg-yellow-500";
    }
    return "bg-red-500";
  };

  useEffect(() => {
    const demoMode = shouldUseDemoData();
    setIsDemoMode(demoMode);

    const loadRealData = () => {
      const realSubjects = SubjectLocalStorageService.getSubjects();
      setSubjects(realSubjects);
      setIsLoading(false);
    };

    loadRealData();
  }, []);

  useEffect(() => {
    if (subject && subject !== currentSubject) {
      setCurrentSubject(subject);
    }
  }, [subject, currentSubject]);

  const generateTopicsForSubject = useCallback(
    (subjectItem: Subject): Topic[] => {
      const baseTopics = [
        { nameKey: "topicBasicConcepts" as const, difficulty: "easy", estimatedTime: 20 },
        // Avoid overly generic names like "Main Topics" that lead to poor AI output.
        // Use more specific sounding ones that still work as entry points.
        { nameKey: "topicCoreIdeas" as const, difficulty: "medium", estimatedTime: 30 },
        { nameKey: "topicAdvanced" as const, difficulty: "hard", estimatedTime: 40 },
        { nameKey: "topicApplications" as const, difficulty: "medium", estimatedTime: 35 },
        { nameKey: "topicProblemSolving" as const, difficulty: "hard", estimatedTime: 45 },
      ];

      return baseTopics.map((topicItem) => ({
        name: t(topicItem.nameKey),
        subject: subjectItem.name,
        difficulty: topicItem.difficulty,
        estimatedTime: topicItem.estimatedTime,
      }));
    },
    [t],
  );

  const availableTopics = useMemo(() => {
    const realTopics: Topic[] = [];
    subjects.forEach((subjectItem) => {
      if (subjectItem.isActive) {
        realTopics.push(...generateTopicsForSubject(subjectItem));
      }
    });
    return realTopics;
  }, [subjects, generateTopicsForSubject]);

  const activeSubjects = useMemo(() => subjects.filter(s => s.isActive), [subjects]);

  const filteredTopics = useMemo(() => {
    let result = availableTopics;

    if (selectedSubjectFilter !== "all") {
      result = result.filter(t => t.subject === selectedSubjectFilter);
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.name.toLowerCase().includes(query) || 
        t.subject.toLowerCase().includes(query) ||
        getTranslatedSubject(t.subject).toLowerCase().includes(query)
      );
    }

    return result;
  }, [availableTopics, selectedSubjectFilter, searchQuery]);

  if (topic && subject) {
    const savedTopics = TopicExplainerLocalStorageService.getTopicsByTopic(topic);
    const savedTopicForThisSubject = savedTopics.find((item) => item.subject === subject);
    const hasSavedContent = Boolean(savedTopicForThisSubject);

    return (
      <TopicExplainer
        topic={topic}
        subject={subject}
        isDemoMode={isDemoMode}
        hasSavedContent={hasSavedContent}
        savedTopicId={hasSavedContent ? savedTopicForThisSubject?.id || null : null}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-transparent dark:!bg-none p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              {t("loadingTopics")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleClearAllContent = () => {
    const savedTopics = TopicExplainerLocalStorageService.getSavedTopics();
    savedTopics.forEach((savedTopic) => {
      TopicExplainerLocalStorageService.deleteTopic(savedTopic.id);
    });
    window.location.reload();
  };

  const handleTopicClick = (topicItem: Topic) => {
    router.push(
      `/topic-explainer?topic=${encodeURIComponent(topicItem.name)}&subject=${encodeURIComponent(topicItem.subject)}`,
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-transparent dark:!bg-none p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("backToDashboard")}
              </Button>
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t("title")}
            </h1>

            <Button
              onClick={handleClearAllContent}
              size="sm"
              variant="outline"
              className="hover:bg-gradient-to-r hover:from-red-600 hover:to-pink-600 hover:text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t("clearAll")}
            </Button>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-gradient-question shadow-lg">
            <CardContent className="p-6 text-center">
              <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                {t("featureAiLearning")}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {t("featureAiLearningDesc")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-gradient-question shadow-lg">
            <CardContent className="p-6 text-center">
              <Target className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                {t("featureStepByStep")}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {t("featureStepByStepDesc")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-gradient-question shadow-lg">
            <CardContent className="p-6 text-center">
              <Lightbulb className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                {t("featureInteractive")}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {t("featureInteractiveDesc")}
              </p>
            </CardContent>
          </Card>
        </div>

        {subjects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
              {t("yourSubjects")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {subjects
                .filter((subjectItem) => subjectItem.isActive)
                .map((subjectItem) => (
                  <Card
                    key={subjectItem.id}
                    className="border-gradient-question shadow-lg"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 dark:text-white">
                            {getTranslatedSubject(subjectItem.name)}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {getTranslatedCategory(subjectItem.category)}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {getTranslatedDescription(subjectItem.description)}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge className={getDifficultyBadgeClass(subjectItem.difficulty)}>
                          {getDifficultyLabel(subjectItem.difficulty)}
                        </Badge>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {t("questionsCount", { count: subjectItem.questionCount })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {availableTopics.length > 0 ? t("availableTopics") : t("noTopicsYet")}
            </h2>

            {activeSubjects.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedSubjectFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSubjectFilter("all")}
                  className={selectedSubjectFilter === "all" ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0" : ""}
                >
                  {locale === 'tr' ? 'Tüm Dersler' : 'All Subjects'}
                </Button>
                {activeSubjects.map((subjectItem) => (
                  <Button
                    key={subjectItem.id}
                    variant={selectedSubjectFilter === subjectItem.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSubjectFilter(subjectItem.name)}
                    className={selectedSubjectFilter === subjectItem.name ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0" : ""}
                  >
                    {getTranslatedSubject(subjectItem.name)}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <div className="mb-6">
             <div className="relative w-full md:w-96">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <Search className="h-4 w-4 text-gray-400" />
               </div>
               <Input
                 type="text"
                 placeholder={locale === 'tr' ? "Konu veya ders ara..." : "Search topics or subjects..."}
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="pl-10 w-full bg-white/50 dark:bg-black/20"
               />
             </div>
          </div>

          {availableTopics.length > 0 ? (
            <div className="flex flex-col gap-8">
              {activeSubjects.map((subjectItem) => {
                const subjectTopics = filteredTopics.filter(t => t.subject === subjectItem.name);
                if (subjectTopics.length === 0) {return null;}
                
                return (
                  <div key={`section-${subjectItem.id}`} className="flex flex-col gap-2">
                    {selectedSubjectFilter === "all" && (
                      <div className="flex items-center gap-2 pb-2 mb-2 border-b border-gray-200 dark:border-gray-800">
                        <BookOpen className="w-5 h-5 text-blue-500" />
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                          {getTranslatedSubject(subjectItem.name)}
                        </h3>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {subjectTopics.map((topicItem, index) => (
                        <Card
                          key={`${topicItem.name}-${topicItem.subject}-${index}`}
                          className="border-gradient-question shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                          onClick={() => handleTopicClick(topicItem)}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                                <BookOpen className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                  {topicItem.name}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {getTranslatedSubject(topicItem.subject)}
                                </p>
                              </div>
                            </div>

                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                              {t("topicCardDescription", {
                                topic: topicItem.name,
                                subject: getTranslatedSubject(topicItem.subject),
                              })}
                            </p>

                            <div className="flex items-center justify-between">
                              <Badge
                                variant={
                                  topicItem.difficulty === "easy"
                                    ? "default"
                                    : topicItem.difficulty === "medium"
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {getDifficultyLabel(topicItem.difficulty)}
                              </Badge>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {t("minutesApprox", { time: topicItem.estimatedTime })}
                              </span>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <Brain className="w-4 h-4" />
                                <span>{t("aiPoweredNarration")}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {filteredTopics.length === 0 && searchQuery.trim() !== "" && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  {locale === 'tr' ? 'Aramanızla eşleşen konu bulunamadı.' : 'No topics match your search.'}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-gradient-question shadow-lg border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center">
                      <Plus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t("startFirstTitle")}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {t("startFirstDesc")}
                  </p>
                  <Link href="/subject-manager">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-full">
                      <Plus className="w-5 h-5 mr-2" />
                      {t("goToSubjectManager")}
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-gradient-question shadow-lg border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t("howItWorksExplainerTitle")}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {t("howItWorksExplainerDesc")}
                  </p>
                  <div className="text-sm text-gray-400 dark:text-gray-500">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Brain className="w-4 h-4" />
                      <span>{t("featureAiLearning")}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Target className="w-4 h-4" />
                      <span>{t("featureStepByStep")}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      <span>{t("featureInteractive")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gradient-question shadow-lg border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t("learningProcessTitle")}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {t("learningProcessDesc")}
                  </p>
                  <div className="text-sm text-gray-400 dark:text-gray-500">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="w-4 h-4 bg-blue-500 rounded-full"></span>
                      <span>{t("addSubject")}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="w-4 h-4 bg-green-500 rounded-full"></span>
                      <span>{t("selectTopic")}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 bg-purple-500 rounded-full"></span>
                      <span>{t("learnWithAi")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <Card className="border-gradient-question shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 dark:text-white text-center">
              {t("howItWorksTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
                </div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                  {t("step1Title")}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t("step1Desc")}
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 dark:text-green-400 font-bold">2</span>
                </div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                  {t("step2Title")}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t("step2Desc")}
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-yellow-600 dark:text-yellow-400 font-bold">3</span>
                </div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                  {t("step3Title")}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t("step3Desc")}
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 dark:text-purple-400 font-bold">4</span>
                </div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                  {t("step4Title")}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t("step4Desc")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const TopicExplainerPage = () => {
  const tCommon = useTranslations("Common");

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-transparent dark:!bg-none p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">{tCommon("loading")}</p>
          </div>
        </div>
      }
    >
      <TopicExplainerPageContent />
    </Suspense>
  );
};

export default TopicExplainerPage;
