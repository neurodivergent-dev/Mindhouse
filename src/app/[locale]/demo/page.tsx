"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Mic,
  Brain,
  Users,
  BookOpen,
  BarChart3,
  Zap,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import MobileNav from "@/components/mobile-nav";

interface DemoStep {
  id: number;
  title: string;
  description: string;
  action: string;
  icon: React.ReactNode;
  color: string;
}

export default function DemoPage() {
  const t = useTranslations("Demo");
  const locale = useLocale();
  const demoSubject = locale === "tr" ? "Matematik" : "Mathematics";
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  const demoSteps = useMemo<DemoStep[]>(
    () => [
      {
        id: 1,
        title: t("step1Title"),
        description: t("step1Description"),
        action: t("step1Action"),
        icon: <Brain className="h-6 w-6 text-white" />,
        color: "from-blue-500 to-indigo-600",
      },
      {
        id: 2,
        title: t("step2Title"),
        description: t("step2Description"),
        action: t("step2Action"),
        icon: <Mic className="h-6 w-6 text-white" />,
        color: "from-green-500 to-emerald-600",
      },
      {
        id: 3,
        title: t("step3Title"),
        description: t("step3Description"),
        action: t("step3Action"),
        icon: <BookOpen className="h-6 w-6 text-white" />,
        color: "from-purple-500 to-pink-600",
      },
      {
        id: 4,
        title: t("step4Title"),
        description: t("step4Description"),
        action: t("step4Action"),
        icon: <BarChart3 className="h-6 w-6 text-white" />,
        color: "from-orange-500 to-red-600",
      },
    ],
    [t],
  );

  React.useEffect(() => {
    const savedPlayingState = localStorage.getItem("demo_playing") === "true";
    setIsPlaying(savedPlayingState);
  }, []);

  const handleStepAction = (step: DemoStep) => {
    setCompletedSteps((prev) => [...prev, step.id]);
    localStorage.setItem("demo_mode", "true");

    toast({
      title: t("stepStarting", { title: step.title }),
      description: step.description,
    });

    switch (step.id) {
      case 1:
        router.push(`/quiz?subject=${demoSubject}&demo=true`);
        break;
      case 2:
        router.push("/ai-chat?demo=true");
        break;
      case 3:
        router.push(`/flashcard?subject=${demoSubject}&demo=true`);
        break;
      case 4:
        router.push("/dashboard?demo=true");
        break;
    }
  };

  const handlePlayPause = () => {
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);

    if (typeof window !== "undefined") {
      localStorage.setItem("demo_playing", newPlayingState.toString());
    }

    if (newPlayingState) {
      localStorage.setItem("demo_mode", "true");
      toast({
        title: t("demoStartedTitle"),
        description: t("demoStartedDesc"),
      });
    } else {
      localStorage.removeItem("demo_mode");
      toast({
        title: t("demoPausedTitle"),
        description: t("demoPausedDesc"),
      });
    }
  };

  const handleNext = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <MobileNav />
      <main className="flex-1 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:bg-transparent dark:!bg-none overflow-x-hidden">
        <div className="container mx-auto px-4 py-8 overflow-x-hidden">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                <Brain className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-black mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t("title")}
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">{t("subtitle")}</p>

            <div className="flex items-center justify-center space-x-4 mb-8">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0 transition-all"
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              <Button
                onClick={handlePlayPause}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span className="ml-2">{isPlaying ? t("pause") : t("start")}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentStep === demoSteps.length - 1}
                className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0 transition-all"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">{t("progress")}</span>
              <span className="text-sm text-gray-500">
                {t("progressCount", { current: currentStep + 1, total: demoSteps.length })}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentStep + 1) / demoSteps.length) * 100}%`,
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {demoSteps[currentStep] && (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="mb-8"
            >
              <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div
                      className={`bg-gradient-to-r ${demoSteps[currentStep].color} p-3 rounded-xl`}
                    >
                      {demoSteps[currentStep].icon}
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold">
                    {demoSteps[currentStep].title}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {demoSteps[currentStep].description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button
                    onClick={() =>
                      demoSteps[currentStep] && handleStepAction(demoSteps[currentStep])
                    }
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    size="lg"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {demoSteps[currentStep].action}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 items-stretch max-w-full overflow-x-hidden p-4">
            {demoSteps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="h-full w-full max-w-sm mx-auto md:max-w-none"
              >
                <div className="relative h-full rounded-xl p-[2px] group">
                  {/* Dynamic Gradient Layer */}
                  <div
                    className={`absolute inset-0 rounded-xl bg-gradient-to-br ${step.color} transition-opacity duration-300 ${
                      currentStep === index
                        ? "opacity-100 shadow-lg"
                        : "opacity-0 group-hover:opacity-100 group-hover:shadow-md"
                    }`}
                  />
                  {/* Default Subtle Border Layer */}
                  <div
                    className={`absolute inset-0 rounded-xl border border-border transition-opacity duration-300 ${
                      currentStep === index ? "opacity-0" : "opacity-100 group-hover:opacity-0"
                    }`}
                  />

                  <Card
                    className={`relative cursor-pointer h-full border-0 rounded-[10px] ${
                      completedSteps.includes(step.id)
                        ? "bg-green-50 dark:bg-green-900/20"
                        : "bg-card"
                    }`}
                    onClick={() => setCurrentStep(index)}
                  >
                    <CardHeader className="text-center pb-3">
                      <div className="flex justify-center mb-2">
                        <div className={`bg-gradient-to-r ${step.color} p-2 rounded-lg`}>
                          {step.icon}
                        </div>
                      </div>
                      <CardTitle className="text-lg font-semibold">{step.title}</CardTitle>
                      {completedSteps.includes(step.id) && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {t("completed")}
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent className="text-center pt-0">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <Card className="shadow-xl border-gradient-question bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white drop-shadow-lg">
                  {t("ctaTitle")}
                </h2>
                <p className="text-gray-900 dark:text-white mb-6 font-medium drop-shadow-md">
                  {t("ctaDescription")}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => router.push("/login?mode=register")}
                    variant="secondary"
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    {t("registerFree")}
                  </Button>
                  <Button
                    onClick={() => router.push("/")}
                    variant="secondary"
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    {t("goHome")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
