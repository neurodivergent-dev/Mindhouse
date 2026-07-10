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
  Play,
  Download,
  ExternalLink,
  Mail,
  Phone,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:bg-transparent dark:!bg-none py-8">
      <MobileNav />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t("title")}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
            {t("subtitle")}
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-16">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 rounded-2xl border-slate-200/80 bg-white/80 dark:bg-[#1c1c1e]/40 dark:border-white/[0.08] shadow-lg shadow-slate-200/40 text-base font-medium focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Top 3 Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="apple-glass-card border-0 shadow-xl rounded-3xl hover:scale-[1.02] transition-all duration-300">
            <CardContent className="p-8 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-5 border border-blue-500/20 shadow-inner">
                <Video className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="font-extrabold text-lg text-[#1d1d1f] dark:text-[#f5f5f7] mb-2 tracking-tight">{t("videoTutorialsTitle")}</h3>
              <p className="text-sm font-semibold text-[#86868b] dark:text-[#a1a1a6] leading-relaxed">
                {t("videoTutorialsDesc")}
              </p>
            </CardContent>
          </Card>

          <Card className="apple-glass-card border-0 shadow-xl rounded-3xl hover:scale-[1.02] transition-all duration-300">
            <CardContent className="p-8 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mb-5 border border-green-500/20 shadow-inner">
                <MessageSquare className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="font-extrabold text-lg text-[#1d1d1f] dark:text-[#f5f5f7] mb-2 tracking-tight">{t("liveSupportTitle")}</h3>
              <p className="text-sm font-semibold text-[#86868b] dark:text-[#a1a1a6] leading-relaxed">
                {t("liveSupportDesc")}
              </p>
            </CardContent>
          </Card>

          <Card className="apple-glass-card border-0 shadow-xl rounded-3xl hover:scale-[1.02] transition-all duration-300">
            <CardContent className="p-8 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-5 border border-purple-500/20 shadow-inner">
                <FileText className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="font-extrabold text-lg text-[#1d1d1f] dark:text-[#f5f5f7] mb-2 tracking-tight">{t("documentationTitle")}</h3>
              <p className="text-sm font-semibold text-[#86868b] dark:text-[#a1a1a6] leading-relaxed">
                {t("documentationDesc")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* FAQ Area (Left Column - 2 Span) */}
          <div className="lg:col-span-2">
            <Card className="apple-glass-card border-0 shadow-2xl rounded-3xl overflow-hidden h-full">
              <CardHeader className="pt-8 px-8">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                    <HelpCircle className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-2xl font-black tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">{t("faqTitle")}</span>
                </CardTitle>
                <CardDescription className="text-sm sm:text-base mt-2">
                  {t("faqDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex flex-wrap gap-2 mb-8">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`text-xs font-bold rounded-xl transition-all h-9 px-4 ${selectedCategory === category.id
                        ? "bg-gradient-to-r from-blue-200 to-purple-200 text-blue-900 dark:from-blue-600 dark:to-purple-600 dark:text-white border-0 shadow-sm"
                        : "bg-transparent border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/5 text-[#1d1d1f] dark:text-[#f5f5f7]"
                        }`}
                    >
                      {category.name} <span className="opacity-60 ml-1 font-semibold">({category.count})</span>
                    </Button>
                  ))}
                </div>

                <div className="space-y-4">
                  {filteredFAQ.map((faq, index) => (
                    <Card key={faq.question} className="border border-slate-100 dark:border-white/[0.03] bg-white/40 dark:bg-white/[0.02] shadow-sm rounded-2xl overflow-hidden transition-all duration-200">
                      <CardHeader
                        className="p-5 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors"
                        onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <CardTitle className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">{faq.question}</CardTitle>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all bg-slate-100 dark:bg-white/5 ${expandedFAQ === index ? "rotate-180" : ""}`}>
                            <ChevronDown className="h-4 w-4 text-slate-500" />
                          </div>
                        </div>
                      </CardHeader>
                      {expandedFAQ === index && (
                        <CardContent className="p-5 pt-0 text-sm sm:text-base text-[#86868b] dark:text-[#a1a1a6] leading-relaxed border-t border-slate-50 dark:border-white/[0.01]">
                          {faq.answer}
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>

                {filteredFAQ.length === 0 && (
                  <div className="text-center py-16 text-gray-500">
                    <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4 border border-slate-200/10">
                      <HelpCircle className="h-7 w-7 text-slate-400" />
                    </div>
                    <p className="text-base font-semibold">{t("noResults")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Area (Right Column) */}
          <div className="h-full">
            {/* Tutorials Sidebar Card */}
            <Card className="apple-glass-card border-0 shadow-2xl rounded-3xl overflow-hidden h-full">
              <CardHeader className="pt-8 px-8">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-md">
                    <Video className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-black tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">{t("tutorialsTitle")}</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">
                  {t("tutorialsDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {tutorialData.map((tutorial) => (
                  <div
                    key={tutorial.title}
                    className="border border-slate-100/80 dark:border-white/[0.03] bg-white/40 dark:bg-white/[0.01] rounded-2xl p-4 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-all duration-200"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-12 bg-slate-100 dark:bg-white/5 border border-slate-200/10 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow-inner">
                        <Play className="h-4 w-4 text-slate-500 relative z-10" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-[#1d1d1f] dark:text-[#f5f5f7] mb-1 truncate">{tutorial.title}</h4>
                        <p className="text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] mb-2 leading-relaxed line-clamp-2">
                          {tutorial.description}
                        </p>
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <span className="text-[11px] font-bold text-indigo-500">{tutorial.duration}</span>
                          <Button size="sm" variant="outline" className="text-xs h-7 px-3 font-extrabold rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 border-slate-200 dark:border-white/[0.08]">
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
          </div>
        </div>

        {/* Support Contact horizontal banner - Expanded to Full Width */}
        <Card className="apple-glass-card border-0 shadow-2xl rounded-3xl overflow-hidden mt-10">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md flex-shrink-0">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">{t("supportContactTitle")}</h3>
                  <p className="text-sm font-semibold text-[#86868b] dark:text-[#a1a1a6] leading-relaxed">
                    {t("support247")} — Destek ekibimiz her zaman yardıma hazır.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-3 bg-slate-100/40 dark:bg-white/[0.01] px-5 py-3 rounded-2xl border border-slate-200/10 shadow-inner">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <Mail className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                  <span className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">support@mindhouse.com</span>
                </div>
                <div className="flex items-center space-x-3 bg-slate-100/40 dark:bg-white/[0.01] px-5 py-3 rounded-2xl border border-slate-200/10 shadow-inner">
                  <div className="w-6 h-6 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">
                    <Phone className="h-3.5 w-3.5 text-green-500" />
                  </div>
                  <span className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">+90 (212) 555-0123</span>
                </div>
              </div>

              <Link href="/contact" className="block flex-shrink-0">
                <Button className="h-12 px-8 text-base font-extrabold rounded-2xl shadow-lg shadow-blue-500/20 border-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all hover:scale-[1.02] active:scale-[0.98] w-full lg:w-auto">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  {t("liveSupportButton")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Documentation Section (Bottom) */}
        <div className="mt-20">
          <h2 className="text-3xl font-black text-center text-[#1d1d1f] dark:text-[#f5f5f7] mb-10 tracking-tight">
            {t("documentationSectionTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="apple-glass-card border-0 shadow-xl rounded-3xl hover:scale-[1.02] transition-all duration-300">
              <CardContent className="p-6 text-center flex flex-col items-center justify-between h-full">
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-5 border border-blue-500/20 shadow-inner">
                    <BookOpen className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="font-extrabold text-base text-[#1d1d1f] dark:text-[#f5f5f7] mb-2 tracking-tight">{t("gettingStartedGuide")}</h3>
                  <p className="text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] leading-relaxed mb-6">
                    {t("gettingStartedDesc")}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="w-full h-10 font-bold rounded-xl border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/5">
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  {t("download")}
                </Button>
              </CardContent>
            </Card>

            <Card className="apple-glass-card border-0 shadow-xl rounded-3xl hover:scale-[1.02] transition-all duration-300">
              <CardContent className="p-6 text-center flex flex-col items-center justify-between h-full">
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mb-5 border border-green-500/20 shadow-inner">
                    <Video className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="font-extrabold text-base text-[#1d1d1f] dark:text-[#f5f5f7] mb-2 tracking-tight">{t("videoLibrary")}</h3>
                  <p className="text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] leading-relaxed mb-6">
                    {t("videoLibraryDesc")}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="w-full h-10 font-bold rounded-xl border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/5">
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  {t("view")}
                </Button>
              </CardContent>
            </Card>

            <Card className="apple-glass-card border-0 shadow-xl rounded-3xl hover:scale-[1.02] transition-all duration-300">
              <CardContent className="p-6 text-center flex flex-col items-center justify-between h-full">
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-5 border border-purple-500/20 shadow-inner">
                    <FileText className="h-6 w-6 text-purple-500" />
                  </div>
                  <h3 className="font-extrabold text-base text-[#1d1d1f] dark:text-[#f5f5f7] mb-2 tracking-tight">{t("apiDocs")}</h3>
                  <p className="text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] leading-relaxed mb-6">
                    {t("apiDocsDesc")}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="w-full h-10 font-bold rounded-xl border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/5">
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  {t("access")}
                </Button>
              </CardContent>
            </Card>

            <Card className="apple-glass-card border-0 shadow-xl rounded-3xl hover:scale-[1.02] transition-all duration-300">
              <CardContent className="p-6 text-center flex flex-col items-center justify-between h-full">
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-5 border border-orange-500/20 shadow-inner">
                    <HelpCircle className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="font-extrabold text-base text-[#1d1d1f] dark:text-[#f5f5f7] mb-2 tracking-tight">{t("troubleshooting")}</h3>
                  <p className="text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] leading-relaxed mb-6">
                    {t("troubleshootingDesc")}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="w-full h-10 font-bold rounded-xl border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/5">
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
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
