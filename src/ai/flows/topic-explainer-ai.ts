"use server";

import { z } from "zod";

const TopicExplainerInputSchema = z.object({
  topic: z.string().describe("The specific topic to explain."),
  subject: z.string().describe("The subject area (e.g., mathematics, physics, chemistry)."),
  step: z
    .enum(["introduction", "core_learning", "reinforcement", "application", "assessment"])
    .describe("The learning step to generate content for."),
  difficulty: z.enum(["easy", "medium", "hard"]).describe("The difficulty level of the content."),
  estimatedTime: z.number().describe("Estimated time in minutes for this step."),
  preferences: z.record(z.any()).optional(),
  language: z
    .enum(["tr", "en"])
    .optional()
    .default("tr")
    .describe("Language for the generated content (tr or en)"),
  previousStepsContext: z
    .string()
    .optional()
    .describe(
      "Summary or key points from previously generated steps for continuity (optional, use when available for better progressive content)",
    ),
});

export type TopicExplainerInput = z.infer<typeof TopicExplainerInputSchema>;

const TopicExplainerOutputSchema = z.object({
  title: z.string().describe("The title for this learning step."),
  content: z.string().describe("The main educational content for this step."),
  examples: z.array(z.string()).describe("Relevant examples for this step."),
  tips: z.array(z.string()).describe("Learning tips for this step."),
  visualDescription: z.string().describe("Description for AI-generated visual aid."),
  confidence: z.number().describe("AI confidence in the generated content (0-1)."),
});

export type TopicExplainerOutput = z.infer<typeof TopicExplainerOutputSchema>;

export async function generateTopicStepContent(
  input: TopicExplainerInput,
): Promise<TopicExplainerOutput> {
  try {
    return await topicExplainerFlow(input);
  } catch {
    const isEnglish = input.language === "en";
    const stepLabelMap: Record<string, { en: string; tr: string }> = {
      introduction: { en: "Introduction & Motivation", tr: "Tanıtım & Motivasyon" },
      core_learning: { en: "Core Concepts", tr: "Temel Kavramlar" },
      reinforcement: { en: "Deepen Understanding", tr: "Anlayışı Derinleştir" },
      application: { en: "Practice & Examples", tr: "Uygulama & Örnekler" },
      assessment: { en: "Check Your Mastery", tr: "Ustalık Kontrolü" },
    };
    const labels = stepLabelMap[input.step] || { en: "Learning Phase", tr: "Öğrenme Aşaması" };
    const stepLabel = isEnglish ? labels.en : labels.tr;

    // High-quality fallback content (used when AI fails) - much richer than before
    const topic = input.topic;

    let richContent = "";
    let richExamples: string[] = [];
    let richTips: string[] = [];
    let richVisual = `Visual aid for the ${topic} topic`;

    if (input.step === "assessment") {
      if (isEnglish) {
        richContent = `## Self-Assessment for ${topic}

Test your understanding with these questions:

1. What are the key definitions and formulas related to ${topic}?
2. Solve or explain a basic problem involving ${topic}.
3. Identify common mistakes students make with ${topic}.
4. How does ${topic} connect to real-world scenarios?
5. Explain ${topic} in your own words as if teaching a friend.

**Common Pitfalls:**
- Confusing similar concepts
- Forgetting units or conditions
- Not checking edge cases

**How to Master:**
Practice until you can explain and apply without looking up notes.`;
        richExamples = [
          `Create 3 quiz questions about ${topic} and answer them`,
          `Find a real-life example of ${topic} in your daily life`,
          `Teach ${topic} to someone else using a simple analogy`,
        ];
        richTips = [
          "Review previous steps before testing yourself",
          "Write down what you remember before checking the material",
          "Focus on explaining 'why' not just 'how'",
        ];
      } else {
        richContent = `## ${topic} İçin Ustalık Kontrolü

Bu soruları cevaplayarak kendini test et:

1. ${topic} ile ilgili temel tanımlar ve formüller neler?
2. ${topic} içeren basit bir problemi çöz veya açıkla.
3. ${topic} konusunda öğrencilerin yaptığı yaygın hatalar neler?
4. ${topic} gerçek hayatta nerelerde kullanılır?
5. ${topic} konusunu bir arkadaşına öğretir gibi kendi kelimelerinle anlat.

**Yaygın Hatalar:**
- Benzer kavramları karıştırmak
- Birimleri veya koşulları unutmak
- Kenar durumları kontrol etmemek

**Nasıl Ustalaşırsın:**
Notlara bakmadan açıklayabilecek ve uygulayabilecek seviyeye gelene kadar pratik yap.`;
        richExamples = [
          `${topic} hakkında 3 quiz sorusu oluştur ve cevapla`,
          `Günlük hayatında ${topic} ile ilgili bir örnek bul`,
          `${topic} konusunu basit bir benzetmeyle birine anlat`,
        ];
        richTips = [
          "Kendini test etmeden önce önceki adımları gözden geçir",
          "Konuyu kontrol etmeden önce hatırladıklarını yaz",
          "Sadece 'nasıl' değil 'neden' i de açıkla",
        ];
      }
      richVisual = `Assessment diagram or quiz interface for ${topic}`;
    } else {
      // General improved fallback for other steps
      richContent = isEnglish
        ? `## ${stepLabel}: ${topic}

[This is a fallback. In normal operation you would see detailed explanations here.]

Key points about ${topic} in this phase would include definitions, important principles, and why it matters.

Spend time understanding the core ideas before moving forward.`
        : `## ${stepLabel}: ${topic}

[Bu bir yedek içeriktir. Normalde burada detaylı açıklamalar olurdu.]

Bu aşamada ${topic} konusunun temel tanımları, önemli ilkeleri ve neden önemli olduğu anlatılırdı.

İleriye geçmeden önce ana fikirleri anlamaya zaman ayır.`;

      richExamples = isEnglish
        ? [`Practical use of ${topic}`, `Important principle in ${topic}`, `Common example`]
        : [`${topic} konusunun pratik kullanımı`, `${topic} içindeki önemli ilke`, `Yaygın örnek`];
      richTips = isEnglish
        ? [`Focus on understanding ${topic} deeply`, "Take notes", "Practice examples"]
        : [`${topic} konusunu derinlemesine anla`, "Not al", "Örnekleri uygula"];
    }

    return {
      title: `${input.topic} - ${stepLabel}`,
      content: richContent,
      examples: richExamples,
      tips: richTips,
      visualDescription: richVisual,
      confidence: 0.3,
    };
  }
}

import { AIFactory } from "@/services/ai/AIFactory";

export async function topicExplainerFlow(input: TopicExplainerInput) {
  const isEnglish = input.language === "en";

  const prompt = isEnglish
    ? `You are an expert educator specializing in breaking down complex topics into clear, progressive learning phases.

IMPORTANT CONTEXT:
- Main Topic: "${input.topic}"
- Subject Area: "${input.subject}"
- Current Learning Phase: "${input.step}"
- Target Difficulty: "${input.difficulty}"
- Suggested Duration: ${input.estimatedTime} minutes
${input.previousStepsContext ? `- Previous Steps Summary (use this for continuity and to build upon earlier explanations):\n${input.previousStepsContext}\n` : ""}

CRITICAL INSTRUCTION: 
This is a SPECIFIC topic called "${input.topic}" inside "${input.subject}". 
The current phase is "${input.step}" (use human name like "Assessment", "Core Learning" - NEVER use Turkish keys like "degerlendirme" or "tanitim" anywhere in title or content).
NEVER generate generic filler text like "X is one of the core topics in Y" or "Basic concepts related to X".
Dive deep into the ACTUAL concepts, formulas, definitions, and ideas that belong to "${input.topic}". Make sub-concepts specific to this topic.

## LEARNING PHASE DEFINITIONS (use the English name below, NEVER use Turkish keys like "degerlendirme", "tanitim" etc. in output):
- **introduction** (Introduction): Explain WHY this topic matters, real-world relevance, and a high-level overview. Motivate the learner.
- **core_learning** (Core Learning): Teach the fundamental concepts, definitions, key principles, and basic theory specific to "${input.topic}".
- **reinforcement** (Reinforcement): Strengthen understanding with variations, common patterns, and deeper explanations.
- **application** (Application): Show how to use the concepts with worked examples and simple problems.
- **assessment** (Assessment): Provide self-check questions, common pitfalls, and ways to test mastery.

If previous steps context is provided, make this phase build directly on what was already explained (reference key ideas without repeating everything).

## OUTPUT REQUIREMENTS:
Return ONLY valid JSON. No extra text.

{
  "title": "Specific, descriptive title for the current phase focused on real sub-concepts of '${input.topic}' (e.g. 'Core Learning: The Quadratic Formula' or 'Assessment: Common Mistakes in Parabola Graphing'). Do not use generic titles or internal step keys.",
  "content": "Detailed, topic-specific educational content in Markdown. Focus exclusively on real ideas from '${input.topic}'. Use headings, bold for key terms, lists, and examples.",
  "examples": ["3-5 concrete, specific examples that actually belong to '${input.topic}' (not generic)"],
  "tips": ["3-5 practical learning tips, common mistakes, or strategies specific to learning '${input.topic}'"],
  "visualDescription": "Detailed description for an AI image generator representing '${input.topic}'. CRITICAL: Do NOT request readable text, letters, or words as AI generators garble them. Instead, describe a highly aesthetic, clean, abstract 3D illustration, digital art, or a minimalist conceptual metaphor representing the topic (e.g. glowing geometry, sleek nodes, or visual equations without text). Keep the style modern, premium, and clean, like Apple or Stripe graphics.",
  "confidence": 0.85
}

## STRICT RULES:
- All content must be about the real mathematics/physics/chemistry/etc. inside "${input.topic}".
- Use proper terminology for the subject.
- Make examples and explanations concrete and useful.
- The title must clearly relate to the current phase AND the specific topic.
- Write in clear, student-friendly English.
- Avoid any sentence that says the topic is "core" or "important" in a generic way — show it through content.

Generate the content now. ONLY output the JSON.`
    : `Sen bir uzman eğitimcisin. Konuları adım adım, net ve somut şekilde öğreten içerikler üret.

ÖNEMLİ BAĞLAM:
- Ana Konu: "${input.topic}"
- Alan: "${input.subject}"
- Mevcut Öğrenme Aşaması: "${input.step}"
- Hedef Zorluk: "${input.difficulty}"
- Önerilen Süre: ${input.estimatedTime} dakika
${input.previousStepsContext ? `- Önceki Adımların Özeti (bu bilgileri kullanarak daha tutarlı ve ilerletici içerik üret):\n${input.previousStepsContext}\n` : ""}

KRİTİK TALİMAT:
Bu, "${input.subject}" içinde yer alan **özel bir konu** olan "${input.topic}"'dur.
Mevcut aşama "${input.step}" (başlık ve içerikte "Assessment", "Core Learning" gibi insan okunur isim kullan - ASLA "degerlendirme", "tanitim" gibi Türkçe anahtarları output'ta kullanma).
ASLA "X, Y'nin temel konularından biridir" gibi jenerik cümleler veya "Advanced Level'in temel kavramları" tarzı üretme.
"${input.topic}" konusunun GERÇEK kavramlarına, formüllerine, tanımlarına ve fikirlerine odaklan. Alt kavramları bu konuya özel yap.

## ÖĞRENME AŞAMASI TANIMLARI (tam olarak bu aşamayı kullan, anahtarları output'ta kullanma):
- **introduction**: Bu konuyu neden öğreniyoruz? Günlük hayattaki yeri nedir? Kısa genel bakış ver.
- **core_learning**: "${input.topic}" konusunun temel kavramları, tanımlar ve teorik bilgi.
- **reinforcement**: Kavramları pekiştir, varyasyonları ve önemli noktaları vurgula.
- **application**: Kavramları örneklerle uygula, basit problemler çöz.
- **assessment**: Kendi kendini test etme soruları, sık yapılan hatalar, ustalık kontrolü.

Önceki adımlar özeti verilmişse, bu aşamayı önceki açıklamalara dayandır (ana fikirleri referans ver, her şeyi tekrar etme).

## ÇIKTI FORMATI:
Sadece geçerli JSON döndür. Başka hiçbir şey yazma.

{
  "title": "Mevcut aşamaya özel, '${input.topic}' konusunun gerçek alt kavramlarına odaklanan başlık (örn: 'Temel Kavramlar: Karesel Formül' veya 'Değerlendirme: Parabol Grafiği Hataları'). Jenerik veya iç anahtar kullanma.",
  "content": "Markdown formatında, konuya özel detaylı eğitim içeriği. Sadece '${input.topic}' konusunun gerçek kavramlarını anlat.",
  "examples": ["'${input.topic}' konusuna ait 3-5 somut ve gerçek örnek (jenerik olmasın)"],
  "tips": ["'${input.topic}' öğrenirken işe yarayacak 3-5 ipucu, sık hata veya strateji"],
  "visualDescription": "'${input.topic}' konusunu temsil eden yapay zeka görsel açıklaması. KRİTİK: Kesinlikle okunabilir metin, harf veya kelimeler talep etme (görsel yapay zekaları harfleri bozar). Bunun yerine, konuyu simgeleyen yüksek estetikli, temiz, soyut bir 3D illüstrasyon, dijital sanat veya minimalist kavramsal bir metafor tanımla (örn: ışıklı geometrik yapılar, modern bağlantı noktaları veya metinsiz şık diyagramlar). Tarzı Apple veya Stripe grafiklerine benzer şekilde modern, premium ve sade tut.",
  "confidence": 0.85
}

## KESİN KURALLAR:
- Tüm içerik "${input.topic}" konusunun gerçek içeriği olmalı.
- Konuya uygun terminoloji kullan.
- Örnekler ve açıklamalar somut ve faydalı olsun.
- Başlık hem aşamaya hem de konuya özel olsun.
- Öğrenci dostu Türkçe kullan.
- "Bu konu önemlidir" tarzı jenerik cümleler kullanma, içeriğin kendisi göstersin.

Şimdi bu konu için içerik üret. Sadece JSON döndür!`;

  const provider = AIFactory.getProviderFromPreferences(input.preferences || {});
  return await provider.generateObject<TopicExplainerOutput>({
    schema: TopicExplainerOutputSchema,
    prompt,
    temperature: 0.7,
  });
}
