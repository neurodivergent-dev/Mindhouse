"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, X, Star, Zap, Crown, Building, Users, MessageSquare } from "lucide-react";
import MobileNav from "@/components/mobile-nav";

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  limitations: string[];
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
}

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const t = useTranslations("Pricing");

  const pricingPlans: PricingPlan[] = useMemo(
    () => [
      {
        id: "free",
        name: t("freeName"),
        description: t("freeDescription"),
        price: { monthly: 0, yearly: 0 },
        features: t.raw("freeFeatures") as string[],
        limitations: t.raw("freeLimitations") as string[],
        icon: <Users className="h-6 w-6" />,
        color: "text-gray-600",
      },
      {
        id: "premium",
        name: t("premiumName"),
        description: t("premiumDescription"),
        price: { monthly: 499, yearly: 4990 },
        features: t.raw("premiumFeatures") as string[],
        limitations: t.raw("premiumLimitations") as string[],
        popular: true,
        icon: <Star className="h-6 w-6" />,
        color: "text-yellow-600",
      },
      {
        id: "enterprise",
        name: t("enterpriseName"),
        description: t("enterpriseDescription"),
        price: { monthly: 999, yearly: 9990 },
        features: t.raw("enterpriseFeatures") as string[],
        limitations: t.raw("enterpriseLimitations") as string[],
        icon: <Building className="h-6 w-6" />,
        color: "text-purple-600",
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

  const getCurrentPrice = (plan: PricingPlan) =>
    isYearly ? plan.price.yearly : plan.price.monthly;

  const getSavings = (plan: PricingPlan) => {
    if (plan.price.monthly === 0) {
      return 0;
    }
    const yearlyTotal = plan.price.monthly * 12;
    const yearlyPrice = plan.price.yearly;
    return Math.round(((yearlyTotal - yearlyPrice) / yearlyTotal) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:bg-transparent dark:!bg-none">
      <MobileNav />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {t("title")}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            {t("subtitle")}
          </p>

          <div className="flex items-center justify-center space-x-4">
            <Label htmlFor="billing-toggle" className="text-sm font-medium">
              {t("monthly")}
            </Label>
            <Switch
              id="billing-toggle"
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-indigo-600"
            />
            <Label htmlFor="billing-toggle" className="text-sm font-medium">
              {t("yearly")}
            </Label>
            {isYearly && (
              <Badge variant="success">{t("savingsBadge")}</Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`border-gradient-question relative ${
                plan.popular
                  ? "ring-2 ring-purple-500 shadow-lg scale-105"
                  : "hover:shadow-lg transition-shadow"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge variant="purple" className="px-4 py-1">
                    <Crown className="h-3 w-3 mr-1" />
                    {t("mostPopular")}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className={`mx-auto mb-4 ${plan.color}`}>{plan.icon}</div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold">
                      ₺{getCurrentPrice(plan)}
                    </span>
                    {plan.price.monthly > 0 && (
                      <span className="text-gray-500 ml-2">
                        /{isYearly ? t("perYear") : t("perMonth")}
                      </span>
                    )}
                  </div>
                  {isYearly && plan.price.monthly > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      {t("savings", { percent: getSavings(plan) })}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                    {t("includedFeatures")}
                  </h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.limitations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                      {t("limitationsLabel")}
                    </h4>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation) => (
                        <li key={limitation} className="flex items-center space-x-2">
                          <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                          <span className="text-sm text-gray-500 dark:text-gray-500">
                            {limitation}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  onClick={() => handlePlanSelect()}
                  className={`w-full ${
                    plan.popular
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  }`}
                >
                  {plan.price.monthly === 0 ? t("startFree") : t("selectPlan")}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">
            {t("comparisonTitle")}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-6 font-semibold">
                    {t("featureColumn")}
                  </th>
                  <th className="text-center py-4 px-6 font-semibold">
                    {t("freePlan")}
                  </th>
                  <th className="text-center py-4 px-6 font-semibold">
                    {t("premiumPlan")}
                  </th>
                  <th className="text-center py-4 px-6 font-semibold">
                    {t("enterprisePlan")}
                  </th>
                </tr>
              </thead>
              <tbody className="space-y-4">
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-4 px-6 font-medium">{t("compareAiQuestions")}</td>
                  <td className="text-center py-4 px-6">{t("compareAiQuestionsFree")}</td>
                  <td className="text-center py-4 px-6">{t("compareUnlimited")}</td>
                  <td className="text-center py-4 px-6">{t("compareUnlimited")}</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-4 px-6 font-medium">{t("compareVoiceAssistant")}</td>
                  <td className="text-center py-4 px-6">
                    <X className="h-4 w-4 text-red-500 mx-auto" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-4 px-6 font-medium">{t("compareAnalytics")}</td>
                  <td className="text-center py-4 px-6">{t("compareAnalyticsBasic")}</td>
                  <td className="text-center py-4 px-6">{t("compareAnalyticsAdvanced")}</td>
                  <td className="text-center py-4 px-6">{t("compareAnalyticsCustom")}</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-4 px-6 font-medium">{t("compareLessonPlans")}</td>
                  <td className="text-center py-4 px-6">
                    <X className="h-4 w-4 text-red-500 mx-auto" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-4 px-6 font-medium">{t("compareApiAccess")}</td>
                  <td className="text-center py-4 px-6">
                    <X className="h-4 w-4 text-red-500 mx-auto" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="h-4 w-4 text-red-500 mx-auto" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-4 px-6 font-medium">{t("compareSupport")}</td>
                  <td className="text-center py-4 px-6">{t("compareSupportEmail")}</td>
                  <td className="text-center py-4 px-6">{t("compareSupportPriority")}</td>
                  <td className="text-center py-4 px-6">{t("compareSupport247")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">{t("faqTitle")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
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
      </div>
    </div>
  );
}