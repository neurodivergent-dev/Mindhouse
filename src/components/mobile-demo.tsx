"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Download, Layout } from "lucide-react";

export default function MobileDemo() {
  const t = useTranslations("Mobile");

  const features = [
    {
      title: t("card1Title"),
      description: t("card1Desc"),
      icon: <Smartphone className="h-6 w-6 text-purple-500" />,
      color: "border-gradient-purple",
      bgHover: "hover:shadow-purple-500/10",
    },
    {
      title: t("card2Title"),
      description: t("card2Desc"),
      icon: <Download className="h-6 w-6 text-pink-500" />,
      color: "border-gradient-pink",
      bgHover: "hover:shadow-pink-500/10",
    },
    {
      title: t("card3Title"),
      description: t("card3Desc"),
      icon: <Layout className="h-6 w-6 text-blue-500" />,
      color: "border-gradient-blue",
      bgHover: "hover:shadow-blue-500/10",
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:bg-transparent dark:!bg-none">
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

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`${feature.color} p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl ${feature.bgHover}`}
              >
                <Card className="h-full w-full border-0 bg-white dark:bg-gray-900/50 rounded-[11px] backdrop-blur-sm">
                  <CardHeader className="text-center pb-2">
                    <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-sm">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg font-bold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      {feature.description}
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
