"use server";

import { z } from "zod";
import { getPerformanceHistoryForSubject } from "@/services/performance-service";
import { AIFactory } from "@/services/ai/AIFactory";

const FlashcardRecommendationInputSchema = z.object({
  userId: z.string().describe("Kullanıcının ID'si."),
  subject: z.string().describe("Flashcard önerileri için ders konusu."),
  performanceData: z.string().describe("localStorage'dan alınan kullanıcının performans verilerinin JSON string'i."),
  currentFlashcardData: z.string().describe("Kullanıcının mevcut flashcard ilerlemesinin JSON string'i."),
  studyMode: z.enum(["review", "new", "difficult", "general"]).describe("Kullanıcının şu anda bulunduğu çalışma modu. 'general' ise genel bir performans tavsiyesi isteniyor demektir."),
  targetStudyTime: z.number().optional().describe("Hedef çalışma süresi (dakika, opsiyonel)."),
  preferences: z.record(z.any()).optional().describe("User AI preferences"),
  language: z.enum(["tr", "en"]).optional().default("tr").describe("Language for recommendations"),
});

export type FlashcardRecommendationInput = z.infer<typeof FlashcardRecommendationInputSchema>;

const FlashcardRecommendationOutputSchema = z.object({
  recommendedStudyMode: z.enum(["review", "new", "difficult"]).describe("Öğrenci için önerilen çalışma modu."),
  recommendedTopics: z.array(z.string()).describe("Öğrencinin odaklanması gereken spesifik konular."),
  studyStrategy: z.string().describe("Kişiselleştirilmiş çalışma stratejisi önerisi (Türkçe)."),
  estimatedTime: z.number().describe("Tahmini çalışma süresi (dakika)."),
  confidence: z.number().describe("AI öneri güven seviyesi (0-1)."),
  reasoning: z.string().describe("Bu önerinin neden yapıldığının açıklaması (Türkçe)."),
});

export type FlashcardRecommendationOutput = z.infer<typeof FlashcardRecommendationOutputSchema>;

export async function getFlashcardRecommendation(
  input: FlashcardRecommendationInput,
): Promise<FlashcardRecommendationOutput> {
  try {
    const combinedData = JSON.parse(input.performanceData);
    const provider = AIFactory.getProviderFromPreferences(input.preferences || {});

    let performanceHistory, quizResults, studyHistory, flashcardProgress, currentSubject;

    if (Array.isArray(combinedData)) {
      performanceHistory = combinedData;
      quizResults = [];
      studyHistory = [];
      flashcardProgress = [];
      currentSubject = input.subject;
    } else {
      performanceHistory = combinedData.performanceData || {};
      quizResults = combinedData.quizResults || [];
      studyHistory = combinedData.studyHistory || [];
      flashcardProgress = combinedData.flashcardProgress || [];
      currentSubject = combinedData.currentSubject || input.subject;
    }

    // Get real performance history
    const pastPerformance = currentSubject === "Genel"
      ? performanceHistory
      : getPerformanceHistoryForSubject(currentSubject, input.userId);

    const isEnglish = input.language === "en";

    const promptText = isEnglish
      ? `You are an intelligent English-speaking educational assistant. You provide personalized recommendations for flashcard study.

Analyze the student's performance data and current flashcard progress to provide smart recommendations.

## STUDENT PAST PERFORMANCE:
${JSON.stringify(pastPerformance, null, 2)}

## FACTORS TO ANALYZE:
1. **Data from localStorage**:
   - Quiz results: ${JSON.stringify(quizResults).slice(0, 500)}
   - Study history: ${JSON.stringify(studyHistory).slice(0, 500)}
   - Performance data: ${JSON.stringify(performanceHistory).slice(0, 500)}
   - Flashcard progress: ${JSON.stringify(flashcardProgress).slice(0, 500)}

2. **Current situation analysis**:
   - Number of learned cards, number of cards that need review.

3. **Study mode preferences** and target time

## STUDY MODE RECOMMENDATIONS:
- **'review'**: For students who need to reinforce newly learned concepts
- **'new'**: For students who need to discover new topics or have high performance
- **'difficult'**: For students who struggle in specific topics or have low confidence levels

## TOPIC RECOMMENDATIONS:
- Focus on weak topics
- Prioritize topics with low confidence
- **Focus on topics appropriate to the lesson**

## STUDY STRATEGY:
- Provide specific, actionable recommendations
- **Provide explanations in English**
- **Give examples from daily life**
- **Provide motivation**

## STUDENT INFORMATION:
User ID: ${input.userId}
Subject: ${input.subject}
${input.studyMode === 'general' ? 'General Performance Assessment Requested' : `Current Study Mode: ${input.studyMode}`}
Target Study Time: ${input.targetStudyTime || 30} minutes

Analyze the data and respond in THE FOLLOWING JSON FORMAT (with exactly the same keys):
{
  "recommendedStudyMode": "review" | "new" | "difficult",
  "recommendedTopics": ["topic1", "topic2"],
  "studyStrategy": "Study strategy text in English",
  "estimatedTime": 30,
  "confidence": 0.8,
  "reasoning": "Explanation of why this recommendation was made in English"
}`
      : `Sen bir Türkçe konuşan akıllı eğitim asistanısın. Flashcard çalışması için kişiselleştirilmiş öneriler veriyorsun.

Öğrencinin performans verilerini ve mevcut flashcard ilerlemesini analiz ederek akıllı öneriler ver.

## ÖĞRENCİ GEÇMİŞ PERFORMANSI:
${JSON.stringify(pastPerformance, null, 2)}

## ANALİZ ETMEN GEREKEN FAKTÖRLER:
1. **localStorage'dan gelen veriler**:
   - Quiz sonuçları: ${JSON.stringify(quizResults).slice(0, 500)}
   - Çalışma geçmişi: ${JSON.stringify(studyHistory).slice(0, 500)}
   - Performans verileri: ${JSON.stringify(performanceHistory).slice(0, 500)}
   - Flashcard ilerlemesi: ${JSON.stringify(flashcardProgress).slice(0, 500)}

2. **Mevcut durum analizi**:
   - Öğrenilen kart sayısı, tekrar gereken kart sayısı.

3. **Çalışma modu tercihleri** ve hedef süre

## ÇALIŞMA MODU ÖNERİLERİ:
- **'review' (Tekrar)**: Yeni öğrenilen kavramları pekiştirmesi gereken öğrenciler için
- **'new' (Yeni)**: Yeni konular keşfetmesi gereken veya yüksek performanslı öğrenciler için
- **'difficult' (Zor)**: Belirli konularda zorlanan veya düşük güven seviyesine sahip öğrenciler için

## KONU ÖNERİLERİ:
- Zayıf konulara odaklan
- Düşük güven seviyesine sahip konuları önceliklendir
- **Dersin konusuna uygun konulara odaklan**

## ÇALIŞMA STRATEJİSİ:
- Spesifik, uygulanabilir tavsiyeler ver
- **Türkçe açıklamalar yap**
- **Günlük hayattan örnekler ver**
- **Motivasyon ver**

## ÖĞRENCİ BİLGİLERİ:
Kullanıcı ID: ${input.userId}
Ders: ${input.subject}
${input.studyMode === 'general' ? 'Genel Performans Değerlendirmesi İsteniyor' : `Mevcut Çalışma Modu: ${input.studyMode}`}
Hedef Çalışma Süresi: ${input.targetStudyTime || 30} dakika

Verileri analiz et ve AŞAĞIDAKİ JSON FORMATINDA (birebir aynı anahtarlarla) yanıt dön:
{
  "recommendedStudyMode": "review" | "new" | "difficult",
  "recommendedTopics": ["konu1", "konu2"],
  "studyStrategy": "Çalışma stratejisi metni",
  "estimatedTime": 30,
  "confidence": 0.8,
  "reasoning": "Neden bu öneri yapıldı?"
}`;

    const result = await provider.generateObject<FlashcardRecommendationOutput>({
      schema: FlashcardRecommendationOutputSchema,
      prompt: promptText,
    });

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Flashcard recommendation error:", error);
    // Fallback
    const isEnglish = input.language === "en";
    return {
      recommendedStudyMode: input.studyMode === "general" ? "review" : input.studyMode,
      recommendedTopics: isEnglish ? ["General Review"] : ["Genel Tekrar"],
      studyStrategy: isEnglish 
        ? "Since data analysis could not be performed, I recommend a general study strategy. Review your current flashcards and focus on topics you are struggling with."
        : "Veri analizi yapılamadığı için genel bir çalışma stratejisi öneriyorum. Mevcut flashcard'larınızı tekrar edin ve zorlandığınız konulara odaklanın.",
      estimatedTime: input.targetStudyTime || 30,
      confidence: 0.5,
      reasoning: isEnglish 
        ? `Error detail: ${  errorMessage}`
        : `Hata detayı: ${  errorMessage}`,
    };
  }
}
