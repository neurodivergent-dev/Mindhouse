"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { QuizResult } from "@/components/quiz-result";
import LoadingSpinner from "@/components/loading-spinner";
import MobileNav from "@/components/mobile-nav";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";

export default function QuizResultPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations("Quiz");
  
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id as string;
    if (!id) {
      router.push("/dashboard");
      return;
    }

    try {
      const demoResults = JSON.parse(localStorage.getItem("exam_training_demo_quiz_results") || "[]");
      const realResults = JSON.parse(localStorage.getItem("exam_training_quiz_results") || "[]");
      
      const foundResult = demoResults.find((r: any) => r.id === id) || realResults.find((r: any) => r.id === id);
      
      if (foundResult) {
        if (foundResult.type === "TopicExplainer") {
          // Redirect to topic explainer if it's an explainer result
          let url = `/topic-explainer?subject=${encodeURIComponent(foundResult.subject)}`;
          if (foundResult.topic) {
            url += `&topic=${encodeURIComponent(foundResult.topic)}`;
          }
          router.push(url);
        } else {
          setResult(foundResult);
        }
      } else {
        toast({
          title: t("errorTitle") || "Hata",
          description: "Sonuç bulunamadı." || "Result not found.",
          variant: "destructive"
        });
        router.push("/dashboard");
      }
    } catch (error) {
      console.error(error);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [params.id, router, toast, t]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <MobileNav />
        <main className="flex-grow flex items-center justify-center">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  if (!result) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MobileNav />
      <div className="flex-grow">
        <QuizResult
          score={result.score || 0}
          totalQuestions={result.totalQuestions || 0}
          timeSpent={result.timeSpent || 0}
          weakTopics={result.weakTopics || {}}
          onRetake={() => {
            const demoParam = result.isDemo ? "&demo=true" : "";
            router.push(`/quiz?subject=${encodeURIComponent(result.subject)}${demoParam}`);
          }}
        />
      </div>
    </div>
  );
}
