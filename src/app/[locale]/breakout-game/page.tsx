"use client";

import React from "react";
import BreakoutLoadingGame from "@/components/breakout-loading-game";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function BreakoutGamePage() {
  const t = useTranslations("BreakoutLoadingGame");
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-transparent dark:!bg-none p-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/topic-explainer">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("back") || "Geri"}
            </Button>
          </Link>
          <h1 className="text-3xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              🎮 {t("title")}
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {t("loading")} sırasında eğlenceli bir oyun oynayın!
          </p>
        </div>

        {/* Game Component */}
        <BreakoutLoadingGame
          isLoading={false}
          loadingText={t("startGame")}
          onGameComplete={() => {
            //do nothing
          }}
        />
      </div>
    </div>
  );
}
