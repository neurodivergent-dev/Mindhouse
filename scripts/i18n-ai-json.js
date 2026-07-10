const fs = require("fs");
const path = require("path");

const enFile = "C:\\Users\\Melih\\Documents\\Projects\\akilhane\\messages\\en.json";
const trFile = "C:\\Users\\Melih\\Documents\\Projects\\akilhane\\messages\\tr.json";

const enData = JSON.parse(fs.readFileSync(enFile, "utf8"));
const trData = JSON.parse(fs.readFileSync(trFile, "utf8"));

const enAiPerf = {
  analyzing: "Analyzing...",
  getAiRecommendation: "Get AI Recommendation",
  aiAnalysis: "AI Analysis",
  aiPerformanceRecommendation: "AI Performance Recommendation",
  aiStudyStrategy: "Study strategy prepared by AI",
  smartStudyRecommendation: "Smart Study Recommendation",
  preparedBasedOnAnalysis: "Prepared based on your performance analysis",
  recommendedStrategy: "Recommended Study Strategy",
  whyThisRecommendation: "Why Was This Recommended?",
  howToApply: "How Can You Apply This Strategy?",
  startWorking: "Start Working",
};

const trAiPerf = {
  analyzing: "Analiz ediliyor...",
  getAiRecommendation: "Yapay zeka önerisi al",
  aiAnalysis: "AI Analizi",
  aiPerformanceRecommendation: "AI Performans Önerisi",
  aiStudyStrategy: "Yapay zeka tarafından hazırlanan çalışma stratejisi",
  smartStudyRecommendation: "Akıllı Çalışma Önerisi",
  preparedBasedOnAnalysis: "Performans analizinize göre hazırlandı",
  recommendedStrategy: "Önerilen Çalışma Stratejisi",
  whyThisRecommendation: "Neden Bu Öneri Yapıldı?",
  howToApply: "Bu Stratejiyi Nasıl Uygulayabilirsiniz?",
  startWorking: "Çalışmaya Başla",
};

enData.AIPerformance = enAiPerf;
trData.AIPerformance = trAiPerf;

fs.writeFileSync(enFile, JSON.stringify(enData, null, 2), "utf8");
fs.writeFileSync(trFile, JSON.stringify(trData, null, 2), "utf8");
console.log("JSON updated for AIPerformance");
