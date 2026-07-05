"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  BookOpen,
  Video,
  MessageSquare,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Play,
  Download,
  ExternalLink,
  Mail,
  Phone,
  Clock,
} from "lucide-react";
import MobileNav from "@/components/mobile-nav";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface TutorialItem {
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  thumbnail: string;
}

type CategoryId =
  | "all"
  | "general"
  | "ai"
  | "quiz"
  | "flashcard"
  | "premium"
  | "security"
  | "enterprise"
  | "support";

export default function HelpPage() {
  const t = useTranslations("Help");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("all");
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqData: FAQItem[] = useMemo(
    () => [
      { question: t("faq1Question"), answer: t("faq1Answer"), category: "general" },
      { question: t("faq2Question"), answer: t("faq2Answer"), category: "ai" },
      { question: t("faq3Question"), answer: t("faq3Answer"), category: "quiz" },
      { question: t("faq4Question"), answer: t("faq4Answer"), category: "flashcard" },
      { question: t("faq5Question"), answer: t("faq5Answer"), category: "premium" },
      { question: t("faq6Question"), answer: t("faq6Answer"), category: "security" },
      { question: t("faq7Question"), answer: t("faq7Answer"), category: "enterprise" },
      { question: t("faq8Question"), answer: t("faq8Answer"), category: "support" },
    ],
    [t],
  );

  const tutorialData: TutorialItem[] = useMemo(
    () => [
      {
        title: t("tutorial1Title"),
        description: t("tutorial1Description"),
        duration: t("tutorial1Duration"),
        videoUrl: "https://www.youtube.com/watch?v=example1",
        thumbnail: "/tutorials/getting-started.jpg",
      },
      {
        title: t("tutorial2Title"),
        description: t("tutorial2Description"),
        duration: t("tutorial2Duration"),
        videoUrl: "https://www.youtube.com/watch?v=example2",
        thumbnail: "/tutorials/ai-tutor.jpg",
      },
      {
        title: t("tutorial3Title"),
        description: t("tutorial3Description"),
        duration: t("tutorial3Duration"),
        videoUrl: "https://www.youtube.com/watch?v=example3",
        thumbnail: "/tutorials/quiz-system.jpg",
      },
      {
        title: t("tutorial4Title"),
        description: t("tutorial4Description"),
        duration: t("tutorial4Duration"),
        videoUrl: "https://www.youtube.com/watch?v=example4",
        thumbnail: "/tutorials/flashcard.jpg",
      },
      {
        title: t("tutorial5Title"),
        description: t("tutorial5Description"),
        duration: t("tutorial5Duration"),
        videoUrl: "https://www.youtube.com/watch?v=example5",
        thumbnail: "/tutorials/premium.jpg",
      },
      {
        title: t("tutorial6Title"),
        description: t("tutorial6Description"),
        duration: t("tutorial6Duration"),
        videoUrl: "https://www.youtube.com/watch?v=example6",
        thumbnail: "/tutorials/analytics.jpg",
      },
    ],
    [t],
  );

  const categories = useMemo(
    () => [
      { id: "all" as const, name: t("categoryAll"), count: faqData.length },
      { id: "general" as const, name: t("categoryGeneral"), count: faqData.filter((f) => f.category === "general").length },
      { id: "ai" as const, name: t("categoryAi"), count: faqData.filter((f) => f.category === "ai").length },
      { id: "quiz" as const, name: t("categoryQuiz"), count: faqData.filter((f) => f.category === "quiz").length },
      { id: "flashcard" as const, name: t("categoryFlashcard"), count: faqData.filter((f) => f.category === "flashcard").length },
      { id: "premium" as const, name: t("categoryPremium"), count: faqData.filter((f) => f.category === "premium").length },
      { id: "security" as const, name: t("categorySecurity"), count: faqData.filter((f) => f.category === "security").length },
      { id: "enterprise" as const, name: t("categoryEnterprise"), count: faqData.filter((f) => f.category === "enterprise").length },
      { id: "support" as const, name: t("categorySupport"), count: faqData.filter((f) => f.category === "support").length },
    ],
    [t, faqData],
  );

  const filteredFAQ = faqData.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:bg-transparent dark:!bg-none">
      <MobileNav />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {t("title")}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-gradient-question hover:shadow-lg cursor-pointer">
            <CardContent className="p-6 text-center">
              <Video className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="font-semibold mb-2">{t("videoTutorialsTitle")}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("videoTutorialsDesc")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-gradient-question hover:shadow-lg cursor-pointer">
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="font-semibold mb-2">{t("liveSupportTitle")}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("liveSupportDesc")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-gradient-question hover:shadow-lg cursor-pointer">
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-purple-600" />
              <h3 className="font-semibold mb-2">{t("documentationTitle")}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("documentationDesc")}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border-gradient-question">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HelpCircle className="h-5 w-5 mr-2" />
                  {t("faqTitle")}
                </CardTitle>
                <CardDescription>
                  {t("faqDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-6">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="text-xs"
                    >
                      {category.name} ({category.count})
                    </Button>
                  ))}
                </div>

                <div className="space-y-4">
                  {filteredFAQ.map((faq, index) => (
                    <Card key={faq.question} className="border border-gray-200 dark:border-gray-700">
                      <CardHeader
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                      >
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{faq.question}</CardTitle>
                          {expandedFAQ === index ? (
                            <ChevronUp className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                      </CardHeader>
                      {expandedFAQ === index && (
                        <CardContent>
                          <p className="text-gray-600 dark:text-gray-400">
                            {faq.answer}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>

                {filteredFAQ.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t("noResults")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-gradient-question">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Video className="h-5 w-5 mr-2" />
                  {t("tutorialsTitle")}
                </CardTitle>
                <CardDescription>
                  {t("tutorialsDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {tutorialData.map((tutorial) => (
                  <div
                    key={tutorial.title}
                    className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-16 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                        <Play className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm mb-1">{tutorial.title}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {tutorial.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{tutorial.duration}</span>
                          <Button size="sm" variant="outline" className="text-xs">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            {t("watch")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-gradient-question mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  {t("supportContactTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">support@mindhouse.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-green-600" />
                  <span className="text-sm">+90 (212) 555-0123</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">{t("support247")}</span>
                </div>
                <Link href="/contact">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 mt-4">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {t("liveSupportButton")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            {t("documentationSectionTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-gradient-question hover:shadow-lg cursor-pointer">
              <CardContent className="p-6 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <h3 className="font-semibold mb-2">{t("gettingStartedGuide")}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {t("gettingStartedDesc")}
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-3 w-3 mr-1" />
                  {t("download")}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-gradient-question hover:shadow-lg cursor-pointer">
              <CardContent className="p-6 text-center">
                <Video className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="font-semibold mb-2">{t("videoLibrary")}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {t("videoLibraryDesc")}
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  {t("view")}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-gradient-question hover:shadow-lg cursor-pointer">
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                <h3 className="font-semibold mb-2">{t("apiDocs")}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {t("apiDocsDesc")}
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  {t("access")}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-gradient-question hover:shadow-lg cursor-pointer">
              <CardContent className="p-6 text-center">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 text-orange-600" />
                <h3 className="font-semibold mb-2">{t("troubleshooting")}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {t("troubleshootingDesc")}
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  {t("view")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}