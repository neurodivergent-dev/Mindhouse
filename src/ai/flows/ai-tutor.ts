"use server";

import { z } from "zod";
import type { AIPreferences } from "@/services/ai/AIFactory";
import { AIFactory } from "@/services/ai/AIFactory";

const AiTutorInputSchema = z.object({
  question: z.string().describe("The question text that the user is trying to solve."),
  subject: z.string().describe("The subject area of the question."),
  topic: z.string().describe("The specific topic of the question."),
  userAnswer: z.string().optional().describe("The user's current answer attempt (optional)."),
  difficulty: z
    .enum(["Kolay", "Orta", "Zor"])
    .optional()
    .describe("The difficulty level of the question."),
  options: z
    .array(
      z.object({
        text: z.string(),
        isCorrect: z.boolean(),
      }),
    )
    .optional()
    .describe("The multiple choice options for the question."),
  correctAnswer: z.string().optional().describe("The correct answer text."),
  explanation: z.string().optional().describe("The standard explanation for the correct answer."),
  step: z
    .enum(["hint", "explanation", "step-by-step", "concept-review"])
    .describe("What type of help the user needs."),
  language: z
    .enum(["tr", "en"])
    .optional()
    .default("tr")
    .describe("The language for the AI response (tr for Turkish, en for English)"),
});

export type AiTutorInput = z.infer<typeof AiTutorInputSchema>;

const AiTutorOutputSchema = z.object({
  help: z.string().describe("The help content based on the requested step type."),
  confidence: z.number().optional().describe("AI confidence in the explanation (0-1)."),
});

export type AiTutorOutput = z.infer<typeof AiTutorOutputSchema>;

// Difficulty translation function
function translateDifficulty(difficulty: string): "Kolay" | "Orta" | "Zor" | undefined {
  const difficultyMap: Record<string, "Kolay" | "Orta" | "Zor"> = {
    Easy: "Kolay",
    Medium: "Orta",
    Hard: "Zor",
    easy: "Kolay",
    medium: "Orta",
    hard: "Zor",
    EASY: "Kolay",
    MEDIUM: "Orta",
    HARD: "Zor",
  };

  return difficultyMap[difficulty] || undefined;
}

export async function getAiTutorHelp(
  input: AiTutorInput,
  preferences?: Partial<AIPreferences>,
): Promise<AiTutorOutput> {
  const lang = input.language || "tr";
  const isEnglish = lang === "en";

  try {
    // Translate difficulty appropriately for the target language
    let displayDifficulty: string;
    if (isEnglish) {
      displayDifficulty = input.difficulty || "Unspecified";
      // If Turkish label slipped in, try reverse map (simple)
      if (displayDifficulty === "Kolay") {
        displayDifficulty = "Easy";
      } else if (displayDifficulty === "Orta") {
        displayDifficulty = "Medium";
      } else if (displayDifficulty === "Zor") {
        displayDifficulty = "Hard";
      }
    } else {
      displayDifficulty = input.difficulty
        ? translateDifficulty(input.difficulty) || input.difficulty
        : "Belirtilmemiş";
    }

    const provider = AIFactory.getProviderFromPreferences(preferences || {});

    const languageInstruction = isEnglish
      ? "Generate all explanations and help content in English. Use clear, natural English suitable for students."
      : "Türkçe açıklamalar yap. Öğrenciler için anlaşılır ve doğal Türkçe kullan.";

    const prompt = isEnglish
      ? `You are an expert teacher. Provide hints, detailed explanations, and step-by-step guidance to help the student solve the question.

The student is currently trying to solve this question:
Question: ${input.question}
Topic: ${input.topic}
Subject: ${input.subject}
Difficulty: ${displayDifficulty}
Correct Answer: ${input.correctAnswer || "Not specified"}

Help type: ${input.step}

## YOUR TASK:

### If HINT is requested:
- Start in a friendly way, e.g. "Hello!" or "💡 Hint"
- Explain the core concept in a simple, relatable way (like "Functions are actually like 'number machines'...")
- Do not give the direct answer
- Guide the student in the right direction with clear steps
- Highlight key terms and order of operations
- Trigger the logical thinking process
- End by encouraging the student to try the calculation themselves

### If DETAILED EXPLANATION is requested:
- Teach the core concepts of the topic
- Explain why this answer is correct
- Indicate why other options are wrong
- Use real-life examples

### If STEP-BY-STEP GUIDE is requested:
- Show how to analyze the question
- Explain the logical thinking process step by step
- Highlight critical points

### If CONCEPT REVIEW is requested:
- Summarize the basic concepts related to this topic
- Remind important formulas and definitions
- Point out common mistakes

## IMPORTANT RULES:
- Never give the correct answer directly
- Encourage the student to think
- Use clear and simple language
- ${languageInstruction}
- Support with examples

Student's current answer: ${input.userAnswer || "No answer yet"}

Now help the student!
ATTENTION: Your response MUST be ONLY and EXACTLY in the following JSON format. Do not use any text or markdown (\`\`\`json) outside the JSON:
{
  "help": "Write the long, detailed help text in English for the student here."
}`
      : `Sen bir uzman öğretmensin. Öğrencinin soruyu çözmesine yardım etmek için ipuçları, detaylı açıklamalar ve adım adım rehberlik sağlamalısın.

Öğrenci şu anda şu soruyu çözmeye çalışıyor:
Soru: ${input.question}
Konu: ${input.topic}
Ders: ${input.subject}
Zorluk: ${displayDifficulty}
Doğru Cevap: ${input.correctAnswer || "Belirtilmemiş"}

Yardım türü: ${input.step}

## GÖREVİN:

### İPUCU (hint) isteniyorsa:
- Cevabı doğrudan verme
- Öğrenciyi doğru yöne yönlendir
- Anahtar kelimeleri vurgula
- Mantıksal düşünme sürecini tetikle

### DETAYLI AÇIKLAMA isteniyorsa:
- Konunun temel kavramlarını öğret
- Neden bu cevabın doğru olduğunu açıkla
- Diğer seçeneklerin neden yanlış olduğunu belirt
- Gerçek hayat örnekleri kullan

### ADIM ADIM REHBER isteniyorsa:
- Soruyu nasıl analiz edeceğini göster
- Mantıksal düşünme sürecini adım adım açıkla
- Kritik noktaları vurgula

### KAVRAM İNCELEMESİ isteniyorsa:
- Bu konuyla ilgili temel kavramları özetle
- Önemli formülleri ve tanımları hatırlat
- Sık yapılan hataları belirt

## ÖNEMLİ KURALLAR:
- Asla doğru cevabı doğrudan verme
- Öğrenciyi düşünmeye teşvik et
- Anlaşılır ve basit dil kullan
- ${languageInstruction}
- Örneklerle destekle

Öğrencinin mevcut cevabı: ${input.userAnswer || "Henüz cevap yok"}

Şimdi öğrenciye yardım et!
DİKKAT: Yanıtın KESİNLİKLE ve SADECE aşağıdaki JSON formatında olmalıdır. JSON dışında hiçbir metin veya markdown (\`\`\`json) kullanma:
{
  "help": "Buraya öğrenciye vereceğin uzun, detaylı ve Türkçe yardım metnini yazacaksın."
}`;

    // We use a simplified and highly permissive schema for the LLM to prevent Zod validation errors
    const LLMAiTutorOutputSchema = z
      .object({
        help: z.string().optional(),
        text: z.string().optional(),
        response: z.string().optional(),
        answer: z.string().optional(),
        ipucu: z.string().optional(),
        mesaj: z.string().optional(),
        confidence: z.any().optional(),
      })
      .catchall(z.any());

    const result = await provider.generateObject<Record<string, unknown>>({
      schema: LLMAiTutorOutputSchema,
      prompt,
    });

    // Smart extraction: Try known keys first
    let helpText =
      (result.help as string | undefined) ||
      (result.text as string | undefined) ||
      (result.response as string | undefined) ||
      (result.answer as string | undefined) ||
      (result.ipucu as string | undefined) ||
      (result.mesaj as string | undefined) ||
      (result.açıklama as string | undefined) ||
      (result.content as string | undefined) ||
      (result.data as string | undefined);

    if (!helpText && typeof result === "object" && result !== null) {
      // Find all string values
      const stringValues = Object.values(result).filter(
        (val) => typeof val === "string" && val.trim().length > 0,
      ) as string[];

      if (stringValues.length > 0) {
        // Fallback to the LONGEST string, which is almost certainly the actual explanation/help text
        // rather than a status word like "success" or "true".
        helpText = stringValues.reduce(
          (longest, current) => (current.length > longest.length ? current : longest),
          "",
        );
      }
    }

    helpText =
      helpText ||
      (isEnglish
        ? "I don't know how I can help you right now. Please review the question again."
        : "Sana şu anda nasıl yardımcı olabileceğimi bilemiyorum. Lütfen soruyu tekrar gözden geçir.");

    const confidenceNum = typeof result.confidence === "number" ? result.confidence : 0.8;

    return {
      help: helpText,
      confidence: confidenceNum,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("AI Tutor Error:", error);
    // Return fallback response
    const fallback = isEnglish
      ? "AI assistant is currently unavailable. Please try again later."
      : "Şu anda AI asistanına erişilemiyor. Lütfen daha sonra tekrar deneyin.";
    return {
      help: fallback,
      confidence: 0,
    };
  }
}
