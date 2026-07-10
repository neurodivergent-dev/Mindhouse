"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Shield, WifiOff } from "lucide-react";

export default function PerformanceMetrics() {
  const t = useTranslations("Performance");

  const metrics = [
    {
      title: t("card1Title"),
      description: t("card1Desc"),
      icon: <Zap className="h-6 w-6 text-yellow-500" />,
      color: "border-gradient-yellow",
      bgHover: "hover:shadow-yellow-500/10",
    },
    {
      title: t("card2Title"),
      description: t("card2Desc"),
      icon: <WifiOff className="h-6 w-6 text-blue-500" />,
      color: "border-gradient-blue",
      bgHover: "hover:shadow-blue-500/10",
    },
    {
      title: t("card3Title"),
      description: t("card3Desc"),
      icon: <Shield className="h-6 w-6 text-green-500" />,
      color: "border-gradient-green",
      bgHover: "hover:shadow-green-500/10",
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:bg-transparent dark:!bg-none">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t("title")}
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("subtitle")}</p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className={`${metric.color} p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl ${metric.bgHover}`}
              >
                <Card className="h-full w-full border-0 bg-white dark:bg-gray-900/50 rounded-[11px] backdrop-blur-sm">
                  <CardHeader className="text-center pb-2">
                    <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-sm">
                      {metric.icon}
                    </div>
                    <CardTitle className="text-lg font-bold">{metric.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      {metric.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
