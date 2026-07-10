"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Sparkles,
  Image,
  BookOpen,
  Code2,
  Bot,
  GitBranch,
  Zap,
  CheckCircle,
  ArrowRight,
  MessageSquare,
  Palette,
  FileCode,
  Cpu,
  Globe,
  Layers,
} from "lucide-react";

export default function AIFeaturesShowcase() {
  const t = useTranslations("AIFeatures");
  const tLanding = useTranslations("Landing");
  const tNav = useTranslations("Navigation");

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:bg-transparent dark:!bg-none">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t("title")}
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="border-gradient-question p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
              <Card className="flex flex-col h-full w-full rounded-[11px] border-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    {t("topicExplainer")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm font-medium text-blue-900/80 dark:text-blue-100/90 mb-4">
                    {t("topicExplainerDesc")}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:hover:bg-blue-800/60 border-0">
                      {tLanding("badgeGoogleGemini")}
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-200 dark:hover:bg-purple-800/60 border-0">
                      {t("badgeMarkdown")}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:hover:bg-blue-800/60 border-0">
                      {t("badgeDynamicContent")}
                    </Badge>
                  </div>
                  <div className="mt-auto">
                    <Link href="/topic-explainer">
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        {t("tryIt")}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="border-gradient-purple p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
              <Card className="flex flex-col h-full w-full border-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 dark:from-purple-500/20 dark:to-violet-500/20 rounded-[11px]">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center mb-4">
                    <Image className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 dark:from-purple-400 dark:to-violet-400 bg-clip-text text-transparent">
                    {t("imageGen")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm font-medium text-purple-900/80 dark:text-purple-100/90 mb-4">
                    {t("imageGenDesc")}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-200 dark:hover:bg-purple-800/60 border-0">
                      {t("badgePollinations")}
                    </Badge>
                    <Badge className="bg-violet-100 text-violet-800 hover:bg-violet-200 dark:bg-violet-900/50 dark:text-violet-200 dark:hover:bg-violet-800/60 border-0">
                      {t("badgeEducational")}
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-200 dark:hover:bg-purple-800/60 border-0">
                      {t("badgeHighQuality")}
                    </Badge>
                  </div>
                  <div className="mt-auto">
                    <Link href="/topic-explainer">
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                      >
                        <Palette className="h-4 w-4 mr-2" />
                        {t("generateImage")}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="border-gradient-green p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
              <Card className="flex flex-col h-full w-full border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 rounded-[11px]">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                    {t("aiAssistant")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm font-medium text-green-900/80 dark:text-green-100/90 mb-4">
                    {t("aiAssistantDesc")}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-200 dark:hover:bg-green-800/60 border-0">
                      {t("badge24Support")}
                    </Badge>
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-200 dark:hover:bg-emerald-800/60 border-0">
                      {t("badgePersonalized")}
                    </Badge>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-200 dark:hover:bg-green-800/60 border-0">
                      {t("badgeSmartQa")}
                    </Badge>
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-200 dark:hover:bg-emerald-800/60 border-0">
                      {tNav("aiChatShort")}
                    </Badge>
                  </div>
                  <div className="mt-auto">
                    <Link href="/ai-chat">
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        <Bot className="h-4 w-4 mr-2" />
                        {t("chatNow")}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="border-gradient-orange p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
              <Card className="flex flex-col h-full w-full border-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20 rounded-[11px]">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center mb-4">
                    <Code2 className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">
                    {t("modernTechStack")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm font-medium text-orange-900/80 dark:text-orange-100/90 mb-4">
                    {t("modernTechStackDesc")}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/50 dark:text-orange-200 dark:hover:bg-orange-800/60 border-0">
                      Next.js 15.3.3
                    </Badge>
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-200 dark:hover:bg-red-800/60 border-0">
                      TypeScript
                    </Badge>
                    <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/50 dark:text-orange-200 dark:hover:bg-orange-800/60 border-0">
                      Tailwind CSS
                    </Badge>
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-200 dark:hover:bg-red-800/60 border-0">
                      {t("badgeEnterprise")}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-auto">
                    <div className="flex items-center gap-1 mb-1">
                      <GitBranch className="h-3 w-3" />
                      <span>{t("activeBranches")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bot className="h-3 w-3" />
                      <span>{t("qodoCursor")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="border-gradient-green p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
              <Card className="flex flex-col h-full w-full border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 rounded-[11px]">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                    {t("qualityAssurance")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm font-medium text-green-900/80 dark:text-green-100/90 mb-4">
                    {t("qualityAssuranceDesc")}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-200 dark:hover:bg-green-800/60 border-0">
                      {t("badgePythonScript")}
                    </Badge>
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-200 dark:hover:bg-emerald-800/60 border-0">
                      ESLint
                    </Badge>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-200 dark:hover:bg-green-800/60 border-0">
                      TypeScript
                    </Badge>
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-200 dark:hover:bg-emerald-800/60 border-0">
                      {t("badgeTesting")}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-auto">
                    <div className="flex items-center gap-1 mb-1">
                      <Zap className="h-3 w-3" />
                      <span>{t("automatedTesting")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Layers className="h-3 w-3" />
                      <span>{t("productionReady")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="border-gradient-orange p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
              <Card className="flex flex-col h-full w-full border-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20 rounded-[11px]">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center mb-4">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">
                    {t("aiPoweredPlatform")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm font-medium text-orange-900/80 dark:text-orange-100/90 mb-4">
                    {t("aiPoweredPlatformDesc")}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/50 dark:text-orange-200 dark:hover:bg-orange-800/60 border-0">
                      {t("badgeAiPowered")}
                    </Badge>
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-200 dark:hover:bg-red-800/60 border-0">
                      {t("productionReady")}
                    </Badge>
                    <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/50 dark:text-orange-200 dark:hover:bg-orange-800/60 border-0">
                      {t("badgeModernTech")}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-auto">
                    <div className="flex items-center gap-1 mb-1">
                      <Cpu className="h-3 w-3" />
                      <span>{t("advancedAiIntegration")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileCode className="h-3 w-3" />
                      <span>{t("enterpriseLevel")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200 dark:border-blue-800 rounded-full px-6 py-3 mb-8">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {t("ctaBadge")}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/topic-explainer">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-lg px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Brain className="h-5 w-5 mr-2" />
                  {t("exploreAiFeatures")}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-lg px-8 py-3 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0 transition-all duration-300 hover:scale-105"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  {t("freeDemo")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
