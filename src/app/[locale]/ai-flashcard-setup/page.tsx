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
  Code,
  Terminal,
  CheckCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  Copy,
  Brain,
  Zap,
  BookOpen,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function FeatureListItem({ children }: { children: React.ReactNode }) {
  return <li>• {children}</li>;
}

function StepCard({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
        {step}
      </div>
      <div>
        <h4 className="font-medium text-blue-800 dark:text-blue-200">{title}</h4>
        {description && (
          <p className="text-sm text-blue-700 dark:text-blue-300">{description}</p>
        )}
      </div>
    </div>
  );
}

function TestStepCard({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 p-3 border rounded-lg bg-green-50 dark:bg-green-900/20">
      <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
        {step}
      </div>
      <div>
        <h4 className="font-medium text-green-800 dark:text-green-200">{title}</h4>
        {children}
      </div>
    </div>
  );
}

function CodeBlock({
  label,
  code,
  onCopy,
  copyLabel,
  hint,
}: {
  label: string;
  code: string;
  onCopy: () => void;
  copyLabel: string;
  hint?: string;
}) {
  return (
    <div>
      <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm">
        <div className="flex items-center justify-between mb-2">
          <span>{label}</span>
          <Button onClick={onCopy} variant="outline" size="sm" className="h-6 text-xs">
            <Copy className="w-3 h-3 mr-1" />
            {copyLabel}
          </Button>
        </div>
        <code>{code}</code>
      </div>
      {hint && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{hint}</p>
      )}
    </div>
  );
}

export default function AIFlashcardSetupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations("AiFlashcardSetup");

  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text);
    toast({
      title: t("toasts.copiedTitle"),
      description: t("toasts.copiedDescription"),
      variant: "default",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-transparent dark:!bg-none p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button
            onClick={() => router.push("/flashcard-manager")}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("backToManager")}
          </Button>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              {t("title")}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t("subtitle")}
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <Brain className="w-3 h-3 mr-1" />
                {t("badgeAiIntegration")}
              </Badge>
              <Badge variant="outline" className="border-green-500 text-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                {t("badgeRequired")}
              </Badge>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4 max-w-3xl mx-auto gap-2 sm:gap-0 h-auto sm:h-10 p-2 sm:p-1">
            <TabsTrigger value="overview" className="flex items-center justify-center gap-2 text-sm">
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">{t("tabs.overview")}</span>
              <span className="sm:hidden">{t("tabs.overviewShort")}</span>
            </TabsTrigger>
            <TabsTrigger value="setup" className="flex items-center justify-center gap-2 text-sm">
              <Settings className="w-4 h-4" />
              <span>{t("tabs.setup")}</span>
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center justify-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>{t("tabs.testing")}</span>
            </TabsTrigger>
            <TabsTrigger value="troubleshooting" className="flex items-center justify-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">{t("tabs.troubleshooting")}</span>
              <span className="sm:hidden">{t("tabs.troubleshootingShort")}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    {t("overview.featuresTitle")}
                  </CardTitle>
                  <CardDescription>{t("overview.featuresDescription")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                        🚀 {t("overview.autoGenTitle")}
                      </h4>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        <FeatureListItem>{t("overview.autoGenItem1")}</FeatureListItem>
                        <FeatureListItem>{t("overview.autoGenItem2")}</FeatureListItem>
                        <FeatureListItem>{t("overview.autoGenItem3")}</FeatureListItem>
                        <FeatureListItem>{t("overview.autoGenItem4")}</FeatureListItem>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-900/20">
                      <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                        🎯 {t("overview.smartCustomTitle")}
                      </h4>
                      <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                        <FeatureListItem>{t("overview.smartCustomItem1")}</FeatureListItem>
                        <FeatureListItem>{t("overview.smartCustomItem2")}</FeatureListItem>
                        <FeatureListItem>{t("overview.smartCustomItem3")}</FeatureListItem>
                        <FeatureListItem>{t("overview.smartCustomItem4")}</FeatureListItem>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                      💡 {t("overview.whyAiTitle")}
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {t("overview.whyAiDescription")}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-orange-600" />
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
                    ].map((req) => (
                      <div key={req.title} className="flex items-center gap-3 p-3 border rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <h4 className="font-medium">{req.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{req.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="setup">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-600" />
                    {t("setup.step1Title")}
                  </CardTitle>
                  <CardDescription>{t("setup.step1Description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-800 dark:text-blue-200">
                          {t("setup.step1Item1Title")}
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                          <a
                            href="https://aistudio.google.com/app/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          >
                            https://aistudio.google.com/app/apikey
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </p>
                      </div>
                    </div>

                    <StepCard
                      step={2}
                      title={t("setup.step1Item2Title")}
                      description={t("setup.step1Item2Desc")}
                    />
                    <StepCard
                      step={3}
                      title={t("setup.step1Item3Title")}
                      description={t("setup.step1Item3Desc")}
                    />
                    <StepCard
                      step={4}
                      title={t("setup.step1Item4Title")}
                      description={t("setup.step1Item4Desc")}
                    />
                  </div>

                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                          ⚠️ {t("setup.securityWarningTitle")}
                        </h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          {t("setup.securityWarningDesc")}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-green-600" />
                    {t("setup.step2Title")}
                  </CardTitle>
                  <CardDescription>{t("setup.step2Description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">{t("setup.powershellTitle")}</h4>
                      <CodeBlock
                        label={t("setup.powershellCommandLabel")}
                        code='$env:GEMINI_API_KEY="your-api-key-here"'
                        onCopy={() => copyToClipboard('$env:GEMINI_API_KEY="your-api-key-here"')}
                        copyLabel={t("copy")}
                        hint={t("setup.powershellHint")}
                      />
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">{t("setup.cmdTitle")}</h4>
                      <CodeBlock
                        label={t("setup.cmdCommandLabel")}
                        code="set GEMINI_API_KEY=your-api-key-here"
                        onCopy={() => copyToClipboard("set GEMINI_API_KEY=your-api-key-here")}
                        copyLabel={t("copy")}
                      />
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">{t("setup.permanentTitle")}</h4>
                      <CodeBlock
                        label={t("setup.powershellCommandLabel")}
                        code='[Environment]::SetEnvironmentVariable("GEMINI_API_KEY", "your-api-key-here", "User")'
                        onCopy={() =>
                          copyToClipboard(
                            '[Environment]::SetEnvironmentVariable("GEMINI_API_KEY", "your-api-key-here", "User")',
                          )
                        }
                        copyLabel={t("copy")}
                        hint={t("setup.permanentHint")}
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                          💡 {t("setup.tipTitle")}
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {t("setup.tipDesc")}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-purple-600" />
                    {t("setup.step3Title")}
                  </CardTitle>
                  <CardDescription>{t("setup.step3Description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{t("setup.envFileTitle")}</h4>
                    <CodeBlock
                      label={t("setup.envFileInstruction")}
                      code="GEMINI_API_KEY=your-api-key-here"
                      onCopy={() => copyToClipboard("GEMINI_API_KEY=your-api-key-here")}
                      copyLabel={t("copy")}
                      hint={t("setup.envFileHint")}
                    />
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">
                          ✅ {t("setup.setupCompleteTitle")}
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          {t("setup.setupCompleteDesc")}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="testing">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    {t("testing.testTitle")}
                  </CardTitle>
                  <CardDescription>{t("testing.testDescription")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <TestStepCard step={1} title={t("testing.step1Title")}>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        <Button
                          onClick={() => router.push("/flashcard-manager")}
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs"
                        >
                          {t("testing.openManager")}
                        </Button>
                      </p>
                    </TestStepCard>
                    <TestStepCard
                      step={2}
                      title={t("testing.step2Title")}
                    >
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {t("testing.step2Desc")}
                      </p>
                    </TestStepCard>
                    <TestStepCard
                      step={3}
                      title={t("testing.step3Title")}
                    >
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {t("testing.step3Desc")}
                      </p>
                    </TestStepCard>
                    <TestStepCard
                      step={4}
                      title={t("testing.step4Title")}
                    >
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {t("testing.step4Desc")}
                      </p>
                    </TestStepCard>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                          🧪 {t("testing.scenariosTitle")}
                        </h4>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                          <FeatureListItem>{t("testing.scenario1")}</FeatureListItem>
                          <FeatureListItem>{t("testing.scenario2")}</FeatureListItem>
                          <FeatureListItem>{t("testing.scenario3")}</FeatureListItem>
                          <FeatureListItem>{t("testing.scenario4")}</FeatureListItem>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    {t("testing.performanceTitle")}
                  </CardTitle>
                  <CardDescription>{t("testing.performanceDescription")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">~3-5s</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t("testing.avgGenerationTime")}
                      </div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">95%+</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t("testing.successRate")}
                      </div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">85%+</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t("testing.qualityScore")}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="troubleshooting">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    {t("troubleshooting.title")}
                  </CardTitle>
                  <CardDescription>{t("troubleshooting.description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg bg-red-50 dark:bg-red-900/20">
                      <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                        ❌ {t("troubleshooting.apiKeyErrorTitle")}
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                        {t("troubleshooting.apiKeyErrorDesc")}
                      </p>
                      <div className="space-y-2">
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                          {t("troubleshooting.solutionLabel")}
                        </p>
                        <ol className="text-xs text-red-600 dark:text-red-400 space-y-1 ml-4">
                          <li>1. {t("troubleshooting.apiKeySolution1")}</li>
                          <li>
                            2. <code>$env:GEMINI_API_KEY=&quot;your-key&quot;</code>{" "}
                            {t("troubleshooting.apiKeySolution2")}
                          </li>
                          <li>3. {t("troubleshooting.apiKeySolution3")}</li>
                        </ol>
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg bg-orange-50 dark:bg-orange-900/20">
                      <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">
                        ⚠️ {t("troubleshooting.failedGenTitle")}
                      </h4>
                      <p className="text-sm text-orange-700 dark:text-orange-700 mb-2">
                        {t("troubleshooting.failedGenDesc")}
                      </p>
                      <div className="space-y-2">
                        <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                          {t("troubleshooting.solutionLabel")}
                        </p>
                        <ol className="text-xs text-orange-600 dark:text-orange-400 space-y-1 ml-4">
                          <li>1. {t("troubleshooting.failedGenSolution1")}</li>
                          <li>2. {t("troubleshooting.failedGenSolution2")}</li>
                          <li>3. {t("troubleshooting.failedGenSolution3")}</li>
                        </ol>
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                        🔄 {t("troubleshooting.envVarTitle")}
                      </h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-700 mb-2">
                        {t("troubleshooting.envVarDesc")}
                      </p>
                      <div className="space-y-2">
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                          {t("troubleshooting.solutionLabel")}
                        </p>
                        <ol className="text-xs text-yellow-600 dark:text-yellow-400 space-y-1 ml-4">
                          <li>1. {t("troubleshooting.envVarSolution1")}</li>
                          <li>2. {t("troubleshooting.envVarSolution2")}</li>
                          <li>3. {t("troubleshooting.envVarSolution3")}</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                          🆘 {t("troubleshooting.stillIssuesTitle")}
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {t("troubleshooting.stillIssuesDesc")}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-gray-600" />
                    {t("troubleshooting.debugTitle")}
                  </CardTitle>
                  <CardDescription>{t("troubleshooting.debugDescription")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">
                        {t("troubleshooting.envCheckTitle")}
                      </h4>
                      <CodeBlock
                        label={t("troubleshooting.envCheckInstruction")}
                        code="echo $env:GEMINI_API_KEY"
                        onCopy={() => copyToClipboard("echo $env:GEMINI_API_KEY")}
                        copyLabel={t("copy")}
                        hint={t("troubleshooting.envCheckHint")}
                      />
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">
                        {t("troubleshooting.consoleCheckTitle")}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t("troubleshooting.consoleCheckDesc")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-12">
          <Card className="border-gradient-question bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-center text-xl">
                <Zap className="w-6 h-6 inline mr-2 text-yellow-500" />
                {t("quickActions.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => router.push("/flashcard-manager")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  {t("quickActions.testAi")}
                </Button>
                <Button onClick={() => router.push("/flashcard")} variant="outline">
                  <BookOpen className="w-4 h-4 mr-2" />
                  {t("quickActions.backToFlashcard")}
                </Button>
                <Button
                  onClick={() =>
                    window.open("https://aistudio.google.com/app/apikey", "_blank")
                  }
                  variant="outline"
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
