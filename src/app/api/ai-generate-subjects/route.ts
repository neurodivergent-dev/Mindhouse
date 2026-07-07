import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AIFactory } from "@/services/ai/AIFactory";
import { resolveAiErrorMessage } from "@/lib/ai-error-messages";
import { z } from "zod";

const SubjectGenerationInputSchema = z.object({
  category: z.string().min(1, "Kategori gereklidir"),
  difficulty: z.enum(["Başlangıç", "Orta", "İleri"]),
  count: z.number().min(1).max(5),
  guidelines: z.string().optional(),
  language: z.string().default("tr"),
  preferences: z.record(z.unknown()).optional(),
});

const AIGeneratedSubjectSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: z.string(),
  difficulty: z.enum(["Başlangıç", "Orta", "İleri"]),
  topics: z.array(z.string()),
  learningObjectives: z.array(z.string()),
  estimatedDuration: z.string(),
  prerequisites: z.array(z.string()),
  keywords: z.array(z.string()),
});

type SubjectGenerationInput = z.infer<typeof SubjectGenerationInputSchema>;
type AIGeneratedSubject = z.infer<typeof AIGeneratedSubjectSchema>;

// Interface for parsed AI response
interface ParsedAIResponse {
  subjects: AIGeneratedSubject[];
}

// Interface for extracted subject data
interface ExtractedSubject {
  name: string;
  description: string;
  category: string;
  difficulty: string;
  topics: string[];
  learningObjectives: string[];
  estimatedDuration: string;
  prerequisites: string[];
  keywords: string[];
}

export async function POST(request: NextRequest) {
  let language = "tr";

  try {
    const body = await request.json();
    language = typeof body?.language === "string" ? body.language : "tr";
    const input = SubjectGenerationInputSchema.parse(body);

    const response = await subjectGenerationFlow(input);
    return NextResponse.json(response);
  } catch (error) {
    const errorMessage = resolveAiErrorMessage(error, language, "apiKeyAdmin");

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}

async function subjectGenerationFlow(input: SubjectGenerationInput) {
  const prompt = `
    ## ROLÜN
    Sen, eğitim müfredatı tasarımında uzman bir eğitim danışmanısın. Öğrenciler için kapsamlı ve etkili dersler oluşturuyorsun.

    ## ANA GÖREVİN
    Belirtilen kategori ve zorluk seviyesine uygun, kaliteli dersler oluştur ve JSON formatında döndür.

    ## ÇIKTI FORMATI
    Sadece JSON formatında döndür, hiçbir açıklama, markdown (Örn: json bloğu) ekleme:

    {
      "subjects": [
        {
          "name": "Ders Adı",
          "description": "Kısa açıklama",
          "category": "Kategori",
          "difficulty": "Başlangıç|Orta|İleri",
          "topics": ["Alt Konu 1", "Alt Konu 2", "Alt Konu 3"],
          "learningObjectives": ["Hedef 1", "Hedef 2"],
          "estimatedDuration": "X Hafta",
          "prerequisites": ["Ön koşul 1"],
          "keywords": ["Anahtar Kelime 1"]
        }
      ],
      "metadata": {
        "totalGenerated": 1,
        "averageDifficulty": "Orta",
        "generationTimestamp": "2024-03-20T12:00:00Z"
      },
      "qualityScore": 0.9,
      "suggestions": ["Öneri 1", "Öneri 2"]
    }

    ## KALİTE KRİTERLERİ:
    1. **Tutarlılık**: Tüm bilgiler birbiriyle uyumlu olmalı
    2. **Güncellik**: Güncel eğitim trendlerine uygun olmalı
    3. **Pratiklik**: Gerçek hayatta uygulanabilir olmalı
    4. **Kapsamlılık**: Konuya derinlemesine yaklaşmalı
    5. **Anlaşılırlık**: Net ve anlaşılır dil kullanılmalı

    ## ZORLUK SEVİYELERİ:
    - **Başlangıç**: Temel kavramlar, giriş seviyesi konular
    - **Orta**: Orta seviye kavramlar, uygulama odaklı
    - **İleri**: İleri seviye konular, uzmanlaşma gerektiren

    ## KATEGORİ ÖRNEKLERİ:
    - **Fen Bilimleri**: Matematik, Fizik, Kimya, Biyoloji
    - **Sosyal Bilimler**: Tarih, Coğrafya, Felsefe, Psikoloji
    - **Teknoloji**: Programlama, Veri Bilimi, Yapay Zeka
    - **İş Dünyası**: Pazarlama, Finans, Yönetim, Girişimcilik
    - **Sanat**: Müzik, Resim, Tiyatro, Edebiyat

    ---

    ## İSTEK BİLGİLERİ

    - **KATEGORİ:** ${input.category}
    - **ZORLUK SEVİYESİ:** ${input.difficulty}
    - **DERS SAYISI:** ${input.count}
    - **EK YÖNERGELER:** ${input.guidelines || ""}

    ---

    Şimdi, yukarıdaki talimatlara göre ${input.count} adet ${input.category} kategorisinde ${input.difficulty} seviyesinde ders oluştur ve sadece JSON formatında döndür.
    `;

  const provider = AIFactory.getProviderFromPreferences(input.preferences || {});
  const resultText = await provider.generateText({
    prompt,
  });

  // Parse the AI response and create structured output
  const parsedResult = parseAIResponse(resultText);

  // Calculate quality score based on completeness
  const qualityScore = calculateQualityScore(parsedResult.subjects);

  // Generate suggestions for improvement
  const suggestions = generateSuggestions(parsedResult.subjects, input);

  return {
    subjects: parsedResult.subjects,
    metadata: {
      totalGenerated: parsedResult.subjects.length,
      averageDifficulty: input.difficulty,
      generationTimestamp: new Date().toISOString(),
    },
    qualityScore,
    suggestions,
  };
}

function parseAIResponse(text: string): ParsedAIResponse {
  try {
    // Try to parse as JSON first
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch?.[1]) {
      const parsed = JSON.parse(jsonMatch[1]);
      return parsed;
    }

    // Try to find JSON without markdown
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const jsonText = text.substring(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(jsonText);
      return parsed;
    }

    // If no JSON found, try to extract structured data from text
    const subjects = extractSubjectsFromText(text);
    return { subjects };

  } catch {
    return {
      subjects: [],
    };
  }
}

function extractSubjectsFromText(text: string): AIGeneratedSubject[] {
  const subjects: ExtractedSubject[] = [];

  // Split by potential subject separators
  const sections = text.split(/(?=##|###|\*\*|Ders|Subject)/);

  for (const section of sections) {
    if (section.trim().length < 50) { continue; } // Skip short sections

    const subject: ExtractedSubject = {
      name: extractField(section, ["Ders Adı", "Name", "Title"]),
      description: extractField(section, ["Açıklama", "Description", "Desc"]),
      category: extractField(section, ["Kategori", "Category"]),
      difficulty: extractField(section, ["Zorluk", "Difficulty", "Seviye"]),
      topics: extractArray(section, ["Konular", "Topics", "Konu"]),
      learningObjectives: extractArray(section, ["Hedefler", "Objectives", "Öğrenme"]),
      estimatedDuration: extractField(section, ["Süre", "Duration", "Tahmini"]),
      prerequisites: extractArray(section, ["Ön Koşullar", "Prerequisites", "Gereksinimler"]),
      keywords: extractArray(section, ["Anahtar", "Keywords", "Kelime"]),
    };

    // Only add if we have at least a name
    if (subject.name && subject.name.length > 3) {
      subjects.push(subject);
    }
  }

  return subjects as AIGeneratedSubject[];
}

function extractField(text: string, possibleNames: string[]): string {
  for (const name of possibleNames) {
    const regex = new RegExp(`${name}[\\s:]*([^\\n]+)`, 'i');
    const match = text.match(regex);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  return "";
}

function extractArray(text: string, possibleNames: string[]): string[] {
  for (const name of possibleNames) {
    const regex = new RegExp(`${name}[\\s:]*([^\\n]+)`, 'i');
    const match = text.match(regex);
    if (match?.[1]) {
      // Split by common separators
      return match[1].split(/[,•\-\*]/).map(item => item.trim()).filter(item => item.length > 0);
    }
  }
  return [];
}

function calculateQualityScore(subjects: AIGeneratedSubject[]): number {
  if (subjects.length === 0) { return 0; }

  let totalScore = 0;

  subjects.forEach(subject => {
    let score = 0;

    // Check required fields
    if (subject.name && subject.name.length > 3) { score += 0.2; }
    if (subject.description && subject.description.length > 20) { score += 0.2; }
    if (subject.category && subject.category.length > 0) { score += 0.1; }
    if (subject.difficulty) { score += 0.1; }

    // Check arrays
    if (subject.topics && subject.topics.length >= 3) { score += 0.15; }
    if (subject.learningObjectives && subject.learningObjectives.length >= 2) { score += 0.15; }
    if (subject.prerequisites && subject.prerequisites.length >= 1) { score += 0.05; }
    if (subject.keywords && subject.keywords.length >= 3) { score += 0.05; }

    totalScore += score;
  });

  return Math.min(totalScore / subjects.length, 1);
}

function generateSuggestions(subjects: AIGeneratedSubject[], input: SubjectGenerationInput): string[] {
  const suggestions: string[] = [];

  // Check for common issues
  const hasShortNames = subjects.some(s => s.name && s.name.length < 5);
  const hasShortDescriptions = subjects.some(s => s.description && s.description.length < 30);
  const hasFewTopics = subjects.some(s => s.topics && s.topics.length < 3);
  const hasFewObjectives = subjects.some(s => s.learningObjectives && s.learningObjectives.length < 2);

  if (hasShortNames) {
    suggestions.push("Ders adları daha açıklayıcı olabilir");
  }

  if (hasShortDescriptions) {
    suggestions.push("Ders açıklamaları daha detaylı olabilir");
  }

  if (hasFewTopics) {
    suggestions.push("Her ders için daha fazla konu eklenebilir");
  }

  if (hasFewObjectives) {
    suggestions.push("Öğrenme hedefleri daha spesifik olabilir");
  }

  // Add category-specific suggestions
  if (input.category.toLowerCase().includes("fen")) {
    suggestions.push("Fen bilimleri dersleri için pratik uygulamalar eklenebilir");
  }

  if (input.category.toLowerCase().includes("teknoloji")) {
    suggestions.push("Teknoloji dersleri için güncel trendler dahil edilebilir");
  }

  return suggestions;
}
