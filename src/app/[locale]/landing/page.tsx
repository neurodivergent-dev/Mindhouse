"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Zap,
  BookOpen,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Play,
  Users,
  Code2,
  Server,
  BrainCircuit,
  GitMerge,
  Globe,
  Layers,
  FileCode,
  Palette,
  Package,
  Database,
  HardDrive,
  Network,
  Key,
  Bot,
  Cpu,
  MessageSquare,
  Lightbulb,
  UserCheck,
  GitBranch,
  ShieldCheck,
  Code,
  Sparkles,
  Smartphone,
  GraduationCap,
  Target,
  LightbulbIcon,
  BookMarked,
  Settings,
} from "lucide-react";
import MobileNav from "@/components/mobile-nav";
import AIFeaturesShowcase from "@/components/ai-features-showcase";
import PerformanceMetrics from "@/components/performance-metrics";
import MobileDemo from "@/components/mobile-demo";

export default function LandingPage() {
  const t = useTranslations("Landing");
  const tNav = useTranslations("Navigation");
  const router = useRouter();

  return (
    <div className="min-h-screen bg-transparent relative">
      {/* Navigation Header - Consistent with all pages */}
      <MobileNav />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <section className="text-center py-8 lg:py-12">
            {/* Project Achievement Badge */}
            <div className="inline-flex justify-center items-center mb-6">
              <div className="border-gradient-question p-[1px] rounded-full transition-all duration-300 hover:shadow-[0_0_2rem_-0.5rem_#8b5cf6] hover:-translate-y-0.5">
                <div className="inline-flex items-center gap-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-full px-4 py-2">
                  <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    {t("badge")}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Headline - Following the gradient text pattern */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t("heroTitle1")}
              </span>
              <br />
              <span className="text-foreground">{t("heroTitle2")}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              {t("heroSubtitle")}{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {t("heroSubtitleHighlight")}
              </span>
              .
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                onClick={() => {
                  router.push("/demo");
                }}
                size="lg"
                className="w-full sm:w-auto text-lg px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                {t("tryFreeDemo")}
              </Button>
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-lg px-8 py-3 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0 transition-all duration-300 hover:scale-105"
                >
                  <Brain className="h-5 w-5 mr-2" />
                  {t("goToDashboard")}
                </Button>
              </Link>
            </div>

            {/* Stats - Modern card pattern */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
              <div className="border-gradient-question p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <div className="h-full w-full border-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 rounded-[11px] p-6 text-center">
                  <div className="text-3xl font-extrabold bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2">
                    {t("statFast")}
                  </div>
                  <div className="text-sm font-semibold text-blue-900/80 dark:text-blue-100/90">
                    {t("statFastDesc")}
                  </div>
                </div>
              </div>
              <div className="border-gradient-green p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <div className="h-full w-full border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 rounded-[11px] p-6 text-center">
                  <div className="text-3xl font-extrabold bg-gradient-to-r from-lime-500 via-green-500 to-emerald-600 dark:from-lime-400 dark:via-green-400 dark:to-emerald-500 bg-clip-text text-transparent mb-2">
                    {t("statSmart")}
                  </div>
                  <div className="text-sm font-semibold text-green-900/80 dark:text-green-100/90">
                    {t("statSmartDesc")}
                  </div>
                </div>
              </div>
              <div className="border-gradient-purple p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <div className="h-full w-full border-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 dark:from-purple-500/20 dark:to-violet-500/20 rounded-[11px] p-6 text-center">
                  <div className="text-2xl font-extrabold bg-gradient-to-r from-fuchsia-500 via-purple-500 to-violet-500 dark:from-fuchsia-400 dark:via-purple-400 dark:to-violet-400 bg-clip-text text-transparent mb-2">
                    {t("statFlashcard")}
                  </div>
                  <div className="text-xs font-semibold text-purple-900/80 dark:text-purple-100/90">
                    {t("statFlashcardDesc")}
                  </div>
                </div>
              </div>
              <div className="border-gradient-orange p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <div className="h-full w-full border-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20 rounded-[11px] p-6 text-center">
                  <div className="text-3xl font-extrabold bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 dark:from-amber-400 dark:via-orange-400 dark:to-red-500 bg-clip-text text-transparent mb-2">
                    {t("statAiAssistant")}
                  </div>
                  <div className="text-sm font-semibold text-orange-900/80 dark:text-orange-100/90">
                    {t("statAiAssistantDesc")}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {t("featuresTitle")}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t("featuresSubtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* AI-Powered Learning */}
              <div className="border-gradient-question p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <Card className="h-full w-full rounded-[11px] border-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                      {t("featureAiLearning")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium text-blue-900/80 dark:text-blue-100/90 mb-4">
                      {t("featureAiLearningDesc")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:hover:bg-blue-800/60 border-0">{t("badgeGoogleGemini")}</Badge>
                      <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-200 dark:hover:bg-purple-800/60 border-0">{t("badgeGenkit")}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Smart Analytics */}
              <div className="border-gradient-green p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <Card className="h-full w-full border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 rounded-[11px]">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                      {t("featureAnalytics")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium text-green-900/80 dark:text-green-100/90 mb-4">
                      {t("featureAnalyticsDesc")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-200 dark:hover:bg-green-800/60 border-0">{t("badgePerformanceTracking")}</Badge>
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-200 dark:hover:bg-emerald-800/60 border-0">{t("badgeCharts")}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Progressive Web App */}
              <div className="border-gradient-purple p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <Card className="h-full w-full border-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 dark:from-purple-500/20 dark:to-violet-500/20 rounded-[11px]">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center mb-4">
                      <Smartphone className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 dark:from-purple-400 dark:to-violet-400 bg-clip-text text-transparent">
                      {t("featurePwa")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium text-purple-900/80 dark:text-purple-100/90 mb-4">
                      {t("featurePwaDesc")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-200 dark:hover:bg-purple-800/60 border-0">{t("badgeOfflineSupport")}</Badge>
                      <Badge className="bg-violet-100 text-violet-800 hover:bg-violet-200 dark:bg-violet-900/50 dark:text-violet-200 dark:hover:bg-violet-800/60 border-0">{t("badgeMobileOptimized")}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Smart Flashcards */}
              <div className="border-gradient-orange p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <Card className="h-full w-full border-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20 rounded-[11px]">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center mb-4">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">
                      {t("featureFlashcards")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium text-orange-900/80 dark:text-orange-100/90 mb-4">
                      {t("featureFlashcardsDesc")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/50 dark:text-orange-200 dark:hover:bg-orange-800/60 border-0">{t("badgeSpacedRepetition")}</Badge>
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-200 dark:hover:bg-red-800/60 border-0">{t("badgeAiRecommendations")}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Question Generation */}
              <div className="border-gradient-yellow p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <Card className="h-full w-full border-0 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 dark:from-yellow-500/20 dark:to-amber-500/20 rounded-[11px]">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-600 to-amber-600 rounded-lg flex items-center justify-center mb-4">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 dark:from-yellow-400 dark:to-amber-400 bg-clip-text text-transparent">
                      {t("featureQuestionGen")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium text-yellow-900/80 dark:text-yellow-100/90 mb-4">
                      {t("featureQuestionGenDesc")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-200 dark:hover:bg-yellow-800/60 border-0">{t("badgeGoogleGemini")}</Badge>
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-200 dark:hover:bg-amber-800/60 border-0">{t("badgeAutoGeneration")}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Security & Privacy */}
              <div className="border-gradient-teal p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <Card className="h-full w-full border-0 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 dark:from-teal-500/20 dark:to-cyan-500/20 rounded-[11px]">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                      {t("featureSecurity")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium text-teal-900/80 dark:text-teal-100/90 mb-4">
                      {t("featureSecurityDesc")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-200 dark:bg-teal-900/50 dark:text-teal-200 dark:hover:bg-teal-800/60 border-0">{t("badgeClientSideProcessing")}</Badge>
                      <Badge className="bg-cyan-100 text-cyan-800 hover:bg-cyan-200 dark:bg-cyan-900/50 dark:text-cyan-200 dark:hover:bg-cyan-800/60 border-0">{t("badgeModernWebStandards")}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* AI Subject Creation Section */}
          <section id="ai-subject-creation" className="py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t("subjectCreationTitle")}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t("subjectCreationSubtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* AI Subject Generation */}
              <div className="border-gradient-question p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <Card className="h-full w-full rounded-[11px] border-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                      {t("subjectGen")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium text-blue-900/80 dark:text-blue-100/90 mb-4">
                      {t("subjectGenDesc")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:hover:bg-blue-800/60 border-0">{t("badgeGoogleGemini")}</Badge>
                      <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-200 dark:hover:bg-purple-800/60 border-0">{t("badgeAutoGeneration")}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quality Control */}
              <div className="border-gradient-green p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <Card className="h-full w-full border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 rounded-[11px]">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                      {t("subjectQuality")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium text-green-900/80 dark:text-green-100/90 mb-4">
                      {t("subjectQualityDesc")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-200 dark:hover:bg-green-800/60 border-0">{t("badgeQualityScoring")}</Badge>
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-200 dark:hover:bg-emerald-800/60 border-0">{t("badgeValidation")}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Learning Objectives */}
              <div className="border-gradient-purple p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <Card className="h-full w-full border-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 dark:from-purple-500/20 dark:to-violet-500/20 rounded-[11px]">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center mb-4">
                      <LightbulbIcon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 dark:from-purple-400 dark:to-violet-400 bg-clip-text text-transparent">
                      {t("subjectGoals")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium text-purple-900/80 dark:text-purple-100/90 mb-4">
                      {t("subjectGoalsDesc")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-200 dark:hover:bg-purple-800/60 border-0">{t("badgeLearningGoals")}</Badge>
                      <Badge className="bg-violet-100 text-violet-800 hover:bg-violet-200 dark:bg-violet-900/50 dark:text-violet-200 dark:hover:bg-violet-800/60 border-0">{t("badgeTopics")}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Custom Guidelines */}
              <div className="border-gradient-orange p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <Card className="h-full w-full border-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20 rounded-[11px]">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center mb-4">
                      <Settings className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">
                      {t("subjectGuidelines")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium text-orange-900/80 dark:text-orange-100/90 mb-4">
                      {t("subjectGuidelinesDesc")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/50 dark:text-orange-200 dark:hover:bg-orange-800/60 border-0">{t("badgeCustomInstructions")}</Badge>
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-200 dark:hover:bg-red-800/60 border-0">{t("badgeTailoredContent")}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Review & Approval */}
              <div className="border-gradient-yellow p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <Card className="h-full w-full border-0 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 dark:from-yellow-500/20 dark:to-amber-500/20 rounded-[11px]">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-600 to-amber-600 rounded-lg flex items-center justify-center mb-4">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 dark:from-yellow-400 dark:to-amber-400 bg-clip-text text-transparent">
                      {t("subjectReview")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium text-yellow-900/80 dark:text-yellow-100/90 mb-4">
                      {t("subjectReviewDesc")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-200 dark:hover:bg-yellow-800/60 border-0">{t("badgeReviewSystem")}</Badge>
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-200 dark:hover:bg-amber-800/60 border-0">{t("badgeSelectiveAddition")}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Smart Organization */}
              <div className="border-gradient-teal p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <Card className="h-full w-full border-0 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 dark:from-teal-500/20 dark:to-cyan-500/20 rounded-[11px]">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
                      <BookMarked className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                      {t("subjectOrganization")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium text-teal-900/80 dark:text-teal-100/90 mb-4">
                      {t("subjectOrganizationDesc")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-200 dark:bg-teal-900/50 dark:text-teal-200 dark:hover:bg-teal-800/60 border-0">{t("badgeAutoCategorization")}</Badge>
                      <Badge className="bg-cyan-100 text-cyan-800 hover:bg-cyan-200 dark:bg-cyan-900/50 dark:text-cyan-200 dark:hover:bg-cyan-800/60 border-0">{t("badgeDifficultyLevels")}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* CTA for AI Subject Creation */}
            <div className="text-center mt-12">
              <div className="glass-card p-8 rounded-xl max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {t("subjectCtaTitle")}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  {t("subjectCtaSubtitle")}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => {
                      router.push("/subject-manager");
                    }}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    {t("createSubjectWithAi")}
                  </Button>
                  <Link href="/demo">
                    <Button
                      variant="outline"
                      size="lg"
                      className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0 transition-all duration-300 hover:scale-105"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      {t("tryDemoNow")}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Technology Stack Section */}
          <section id="technology" className="py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t("techStackTitle")}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t("techStackSubtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Frontend */}
              <div className="border-gradient-question p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <Card className="h-full w-full rounded-[11px] border-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20">
                  <CardHeader className="flex flex-row items-center gap-4 pb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Code2 className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                      Frontend
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800/50">
                      <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold text-blue-700 dark:text-blue-200">
                        Next.js 15+
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800/50">
                      <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold text-blue-700 dark:text-blue-200">
                        React 18+
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800/50">
                      <FileCode className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold text-blue-700 dark:text-blue-200">
                        TypeScript
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800/50">
                      <Palette className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold text-blue-700 dark:text-blue-200">
                        Tailwind CSS
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800/50">
                      <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold text-blue-700 dark:text-blue-200">
                        Shadcn/ui
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Backend */}
              <div className="border-gradient-green p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <Card className="h-full w-full rounded-[11px] border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20">
                  <CardHeader className="flex flex-row items-center gap-4 pb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                      <Server className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                      Backend
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800/50">
                      <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="font-semibold text-green-700 dark:text-green-200">
                        Supabase
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800/50">
                      <HardDrive className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="font-semibold text-green-700 dark:text-green-200">
                        PostgreSQL
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800/50">
                      <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="font-semibold text-green-700 dark:text-green-200">
                        Drizzle ORM
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800/50">
                      <Network className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="font-semibold text-green-700 dark:text-green-200">
                        API Routes
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800/50">
                      <Key className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="font-semibold text-green-700 dark:text-green-200">
                        Authentication
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI & ML */}
              <div className="border-gradient-purple p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <Card className="h-full w-full rounded-[11px] border-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 dark:from-purple-500/20 dark:to-violet-500/20">
                  <CardHeader className="flex flex-row items-center gap-4 pb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center">
                      <BrainCircuit className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 dark:from-purple-400 dark:to-violet-400 bg-clip-text text-transparent">
                      AI & ML
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800/50">
                      <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <span className="font-semibold text-purple-700 dark:text-purple-200">
                        Google Gemini
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800/50">
                      <Cpu className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <span className="font-semibold text-purple-700 dark:text-purple-200">
                        Genkit Framework
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800/50">
                      <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <span className="font-semibold text-purple-700 dark:text-purple-200">
                        AI Tutor
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800/50">
                      <Lightbulb className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <span className="font-semibold text-purple-700 dark:text-purple-200">
                        Smart Recommendations
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800/50">
                      <UserCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <span className="font-semibold text-purple-700 dark:text-purple-200">
                        Personalization
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* DevOps & Quality */}
              <div className="border-gradient-orange p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <Card className="h-full w-full rounded-[11px] border-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20">
                  <CardHeader className="flex flex-row items-center gap-4 pb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                      <GitMerge className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">
                      DevOps & Quality
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-800/50">
                      <GitBranch className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      <span className="font-semibold text-orange-700 dark:text-orange-200">
                        CircleCI
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-800/50">
                      <ShieldCheck className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      <span className="font-semibold text-orange-700 dark:text-orange-200">
                        TypeScript Strict
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-800/50">
                      <Code className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      <span className="font-semibold text-orange-700 dark:text-orange-200">
                        ESLint
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-800/50">
                      <Sparkles className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      <span className="font-semibold text-orange-700 dark:text-orange-200">
                        Prettier
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-800/50">
                      <Smartphone className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      <span className="font-semibold text-orange-700 dark:text-orange-200">
                        PWA
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* AI Features Showcase */}
          <AIFeaturesShowcase />

          {/* Performance Metrics */}
          <PerformanceMetrics />

          {/* Mobile Responsiveness Demo */}
          <MobileDemo />

          {/* Demo CTA Section */}
          <section id="demo" className="py-16">
            <div className="glass-card p-8 rounded-xl text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t("demoCtaTitle")}
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t("demoCtaSubtitle")}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 max-w-4xl mx-auto">
                <div className="border-gradient-question p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                  <div className="h-full w-full border-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 rounded-[11px] p-6 text-center">
                    <Users className="h-8 w-8 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-bold text-lg mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                      {t("demoNoSignup")}
                    </h3>
                    <p className="text-sm font-medium text-blue-900/80 dark:text-blue-100/90">
                      {t("demoNoSignupDesc")}
                    </p>
                  </div>
                </div>
                <div className="border-gradient-green p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                  <div className="h-full w-full border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 rounded-[11px] p-6 text-center">
                    <Clock className="h-8 w-8 mx-auto mb-3 text-green-600 dark:text-green-400" />
                    <h3 className="font-bold text-lg mb-2 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                      {t("demoFiveMinutes")}
                    </h3>
                    <p className="text-sm font-medium text-green-900/80 dark:text-green-100/90">
                      {t("demoFiveMinutesDesc")}
                    </p>
                  </div>
                </div>
                <div className="border-gradient-purple p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                  <div className="h-full w-full border-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 dark:from-purple-500/20 dark:to-violet-500/20 rounded-[11px] p-6 text-center">
                    <CheckCircle className="h-8 w-8 mx-auto mb-3 text-purple-600 dark:text-purple-400" />
                    <h3 className="font-bold text-lg mb-2 bg-gradient-to-r from-purple-600 to-violet-600 dark:from-purple-400 dark:to-violet-400 bg-clip-text text-transparent">
                      {t("demoRealData")}
                    </h3>
                    <p className="text-sm font-medium text-purple-900/80 dark:text-purple-100/90">
                      {t("demoRealDataDesc")}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => {
                  router.push("/demo");
                }}
                size="lg"
                className="text-lg px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Play className="h-5 w-5 mr-2" />
                {t("startDemo")}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </section>

          {/* Quick Actions - Dashboard Style */}
          <section className="py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t("quickStartTitle")}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t("quickStartSubtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
              <div className="border-gradient-question p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <Card className="h-full w-full rounded-[11px] border-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 cursor-pointer">
                  <div
                    onClick={() => {
                      router.push("/quiz");
                    }}
                    className="cursor-pointer"
                  >
                    <CardContent className="p-6 text-center">
                      <Zap className="h-8 w-8 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-bold text-lg mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                        {t("quickQuiz")}
                      </h3>
                      <p className="text-sm font-medium text-blue-900/80 dark:text-blue-100/90">
                        {t("quickQuizDesc")}
                      </p>
                    </CardContent>
                  </div>
                </Card>
              </div>

              <div className="border-gradient-green p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <Card className="h-full w-full rounded-[11px] border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 cursor-pointer">
                  <Link href="/flashcard">
                    <CardContent className="p-6 text-center">
                      <Brain className="h-8 w-8 mx-auto mb-3 text-green-600 dark:text-green-400" />
                      <h3 className="font-bold text-lg mb-2 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                        {tNav("flashcard")}
                      </h3>
                      <p className="text-sm font-medium text-green-900/80 dark:text-green-100/90">
                        {t("quickFlashcardDesc")}
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              </div>

              <div className="border-gradient-purple p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <Card className="h-full w-full rounded-[11px] border-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 dark:from-purple-500/20 dark:to-violet-500/20 cursor-pointer">
                  <Link href="/ai-chat">
                    <CardContent className="p-6 text-center">
                      <BookOpen className="h-8 w-8 mx-auto mb-3 text-purple-600 dark:text-purple-400" />
                      <h3 className="font-bold text-lg mb-2 bg-gradient-to-r from-purple-600 to-violet-600 dark:from-purple-400 dark:to-violet-400 bg-clip-text text-transparent">
                        {t("quickAiTutor")}
                      </h3>
                      <p className="text-sm font-medium text-purple-900/80 dark:text-purple-100/90">
                        {t("quickAiTutorDesc")}
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              </div>

              <div className="border-gradient-question p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <Card className="h-full w-full rounded-[11px] border-0 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 dark:from-indigo-500/20 dark:to-blue-500/20 cursor-pointer">
                  <Link href="/question-manager">
                    <CardContent className="p-6 text-center">
                      <Database className="h-8 w-8 mx-auto mb-3 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="font-bold text-lg mb-2 bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
                        {t("quickQuestionManager")}
                      </h3>
                      <p className="text-sm font-medium text-indigo-900/80 dark:text-indigo-100/90">
                        {t("quickQuestionManagerDesc")}
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              </div>

              <div className="border-gradient-yellow p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <Card className="h-full w-full rounded-[11px] border-0 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 dark:from-yellow-500/20 dark:to-amber-500/20 cursor-pointer">
                  <Link href="/topic-explainer">
                    <CardContent className="p-6 text-center">
                      <BookOpen className="h-8 w-8 mx-auto mb-3 text-yellow-600 dark:text-yellow-400" />
                      <h3 className="font-bold text-lg mb-2 bg-gradient-to-r from-yellow-600 to-amber-600 dark:from-yellow-400 dark:to-amber-400 bg-clip-text text-transparent">
                        {t("quickTopicExplainer")}
                      </h3>
                      <p className="text-sm font-medium text-yellow-900/80 dark:text-yellow-100/90">
                        {t("quickTopicExplainerDesc")}
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              </div>

              <div className="border-gradient-teal p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <Card className="h-full w-full rounded-[11px] border-0 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 dark:from-teal-500/20 dark:to-cyan-500/20 cursor-pointer">
                  <Link href="/subject-manager">
                    <CardContent className="p-6 text-center">
                      <GraduationCap className="h-8 w-8 mx-auto mb-3 text-teal-600 dark:text-teal-400" />
                      <h3 className="font-bold text-lg mb-2 bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                        {t("quickSubjectManager")}
                      </h3>
                      <p className="text-sm font-medium text-teal-900/80 dark:text-teal-100/90">
                        {t("quickSubjectManagerDesc")}
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              </div>
            </div>

            {/* Main CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-lg px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Brain className="h-5 w-5 mr-2" />
                  {t("goToDashboard")}
                </Button>
              </Link>
              <Button
                onClick={() => {
                  router.push("/demo");
                }}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-lg px-8 py-3 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0 transition-all duration-300 hover:scale-105"
              >
                <Play className="h-5 w-5 mr-2" />
                {t("tryDemo")}
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
