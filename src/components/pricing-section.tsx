"use client";

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Check, X, Star, Zap, Crown, Building, Users, MessageSquare } from "lucide-react";

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  limitations: string[];
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
}

export default function PricingSection() {
  const t = useTranslations("Pricing");

  const pricingPlans: PricingPlan[] = useMemo(
    () => [
      {
        id: "free",
        name: t("freeName"),
        description: t("freeDescription"),
        price: "0",
        period: "",
        features: t.raw("freeFeatures") as string[],
        limitations: t.raw("freeLimitations") as string[],
        icon: <Users className="h-6 w-6" />,
        color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      },
      {
        id: "premium",
        name: t("premiumName"),
        description: t("premiumDescription"),
        price: "15",
        period: "perMonth",
        features: t.raw("premiumFeatures") as string[],
        limitations: t.raw("premiumLimitations") as string[],
        popular: true,
        icon: <Star className="h-6 w-6" />,
        color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
      },
      {
        id: "enterprise",
        name: t("enterpriseName"),
        description: t("enterpriseDescription"),
        price: "144",
        period: "perYear",
        features: t.raw("enterpriseFeatures") as string[],
        limitations: t.raw("enterpriseLimitations") as string[],
        icon: <Building className="h-6 w-6" />,
        color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      },
    ],
    [t],
  );

  const faqItems = useMemo(
    () => [
      { question: t("faq1Question"), answer: t("faq1Answer") },
      { question: t("faq2Question"), answer: t("faq2Answer") },
      { question: t("faq3Question"), answer: t("faq3Answer") },
      { question: t("faq4Question"), answer: t("faq4Answer") },
    ],
    [t],
  );

  const handlePlanSelect = () => {
    // Payment integration can be started here
  };

  return (
    <section id="pricing" className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t("title")}
          </span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-stretch">
        {pricingPlans.map((plan) => (
          <Card
            key={plan.id}
            className={`border-gradient-question relative flex flex-col h-full rounded-3xl ${
              plan.popular
                ? "ring-4 ring-purple-600 shadow-2xl scale-105 z-10"
                : "hover:shadow-xl transition-all hover:-translate-y-1"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4.5 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 px-5 py-1.5 hover:from-purple-700 hover:to-pink-700 rounded-full font-extrabold text-xs shadow-md">
                  <Crown className="h-3.5 w-3.5 mr-1 inline" />
                  {t("mostPopular")}
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pt-8 pb-4">
              <div
                className={`mx-auto mb-4 p-3 rounded-2xl w-14 h-14 flex items-center justify-center border ${plan.color}`}
              >
                {plan.icon}
              </div>
              <CardTitle className="text-3xl font-black text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
                {plan.name}
              </CardTitle>
              <CardDescription className="text-sm sm:text-base font-semibold text-[#86868b] dark:text-[#a1a1a6] mt-2">
                {plan.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 flex-grow px-6 sm:px-8">
              <div className="text-center py-2 border-y border-slate-100/50 dark:border-white/[0.04]">
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-black text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
                    ${plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-base font-bold text-indigo-500/80 ml-2">
                      /{t(plan.period)}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-extrabold text-base text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
                  {t("includedFeatures")}
                </h4>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base text-[#1d1d1f]/90 dark:text-[#f5f5f7]/90 font-semibold leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {plan.limitations.length > 0 && (
                <div className="space-y-4 pt-2 border-t border-slate-100/50 dark:border-white/[0.04]">
                  <h4 className="font-extrabold text-base text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
                    {t("limitationsLabel")}
                  </h4>
                  <ul className="space-y-3">
                    {plan.limitations.map((limitation) => (
                      <li key={limitation} className="flex items-start space-x-3">
                        <X className="h-5 w-5 text-slate-400 dark:text-slate-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm sm:text-base text-[#86868b] dark:text-[#a1a1a6] font-semibold leading-relaxed">
                          {limitation}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
            <CardFooter className="pb-8 px-6 sm:px-8">
              <Button
                onClick={() => handlePlanSelect()}
                className={`w-full h-12 text-base font-extrabold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all border-0 ${
                  plan.popular
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-purple-500/20"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-blue-500/20"
                }`}
              >
                {plan.price === "0" ? t("startFree") : t("selectPlan")}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mb-16">
        <h3 className="text-2xl font-bold text-center mb-8">{t("comparisonTitle")}</h3>
        <Card className="mx-auto w-full apple-glass-card border-0 shadow-2xl overflow-hidden backdrop-blur-md rounded-3xl">
          <CardContent className="p-4 sm:p-6">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200/40 dark:border-white/[0.06]">
                    <th className="text-left py-6 px-8 font-bold text-base text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight min-w-[220px]">
                      {t("featureColumn")}
                    </th>
                    <th className="text-center py-6 px-8 font-semibold text-sm text-[#86868b] dark:text-[#a1a1a6] tracking-tight">
                      {t("freePlan")}
                    </th>
                    <th className="text-center py-6 px-8 font-bold text-sm text-indigo-600 dark:text-indigo-400 tracking-tight bg-indigo-500/[0.03] dark:bg-indigo-500/[0.05] rounded-t-2xl">
                      <span className="flex flex-col items-center gap-1">
                        {t("premiumPlan")}
                        <span className="text-[9px] uppercase tracking-widest font-black text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                          Pro
                        </span>
                      </span>
                    </th>
                    <th className="text-center py-6 px-8 font-bold text-sm text-purple-600 dark:text-purple-400 tracking-tight">
                      {t("enterprisePlan")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50 dark:divide-white/[0.03]">
                  <tr className="hover:bg-slate-50/40 dark:hover:bg-white/[0.01] transition-colors">
                    <td className="py-6 px-8 font-bold text-[#1d1d1f] dark:text-[#f5f5f7] text-sm">
                      {t("compareAiQuestions")}
                    </td>
                    <td className="text-center py-6 px-8 text-[#86868b] dark:text-[#a1a1a6] font-semibold text-xs">
                      {t("compareAiQuestionsFree")}
                    </td>
                    <td className="text-center py-6 px-8 text-indigo-600 dark:text-indigo-400 font-extrabold text-sm bg-indigo-500/[0.03] dark:bg-indigo-500/[0.05]">
                      {t("compareUnlimited")}
                    </td>
                    <td className="text-center py-6 px-8 text-purple-600 dark:text-purple-400 font-bold text-sm">
                      {t("compareUnlimited")}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/40 dark:hover:bg-white/[0.01] transition-colors">
                    <td className="py-6 px-8 font-bold text-[#1d1d1f] dark:text-[#f5f5f7] text-sm">
                      {t("compareVoiceAssistant")}
                    </td>
                    <td className="text-center py-6 px-8">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto border border-slate-200/10">
                        <X className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                      </div>
                    </td>
                    <td className="text-center py-6 px-8 bg-indigo-500/[0.03] dark:bg-indigo-500/[0.05]">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto border border-indigo-500/20 shadow-sm">
                        <Check className="h-4.5 w-4.5 text-indigo-500" />
                      </div>
                    </td>
                    <td className="text-center py-6 px-8">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto border border-purple-500/20 shadow-sm">
                        <Check className="h-4.5 w-4.5 text-purple-500" />
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/40 dark:hover:bg-white/[0.01] transition-colors">
                    <td className="py-6 px-8 font-bold text-[#1d1d1f] dark:text-[#f5f5f7] text-sm">
                      {t("compareAnalytics")}
                    </td>
                    <td className="text-center py-6 px-8 text-[#86868b] dark:text-[#a1a1a6] font-semibold text-xs">
                      {t("compareAnalyticsBasic")}
                    </td>
                    <td className="text-center py-6 px-8 text-indigo-600 dark:text-indigo-400 font-extrabold text-sm bg-indigo-500/[0.03] dark:bg-indigo-500/[0.05]">
                      {t("compareUnlimited")}
                    </td>
                    <td className="text-center py-6 px-8 text-purple-600 dark:text-purple-400 font-bold text-sm">
                      {t("compareAnalyticsCustom")}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/40 dark:hover:bg-white/[0.01] transition-colors">
                    <td className="py-6 px-8 font-bold text-[#1d1d1f] dark:text-[#f5f5f7] text-sm">
                      {t("compareLessonPlans")}
                    </td>
                    <td className="text-center py-6 px-8">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto border border-slate-200/10">
                        <X className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                      </div>
                    </td>
                    <td className="text-center py-6 px-8 bg-indigo-500/[0.03] dark:bg-indigo-500/[0.05]">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto border border-indigo-500/20 shadow-sm">
                        <Check className="h-4.5 w-4.5 text-indigo-500" />
                      </div>
                    </td>
                    <td className="text-center py-6 px-8">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto border border-purple-500/20 shadow-sm">
                        <Check className="h-4.5 w-4.5 text-purple-500" />
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/40 dark:hover:bg-white/[0.01] transition-colors">
                    <td className="py-6 px-8 font-bold text-[#1d1d1f] dark:text-[#f5f5f7] text-sm">
                      {t("compareApiAccess")}
                    </td>
                    <td className="text-center py-6 px-8">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto border border-slate-200/10">
                        <X className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                      </div>
                    </td>
                    <td className="text-center py-6 px-8 bg-indigo-500/[0.03] dark:bg-indigo-500/[0.05]">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto border border-indigo-500/20 shadow-sm">
                        <Check className="h-4.5 w-4.5 text-indigo-500" />
                      </div>
                    </td>
                    <td className="text-center py-6 px-8">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto border border-purple-500/20 shadow-sm">
                        <Check className="h-4.5 w-4.5 text-purple-500" />
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/40 dark:hover:bg-white/[0.01] transition-colors">
                    <td className="py-6 px-8 font-bold text-[#1d1d1f] dark:text-[#f5f5f7] text-sm">
                      {t("compareSupport")}
                    </td>
                    <td className="text-center py-6 px-8 text-[#86868b] dark:text-[#a1a1a6] font-semibold text-xs">
                      {t("compareSupportEmail")}
                    </td>
                    <td className="text-center py-6 px-8 text-indigo-600 dark:text-indigo-400 font-extrabold text-sm bg-indigo-500/[0.03] dark:bg-indigo-500/[0.05] rounded-b-2xl">
                      {t("compareSupportPriority")}
                    </td>
                    <td className="text-center py-6 px-8 text-purple-600 dark:text-purple-400 font-bold text-sm">
                      {t("compareSupport247")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked View */}
            <div className="block md:hidden space-y-4 p-2">
              {/* Feature 1 */}
              <div className="p-4 rounded-2xl bg-slate-500/5 dark:bg-white/5 border border-slate-200/10 dark:border-white/[0.05] space-y-3">
                <h4 className="font-bold text-[#1d1d1f] dark:text-[#f5f5f7] text-sm border-b border-slate-200/10 dark:border-white/5 pb-2">
                  {t("compareAiQuestions")}
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="flex flex-col items-center p-2 rounded-xl bg-slate-500/5 dark:bg-white/5">
                    <span className="text-[#86868b] dark:text-[#a1a1a6] font-semibold mb-1 text-[10px]">
                      {t("freePlan")}
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {t("compareAiQuestionsFree")}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <span className="text-indigo-600 dark:text-indigo-400 font-extrabold mb-1 text-[10px]">
                      Pro
                    </span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {t("compareUnlimited")}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <span className="text-purple-600 dark:text-purple-400 font-bold mb-1 text-[10px]">
                      Enterprise
                    </span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      {t("compareUnlimited")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="p-4 rounded-2xl bg-slate-500/5 dark:bg-white/5 border border-slate-200/10 dark:border-white/[0.05] space-y-3">
                <h4 className="font-bold text-[#1d1d1f] dark:text-[#f5f5f7] text-sm border-b border-slate-200/10 dark:border-white/5 pb-2">
                  {t("compareVoiceAssistant")}
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="flex flex-col items-center p-2 rounded-xl bg-slate-500/5 dark:bg-white/5">
                    <span className="text-[#86868b] dark:text-[#a1a1a6] font-semibold mb-1 text-[10px]">
                      {t("freePlan")}
                    </span>
                    <X className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-1" />
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <span className="text-indigo-600 dark:text-indigo-400 font-extrabold mb-1 text-[10px]">
                      Pro
                    </span>
                    <Check className="h-4.5 w-4.5 text-indigo-500 mt-0.5" />
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <span className="text-purple-600 dark:text-purple-400 font-bold mb-1 text-[10px]">
                      Enterprise
                    </span>
                    <Check className="h-4.5 w-4.5 text-purple-500 mt-0.5" />
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="p-4 rounded-2xl bg-slate-500/5 dark:bg-white/5 border border-slate-200/10 dark:border-white/[0.05] space-y-3">
                <h4 className="font-bold text-[#1d1d1f] dark:text-[#f5f5f7] text-sm border-b border-slate-200/10 dark:border-white/5 pb-2">
                  {t("compareAnalytics")}
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="flex flex-col items-center p-2 rounded-xl bg-slate-500/5 dark:bg-white/5">
                    <span className="text-[#86868b] dark:text-[#a1a1a6] font-semibold mb-1 text-[10px]">
                      {t("freePlan")}
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {t("compareAnalyticsBasic")}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <span className="text-indigo-600 dark:text-indigo-400 font-extrabold mb-1 text-[10px]">
                      Pro
                    </span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 text-[11px] leading-tight">
                      {t("compareAnalyticsAdvanced")}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <span className="text-purple-600 dark:text-purple-400 font-bold mb-1 text-[10px]">
                      Enterprise
                    </span>
                    <span className="font-bold text-purple-600 dark:text-purple-400 text-[11px] leading-tight">
                      {t("compareAnalyticsCustom")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="p-4 rounded-2xl bg-slate-500/5 dark:bg-white/5 border border-slate-200/10 dark:border-white/[0.05] space-y-3">
                <h4 className="font-bold text-[#1d1d1f] dark:text-[#f5f5f7] text-sm border-b border-slate-200/10 dark:border-white/5 pb-2">
                  {t("compareLessonPlans")}
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="flex flex-col items-center p-2 rounded-xl bg-slate-500/5 dark:bg-white/5">
                    <span className="text-[#86868b] dark:text-[#a1a1a6] font-semibold mb-1 text-[10px]">
                      {t("freePlan")}
                    </span>
                    <X className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-1" />
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <span className="text-indigo-600 dark:text-indigo-400 font-extrabold mb-1 text-[10px]">
                      Pro
                    </span>
                    <Check className="h-4.5 w-4.5 text-indigo-500 mt-0.5" />
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <span className="text-purple-600 dark:text-purple-400 font-bold mb-1 text-[10px]">
                      Enterprise
                    </span>
                    <Check className="h-4.5 w-4.5 text-purple-500 mt-0.5" />
                  </div>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="p-4 rounded-2xl bg-slate-500/5 dark:bg-white/5 border border-slate-200/10 dark:border-white/[0.05] space-y-3">
                <h4 className="font-bold text-[#1d1d1f] dark:text-[#f5f5f7] text-sm border-b border-slate-200/10 dark:border-white/5 pb-2">
                  {t("compareApiAccess")}
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="flex flex-col items-center p-2 rounded-xl bg-slate-500/5 dark:bg-white/5">
                    <span className="text-[#86868b] dark:text-[#a1a1a6] font-semibold mb-1 text-[10px]">
                      {t("freePlan")}
                    </span>
                    <X className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-1" />
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <span className="text-indigo-600 dark:text-indigo-400 font-extrabold mb-1 text-[10px]">
                      Pro
                    </span>
                    <Check className="h-4.5 w-4.5 text-indigo-500 mt-0.5" />
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <span className="text-purple-600 dark:text-purple-400 font-bold mb-1 text-[10px]">
                      Enterprise
                    </span>
                    <Check className="h-4.5 w-4.5 text-purple-500 mt-0.5" />
                  </div>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="p-4 rounded-2xl bg-slate-500/5 dark:bg-white/5 border border-slate-200/10 dark:border-white/[0.05] space-y-3">
                <h4 className="font-bold text-[#1d1d1f] dark:text-[#f5f5f7] text-sm border-b border-slate-200/10 dark:border-white/5 pb-2">
                  {t("compareSupport")}
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="flex flex-col items-center p-2 rounded-xl bg-slate-500/5 dark:bg-white/5">
                    <span className="text-[#86868b] dark:text-[#a1a1a6] font-semibold mb-1 text-[10px]">
                      {t("freePlan")}
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 text-[10px] leading-tight">
                      {t("compareSupportEmail")}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <span className="text-indigo-600 dark:text-indigo-400 font-extrabold mb-1 text-[10px]">
                      Pro
                    </span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 text-[10px] leading-tight">
                      {t("compareSupportPriority")}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <span className="text-purple-600 dark:text-purple-400 font-bold mb-1 text-[10px]">
                      Enterprise
                    </span>
                    <span className="font-bold text-purple-600 dark:text-purple-400 text-[10px] leading-tight">
                      {t("compareSupport247")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-16">
        <h3 className="text-2xl font-bold text-center mb-8">{t("faqTitle")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {faqItems.map((item) => (
            <Card key={item.question} className="border-gradient-question">
              <CardHeader>
                <CardTitle className="text-lg">{item.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">{item.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Card className="border-gradient-question max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">{t("ctaTitle")}</CardTitle>
            <CardDescription>{t("ctaDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {t("contactUs")}
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-transparent transition-all duration-300"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {t("requestDemo")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
