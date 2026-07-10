"use client";

import React from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Key,
  Settings,
  CheckCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  Brain,
  Zap,
  BookOpen,
  Bot,
  Shield,
  Layers,
} from "lucide-react";

function FeatureListItem({ children }: { children: React.ReactNode }) {
  return <li className="flex items-start gap-2 text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">• {children}</li>;
}

export default function AIFlashcardSetupPage() {
  const router = useRouter();
  const t = useTranslations("AiFlashcardSetup");

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-transparent dark:!bg-none p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button
            onClick={() => router.push("/flashcard-manager")}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-white dark:bg-white/5 border-white/20 dark:border-white/10 rounded-xl hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("backToManager")}
          </Button>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg mb-4">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
              {t("title")}
            </h1>
            <p className="text-sm sm:text-base text-[#86868b] dark:text-[#a1a1a6] font-medium max-w-xl mx-auto">
              {t("subtitle")}
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-sm">
                <Brain className="w-3 h-3 mr-1" />
                {t("badgeAiIntegration")}
              </Badge>
              <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400 bg-green-500/10">
                <CheckCircle className="w-3 h-3 mr-1" />
                {t("badgeRequired")}
              </Badge>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-3xl mx-auto h-12 p-1 bg-white/60 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 backdrop-blur-md rounded-2xl">
            <TabsTrigger value="overview" className="flex items-center justify-center gap-2 text-xs sm:text-sm rounded-xl">
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">{t("tabs.overview")}</span>
              <span className="sm:hidden">{t("tabs.overviewShort")}</span>
            </TabsTrigger>
            <TabsTrigger value="setup" className="flex items-center justify-center gap-2 text-xs sm:text-sm rounded-xl">
              <Settings className="w-4 h-4" />
              <span>{t("tabs.setup")}</span>
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center justify-center gap-2 text-xs sm:text-sm rounded-xl">
              <CheckCircle className="w-4 h-4" />
              <span>{t("tabs.testing")}</span>
            </TabsTrigger>
            <TabsTrigger value="troubleshooting" className="flex items-center justify-center gap-2 text-xs sm:text-sm rounded-xl">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">{t("tabs.troubleshooting")}</span>
              <span className="sm:hidden">{t("tabs.troubleshootingShort")}</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Content */}
          <TabsContent value="overview">
            <div className="space-y-6">
              <Card className="apple-glass-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#1d1d1f] dark:text-[#f5f5f7]">
                    <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    {t("overview.featuresTitle")}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{t("overview.featuresDescription")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-slate-200/50 dark:border-white/[0.05] rounded-2xl bg-white/40 dark:bg-white/[0.02]">
                      <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
                        🚀 {t("overview.autoGenTitle")}
                      </h4>
                      <ul className="space-y-1">
                        <FeatureListItem>{t("overview.autoGenItem1")}</FeatureListItem>
                        <FeatureListItem>{t("overview.autoGenItem2")}</FeatureListItem>
                        <FeatureListItem>{t("overview.autoGenItem3")}</FeatureListItem>
                        <FeatureListItem>{t("overview.autoGenItem4")}</FeatureListItem>
                      </ul>
                    </div>
                    <div className="p-4 border border-slate-200/50 dark:border-white/[0.05] rounded-2xl bg-white/40 dark:bg-white/[0.02]">
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-2">
                        🎯 {t("overview.smartCustomTitle")}
                      </h4>
                      <ul className="space-y-1">
                        <FeatureListItem>{t("overview.smartCustomItem1")}</FeatureListItem>
                        <FeatureListItem>{t("overview.smartCustomItem2")}</FeatureListItem>
                        <FeatureListItem>{t("overview.smartCustomItem3")}</FeatureListItem>
                        <FeatureListItem>{t("overview.smartCustomItem4")}</FeatureListItem>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-500/5 to-emerald-500/5 border border-green-500/20 rounded-2xl">
                    <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
                      💡 {t("overview.whyAiTitle")}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#1d1d1f] dark:text-[#f5f5f7] font-medium leading-relaxed">
                      {t("overview.whyAiDescription")}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="apple-glass-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#1d1d1f] dark:text-[#f5f5f7]">
                    <Key className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                    {t("overview.requirementsTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        title: t("overview.reqApiKeyTitle"),
                        desc: t("overview.reqApiKeyDesc"),
                      },
                      {
                        title: t("overview.reqInternetTitle"),
                        desc: t("overview.reqInternetDesc"),
                      },
                      {
                        title: t("overview.reqBrowserTitle"),
                        desc: t("overview.reqBrowserDesc"),
                      },
                    ].map((req, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 border border-slate-200/50 dark:border-white/[0.05] rounded-2xl bg-white/40 dark:bg-white/[0.02]">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">{req.title}</h4>
                          <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium">{req.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Setup Content (Bring Your Own Key) */}
          <TabsContent value="setup">
            <div className="space-y-6">
              <Card className="apple-glass-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#1d1d1f] dark:text-[#f5f5f7]">
                    <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    {t("setup.step1Title")}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{t("setup.step1Description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border border-slate-200/50 dark:border-white/[0.05] rounded-2xl bg-white/40 dark:bg-white/[0.02] flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">{t("setup.step1Item1Title")}</h4>
                        <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mb-4">Google&apos;ın en yeni modellerine ücretsiz erişim anahtarı.</p>
                      </div>
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold bg-[#007aff]/10 hover:bg-[#007aff]/20 text-[#007aff] rounded-xl transition-all"
                      >
                        Google AI Studio
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="p-4 border border-slate-200/50 dark:border-white/[0.05] rounded-2xl bg-white/40 dark:bg-white/[0.02] flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">{t("setup.step1Item2Title")}</h4>
                        <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mb-4">{t("setup.step1Item2Desc")}</p>
                      </div>
                      <a
                        href="https://console.groq.com/keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold bg-[#34c759]/10 hover:bg-[#34c759]/20 text-[#34c759] rounded-xl transition-all"
                      >
                        Groq Console
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="p-4 border border-slate-200/50 dark:border-white/[0.05] rounded-2xl bg-white/40 dark:bg-white/[0.02] flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">{t("setup.step1Item3Title")}</h4>
                        <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mb-4">{t("setup.step1Item3Desc")}</p>
                      </div>
                      <a
                        href="https://ollama.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold bg-[#ff9500]/10 hover:bg-[#ff9500]/20 text-[#ff9500] rounded-xl transition-all"
                      >
                        Ollama Website
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                    <Shield className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                        🔒 {t("setup.securityWarningTitle")}
                      </h4>
                      <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium leading-relaxed">
                        {t("setup.securityWarningDesc")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation to settings */}
              <Card className="apple-glass-card border-0 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-30 pointer-events-none" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#1d1d1f] dark:text-[#f5f5f7]">
                    <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-spin-slow" />
                    {t("setup.step2Title")}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{t("setup.step2Description")}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center py-6 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md mb-4">
                    <Settings className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                    Ayarlar Panelini Açın
                  </h3>
                  <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] max-w-sm mb-6 font-medium">
                    Uygulamanın Ayarlar sayfasına giderek tercih ettiğiniz sağlayıcıyı seçebilir ve API anahtarınızı güvenle kaydedebilirsiniz.
                  </p>
                  <Button
                    onClick={() => router.push("/settings")}
                    className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg transition-all"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Ayarlar&apos;a Git
                  </Button>
                </CardContent>
              </Card>

              <Card className="apple-glass-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#1d1d1f] dark:text-[#f5f5f7]">
                    <Layers className="w-5 h-5 text-green-600 dark:text-green-400" />
                    {t("setup.step3Title")}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{t("setup.step3Description")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 border border-slate-200/50 dark:border-white/[0.05] rounded-2xl bg-white/40 dark:bg-white/[0.02]">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">Yapay Zeka Sağlayıcısı Seçimi</h4>
                        <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium mt-0.5">Gemini, Groq veya Ollama seçeneklerinden birini belirleyin.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border border-slate-200/50 dark:border-white/[0.05] rounded-2xl bg-white/40 dark:bg-white/[0.02]">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">Anahtarı Girin ve Model Seçin</h4>
                        <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium mt-0.5">API anahtarınızı yapıştırın. Model olarak gemini-2.0-flash veya istediğiniz bir modeli tanımlayın.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border border-slate-200/50 dark:border-white/[0.05] rounded-2xl bg-white/40 dark:bg-white/[0.02]">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">Ayarları Kaydedin</h4>
                        <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium mt-0.5">Sayfanın altındaki &quot;Ayarları Kaydet&quot; butonuna basarak değişiklikleri tarayıcınıza kaydedin.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Testing Content */}
          <TabsContent value="testing">
            <div className="space-y-6">
              <Card className="apple-glass-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#1d1d1f] dark:text-[#f5f5f7]">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    {t("testing.testTitle")}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{t("testing.testDescription")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { step: 1, title: t("testing.step1Title"), desc: t("testing.openManager") },
                      { step: 2, title: t("testing.step2Title"), desc: t("testing.step2Desc") },
                      { step: 3, title: t("testing.step3Title"), desc: t("testing.step3Desc") },
                      { step: 4, title: t("testing.step4Title"), desc: t("testing.step4Desc") },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 border border-slate-200/50 dark:border-white/[0.05] rounded-2xl bg-white/40 dark:bg-white/[0.02]">
                        <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                          {item.step}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">{item.title}</h4>
                          <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                    <h4 className="font-bold text-sm text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
                      🧪 {t("testing.scenariosTitle")}
                    </h4>
                    <ul className="space-y-1">
                      <FeatureListItem>{t("testing.scenario1")}</FeatureListItem>
                      <FeatureListItem>{t("testing.scenario2")}</FeatureListItem>
                      <FeatureListItem>{t("testing.scenario3")}</FeatureListItem>
                      <FeatureListItem>{t("testing.scenario4")}</FeatureListItem>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="apple-glass-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#1d1d1f] dark:text-[#f5f5f7]">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    {t("testing.performanceTitle")}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{t("testing.performanceDescription")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="text-center p-4 border border-slate-200/50 dark:border-white/[0.05] rounded-2xl bg-white/40 dark:bg-white/[0.02]">
                      <div className="text-2xl font-black text-blue-500">~3-5s</div>
                      <div className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium mt-1">
                        {t("testing.avgGenerationTime")}
                      </div>
                    </div>
                    <div className="text-center p-4 border border-slate-200/50 dark:border-white/[0.05] rounded-2xl bg-white/40 dark:bg-white/[0.02]">
                      <div className="text-2xl font-black text-green-500">95%+</div>
                      <div className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium mt-1">
                        {t("testing.successRate")}
                      </div>
                    </div>
                    <div className="text-center p-4 border border-slate-200/50 dark:border-white/[0.05] rounded-2xl bg-white/40 dark:bg-white/[0.02]">
                      <div className="text-2xl font-black text-purple-500">85%+</div>
                      <div className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium mt-1">
                        {t("testing.qualityScore")}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Troubleshooting Content */}
          <TabsContent value="troubleshooting">
            <div className="space-y-6">
              <Card className="apple-glass-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#1d1d1f] dark:text-[#f5f5f7]">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    {t("troubleshooting.title")}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{t("troubleshooting.description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-4 border border-red-500/10 dark:border-red-500/20 rounded-2xl bg-red-500/5">
                      <h4 className="font-bold text-sm text-red-600 dark:text-red-400 mb-1">
                        ❌ {t("troubleshooting.apiKeyErrorTitle")}
                      </h4>
                      <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium mb-3">
                        {t("troubleshooting.apiKeyErrorDesc")}
                      </p>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-red-600 dark:text-red-400">
                          {t("troubleshooting.solutionLabel")}
                        </p>
                        <ol className="text-xs text-[#1d1d1f] dark:text-[#f5f5f7] space-y-1 list-decimal list-inside font-medium">
                          <li>{t("troubleshooting.apiKeySolution1")}</li>
                          <li>{t("troubleshooting.apiKeySolution2")}</li>
                          <li>{t("troubleshooting.apiKeySolution3")}</li>
                        </ol>
                      </div>
                    </div>

                    <div className="p-4 border border-orange-500/10 dark:border-orange-500/20 rounded-2xl bg-orange-500/5">
                      <h4 className="font-bold text-sm text-orange-500 dark:text-orange-400 mb-1">
                        ⚠️ {t("troubleshooting.failedGenTitle")}
                      </h4>
                      <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium mb-3">
                        {t("troubleshooting.failedGenDesc")}
                      </p>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-orange-500 dark:text-orange-400">
                          {t("troubleshooting.solutionLabel")}
                        </p>
                        <ol className="text-xs text-[#1d1d1f] dark:text-[#f5f5f7] space-y-1 list-decimal list-inside font-medium">
                          <li>{t("troubleshooting.failedGenSolution1")}</li>
                          <li>{t("troubleshooting.failedGenSolution2")}</li>
                          <li>{t("troubleshooting.failedGenSolution3")}</li>
                        </ol>
                      </div>
                    </div>

                    <div className="p-4 border border-amber-500/10 dark:border-amber-500/20 rounded-2xl bg-amber-500/5">
                      <h4 className="font-bold text-sm text-amber-500 dark:text-amber-400 mb-1">
                        🔄 {t("troubleshooting.envVarTitle")}
                      </h4>
                      <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium mb-3">
                        {t("troubleshooting.envVarDesc")}
                      </p>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-amber-500 dark:text-amber-400">
                          {t("troubleshooting.solutionLabel")}
                        </p>
                        <ol className="text-xs text-[#1d1d1f] dark:text-[#f5f5f7] space-y-1 list-decimal list-inside font-medium">
                          <li>{t("troubleshooting.envVarSolution1")}</li>
                          <li>{t("troubleshooting.envVarSolution2")}</li>
                          <li>{t("troubleshooting.envVarSolution3")}</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm text-[#1d1d1f] dark:text-[#f5f5f7] mb-1 font-bold">
                        🆘 {t("troubleshooting.stillIssuesTitle")}
                      </h4>
                      <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium leading-relaxed">
                        {t("troubleshooting.stillIssuesDesc")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="apple-glass-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#1d1d1f] dark:text-[#f5f5f7]">
                    <Settings className="w-5 h-5 text-gray-500" />
                    {t("troubleshooting.debugTitle")}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{t("troubleshooting.debugDescription")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 border border-slate-200/50 dark:border-white/[0.05] rounded-2xl bg-white/40 dark:bg-white/[0.02]">
                    <h4 className="font-bold text-sm text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                      {t("troubleshooting.envCheckTitle")}
                    </h4>
                    <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium">
                      {t("troubleshooting.envCheckInstruction")} {t("troubleshooting.envCheckHint")}
                    </p>
                  </div>

                  <div className="p-3 border border-slate-200/50 dark:border-white/[0.05] rounded-2xl bg-white/40 dark:bg-white/[0.02]">
                    <h4 className="font-bold text-sm text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                      {t("troubleshooting.consoleCheckTitle")}
                    </h4>
                    <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium">
                      {t("troubleshooting.consoleCheckDesc")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions Card */}
        <div className="mt-12">
          <Card className="apple-glass-card border-0 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-center text-lg text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                {t("quickActions.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => router.push("/flashcard-manager")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-blue-500/10 border-0"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  {t("quickActions.testAi")}
                </Button>
                <Button onClick={() => router.push("/flashcard")} variant="outline" className="bg-white dark:bg-white/5 border-slate-200/50 dark:border-white/10 rounded-xl">
                  <BookOpen className="w-4 h-4 mr-2" />
                  {t("quickActions.backToFlashcard")}
                </Button>
                <Button
                  onClick={() =>
                    window.open("https://aistudio.google.com/app/apikey", "_blank")
                  }
                  variant="outline"
                  className="bg-white dark:bg-white/5 border-slate-200/50 dark:border-white/10 rounded-xl"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {t("quickActions.getApiKey")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
