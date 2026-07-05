const fs = require('fs');
const path = require('path');

const file = 'C:\\Users\\Melih\\Documents\\Projects\\akilhane\\src\\components\\ai-performance-recommendation.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  // Add imports
  ['import { Brain, Target, BookOpen, Sparkles, Zap, TrendingUp } from "lucide-react";', 'import { Brain, Target, BookOpen, Sparkles, Zap, TrendingUp } from "lucide-react";\nimport { useTranslations } from "next-intl";'],
  
  // Add hook inside component
  ['export default function AIPerformanceRecommendation({', 'export default function AIPerformanceRecommendation({\n'],
  ['  className = "",\n}: AIPerformanceRecommendationProps) {', '  className = "",\n}: AIPerformanceRecommendationProps) {\n  const t = useTranslations("AIPerformance");'],

  // Replace text
  ['>AI Analizi<', '>{t("aiAnalysis")}<'],
  ['"Analiz ediliyor..."', 't("analyzing")'],
  ['"Yapay zeka önerisi al"', 't("getAiRecommendation")'],
  ['>AI Performans Önerisi<', '>{t("aiPerformanceRecommendation")}<'],
  ['>Yapay zeka tarafından hazırlanan çalışma stratejisi<', '>{t("aiStudyStrategy")}<'],
  ['>Akıllı Çalışma Önerisi<', '>{t("smartStudyRecommendation")}<'],
  ['>Performans analizinize göre hazırlandı<', '>{t("preparedBasedOnAnalysis")}<'],
  ['>\\n                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 flex-shrink-0" />\\n                  Önerilen Çalışma Stratejisi\\n                <', '>\\n                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 flex-shrink-0" />\\n                  {t("recommendedStrategy")}\\n                <'],
  ['>\\n                    <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />\\n                    Neden Bu Öneri Yapıldı?\\n                  <', '>\\n                    <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />\\n                    {t("whyThisRecommendation")}\\n                  <'],
  ['>\\n                    <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 flex-shrink-0" />\\n                    Bu Stratejiyi Nasıl Uygulayabilirsiniz?\\n                  <', '>\\n                    <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 flex-shrink-0" />\\n                    {t("howToApply")}\\n                  <'],
  ['>Çalışmaya Başla<', '>{t("startWorking")}<']
];

for (const [search, replace] of replacements) {
  content = content.replace(search, replace);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Script completed');
