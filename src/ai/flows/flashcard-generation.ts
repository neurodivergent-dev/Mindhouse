"use server";

import { z } from "zod";
import { logError } from "@/lib/error-logger";
import { AIFactory, AIPreferences } from "@/services/ai/AIFactory";

const FlashcardGenerationInputSchema = z.object({
  subject: z.string().describe("The subject for which to generate flashcards"),
  topic: z.string().describe("The specific topic within the subject"),
  difficulty: z
    .enum(["Easy", "Medium", "Hard"])
    .describe("The difficulty level of flashcards to generate"),
  count: z.number().min(1).max(20).describe("Number of flashcards to generate"),
  language: z
    .enum(["tr", "en"])
    .default("tr")
    .describe("Language for the flashcards"),
  guidelines: z
    .string()
    .optional()
    .describe("Additional guidelines or requirements for flashcard generation"),
  existingFlashcards: z
    .array(z.string())
    .optional()
    .describe("Existing flashcard questions to avoid duplicates"),
});

export type FlashcardGenerationInput = z.infer<
  typeof FlashcardGenerationInputSchema
>;

const GeneratedFlashcardSchema = z.object({
  question: z.string().describe("The question text for the front of the flashcard"),
  answer: z.string().describe("The answer text for the back of the flashcard"),
  explanation: z
    .string()
    .describe("Detailed explanation of the answer for better understanding"),
  topic: z.string().describe("The specific topic this flashcard covers"),
  difficulty: z
    .enum(["Easy", "Medium", "Hard"])
    .describe("Actual difficulty of the generated flashcard"),
  keywords: z
    .array(z.string())
    .describe("Key concepts covered in the flashcard"),
  learningObjective: z
    .string()
    .describe("What the student should learn from this flashcard"),
  relatedConcepts: z
    .array(z.string())
    .optional()
    .describe("Related concepts that connect to this flashcard"),
});

const AIResponseSchema = z.object({
  flashcards: z.array(GeneratedFlashcardSchema).describe("The generated flashcards"),
});

const FlashcardGenerationOutputSchema = z.object({
  flashcards: z.array(GeneratedFlashcardSchema).describe("Generated flashcards"),
  metadata: z.object({
    totalGenerated: z.number().describe("Total number of flashcards generated"),
    subject: z.string().describe("Subject of the flashcards"),
    topic: z.string().describe("Topic of the flashcards"),
    averageDifficulty: z.string().describe("Average difficulty level"),
    generationTimestamp: z
      .string()
      .describe("When the flashcards were generated"),
    aiModel: z.string().describe("AI model used for generation"),
  }),
  qualityScore: z
    .number()
    .min(0)
    .max(1)
    .describe("Overall quality score of generated flashcards"),
  suggestions: z
    .array(z.string())
    .describe("Suggestions for improving flashcard quality"),
  studyTips: z
    .array(z.string())
    .describe("Study tips for using these flashcards effectively"),
});

export type FlashcardGenerationOutput = z.infer<
  typeof FlashcardGenerationOutputSchema
>;

export async function generateFlashcards(
  input: FlashcardGenerationInput,
  preferences?: Partial<AIPreferences>
): Promise<FlashcardGenerationOutput> {
  try {
    const { subject, topic, difficulty, count, language, guidelines } = input;
    const provider = AIFactory.getProviderFromPreferences(preferences || {});

    const isEnglish = language === "en";

    const prompt = isEnglish
      ? `
    You are an education expert. You need to generate ${count} ${difficulty} level flashcards for the ${topic} topic in the ${subject} subject.

    ${guidelines ? `Special guidelines: ${guidelines}` : ""}

    For each flashcard:
    - Question: Visible on the front, clear and understandable
    - Answer: Visible on the back, correct and comprehensive
    - Explanation: Detailed explanation for the student to better understand the topic
    - Difficulty: Appropriate to ${difficulty} level
    - Keywords: Important concepts covered in the flashcard
    - Learning objective: What will be learned from this flashcard

    Language: English
    Topic: ${topic}
    Subject: ${subject}
    Difficulty: ${difficulty}
    Number of cards: ${count}
    `
      : `
    Sen bir eğitim uzmanısın. ${subject} dersinin ${topic} konusu için ${count} adet ${difficulty} seviyesinde flashcard üretmen gerekiyor.

    ${guidelines ? `Özel yönergeler: ${guidelines}` : ""}

    Her flashcard için:
    - Soru: Ön yüzde görünecek, net ve anlaşılır
    - Cevap: Arka yüzde görünecek, doğru ve kapsamlı
    - Açıklama: Öğrencinin konuyu daha iyi anlaması için detaylı açıklama
    - Zorluk: ${difficulty} seviyesine uygun
    - Anahtar kelimeler: Flashcard'da geçen önemli kavramlar
    - Öğrenme hedefi: Bu flashcard'dan ne öğrenilecek

    Dil: Türkçe
    Konu: ${topic}
    Ders: ${subject}
    Zorluk: ${difficulty}
    Kart sayısı: ${count}
    `;

    try {
      const result = await provider.generateObject<{ flashcards: z.infer<typeof GeneratedFlashcardSchema>[] }>({
        schema: AIResponseSchema as any,
        prompt: prompt,
      });

      const generatedFlashcards = result.flashcards.slice(0, count);
      const qualityScore = calculateQualityScore(generatedFlashcards);
      const suggestions = generateSuggestions(qualityScore);
      const studyTips = generateStudyTips(subject, topic, difficulty);

      return {
        flashcards: generatedFlashcards,
        metadata: {
          totalGenerated: generatedFlashcards.length,
          subject,
          topic,
          averageDifficulty: difficulty,
          generationTimestamp: new Date().toISOString(),
          aiModel: preferences?.provider || "gemini",
        },
        qualityScore,
        suggestions,
        studyTips,
      };

    } catch (error) {
      logError("AI generation error", error, {
        function: "flashcardGenerationFlow",
        subject,
        topic,
        difficulty,
        count,
      });

      throw error;
    }
  } catch (error) {
    logError("Flashcard generation error", error, { function: "generateFlashcards" });
    
    // Fallback flashcards
    const isEnglish = input.language === "en";
    const fallbackFlashcards: z.infer<typeof GeneratedFlashcardSchema>[] = [];
    for (let i = 0; i < input.count; i++) {
      fallbackFlashcards.push({
        question: isEnglish ? `AI Error: Could not generate question ${i + 1}` : `AI Hatası: Soru ${i + 1} üretilemedi`,
        answer: isEnglish ? `AI service is currently unavailable. Please try again later.` : `AI servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.`,
        explanation: isEnglish 
          ? `Flashcard generation failed due to a technical issue. Please check your internet connection and try again.`
          : `Teknik bir sorun nedeniyle AI flashcard üretimi başarısız oldu. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.`,
        topic: isEnglish ? "AI Error" : "AI Hatası",
        difficulty: "Medium" as const,
        keywords: ["AI", "Error", "Fallback"],
        learningObjective: isEnglish 
          ? "Understanding AI errors and finding alternative solutions"
          : "AI hatalarını anlamak ve alternatif çözümler bulmak",
        relatedConcepts: [],
      });
    }

    return {
      flashcards: fallbackFlashcards,
      metadata: {
        totalGenerated: fallbackFlashcards.length,
        subject: input.subject,
        topic: input.topic,
        averageDifficulty: input.difficulty,
        generationTimestamp: new Date().toISOString(),
        aiModel: "Fallback - AI Error",
      },
      qualityScore: 0.1,
      suggestions: ["AI servisi yapılandırılmamış veya hata oluştu"],
      studyTips: ["Lütfen sistem yöneticisi ile iletişime geçin"],
    };
  }
}

// Helper Functions
function calculateQualityScore(
  flashcards: z.infer<typeof GeneratedFlashcardSchema>[],
): number {
  if (flashcards.length === 0) return 0;

  let totalScore = 0;
  for (const card of flashcards) {
    let cardScore = 1.0;

    // Check for quality indicators
    if (card.explanation.length < 20) cardScore -= 0.2;
    if (card.keywords.length < 2) cardScore -= 0.1;
    if (card.question.length < 10) cardScore -= 0.1;
    if (card.answer.length < 5) cardScore -= 0.2;
    
    totalScore += Math.max(0, cardScore);
  }

  return totalScore / flashcards.length;
}

function generateSuggestions(qualityScore: number): string[] {
  const suggestions: string[] = [];
  
  if (qualityScore < 0.8) {
    suggestions.push("Flashcard açıklamaları daha detaylı olabilir.");
  }
  if (qualityScore < 0.6) {
    suggestions.push("Sorular ve cevaplar çok kısa, daha kapsamlı içerik üretmeyi deneyin.");
  }
  
  if (suggestions.length === 0) {
    suggestions.push("Flashcard'lar yüksek kalitede, düzenli tekrarlarla çalışmaya başlayın.");
  }
  
  return suggestions;
}

function generateStudyTips(
  _subject: string,
  _topic: string,
  difficulty: string,
): string[] {
  const tips = [
    "Flashcard'ları günde en az 10-15 dakika çalışın.",
    "Zorlandığınız kartları işaretleyip daha sık tekrar edin.",
    "Spaced repetition (aralıklı tekrar) tekniğini kullanın.",
  ];

  if (difficulty === "Hard") {
    tips.push("Bu konu zor, parçalara ayırarak çalışmayı deneyin.");
    tips.push("Flashcard'lardaki açıklamaları sesli olarak kendinize anlatın.");
  }

  return tips;
}
