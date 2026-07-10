type ComplexityLevel = "simple" | "medium" | "complex";

interface GeminiPromptParams {
  prompt: string;
  subject: string;
  complexity: string;
}

const PROMPTS = {
  tr: ({ prompt, subject, complexity }) =>
    `SEN BİR 3D SİMÜLASYON UZMANISIN. "${prompt}" İÇİN DETAYLI 3D SAHNE VERİSİ ÜRET.

⚠️ ÇOK ÖNEMLİ KURALLAR ⚠️:
🚫 SADECE JSON YAZ. HİÇBİR AÇIKLAMA, YORUM VEYA EK METİN YAZMA.
🚫 SADECE { İLE BAŞLA VE } İLE BİTİR. BU KURALI ÇİĞNERSEN SİSTEM ÇÖKER.
🚫 MARKDOWN CODE BLOCK KULLANMA. SADECE DÜZ JSON.
🚫 "ELBETTE" "İşte" "Bu JSON verisi" GİBİ CÜMLELER YAZMA.
🚫 SADECE JSON OBJEKTİ YAZ, BAŞKA HİÇBİR ŞEY YAZMA.

ŞU FORMATTA JSON RESPONSE VER:
{
  "description": "Modelin kısa açıklaması.",
  "scientificAccuracy": "Yüksek|Orta|Düşük",
  "camera": {
    "position": [x, y, z],
    "lookAt": [x, y, z]
  },
  "environment": "uzay|laboratuvar|doğal|yok",
  "lights": [
    { "type": "ambient", "color": "#ffffff", "intensity": 0.5 },
    { "type": "directional", "color": "#ffffff", "intensity": 1, "position": [5, 10, 7] }
  ],
  "assets": [
    {
      "name": "string",
      "modelUrl": "https://example.com/model.glb",
      "geometry": { },
      "material": {
        "type": "standard",
        "color": "#ff0000",
        "mapUrl": "https://example.com/texture.jpg",
        "normalMapUrl": "https://example.com/normal.jpg",
        "roughness": 0.5,
        "metalness": 0.1
      },
      "position": [x, y, z],
      "rotation": [x, y, z],
      "scale": [x, y, z],
      "animation": {
        "type": "rotation|pulse|orbit|wave"
      },
      "physics": {
        "type": "dynamic|fixed",
        "shape": "cuboid|ball|trimesh",
        "mass": 1,
        "restitution": 0.5
      }
    }
  ]
}

Konu: ${subject}, Karmaşıklık: ${complexity}. Bilimsel olarak doğru ve görsel olarak zengin bir sahne oluştur. Eğer konu için uygun bir .glb modeli varsa (örneğin 'insan kalbi' için bir kalp modeli), modelUrl kullan. Yoksa 'components' ile oluştur.

🔥 SON UYARI: SADECE JSON YAZ! 🔥`,

  en: ({ prompt, subject, complexity }) =>
    `YOU ARE A 3D SIMULATION EXPERT. GENERATE DETAILED 3D SCENE DATA FOR "${prompt}".

⚠️ CRITICAL RULES ⚠️:
🚫 WRITE ONLY JSON. DO NOT WRITE ANY EXPLANATION, COMMENT, OR EXTRA TEXT.
🚫 START WITH { AND END WITH }. BREAKING THIS RULE WILL CRASH THE SYSTEM.
🚫 DO NOT USE MARKDOWN CODE BLOCKS. PLAIN JSON ONLY.
🚫 DO NOT WRITE PHRASES LIKE "SURE" "HERE IS" "THIS JSON DATA".
🚫 WRITE ONLY THE JSON OBJECT, NOTHING ELSE.

RESPOND IN THIS JSON FORMAT:
{
  "description": "Brief description of the model.",
  "scientificAccuracy": "High|Medium|Low",
  "camera": {
    "position": [x, y, z],
    "lookAt": [x, y, z]
  },
  "environment": "space|laboratory|natural|none",
  "lights": [
    { "type": "ambient", "color": "#ffffff", "intensity": 0.5 },
    { "type": "directional", "color": "#ffffff", "intensity": 1, "position": [5, 10, 7] }
  ],
  "assets": [
    {
      "name": "string",
      "modelUrl": "https://example.com/model.glb",
      "geometry": { },
      "material": {
        "type": "standard",
        "color": "#ff0000",
        "mapUrl": "https://example.com/texture.jpg",
        "normalMapUrl": "https://example.com/normal.jpg",
        "roughness": 0.5,
        "metalness": 0.1
      },
      "position": [x, y, z],
      "rotation": [x, y, z],
      "scale": [x, y, z],
      "animation": {
        "type": "rotation|pulse|orbit|wave"
      },
      "physics": {
        "type": "dynamic|fixed",
        "shape": "cuboid|ball|trimesh",
        "mass": 1,
        "restitution": 0.5
      }
    }
  ]
}

Subject: ${subject}, Complexity: ${complexity}. Create a scientifically accurate and visually rich scene. If a suitable .glb model exists for the topic (e.g. a heart model for 'human heart'), use modelUrl. Otherwise, build with 'components'.

🔥 FINAL WARNING: WRITE ONLY JSON! 🔥`,
} as const satisfies Record<string, (params: GeminiPromptParams) => string>;

export function get3DEducationGeminiPrompt(
  locale: string,
  params: GeminiPromptParams,
): string {
  if (locale === "tr") {
    return PROMPTS.tr(params);
  }

  return PROMPTS.en(params);
}

export function get3DEducationContext(
  locale: string,
  prompt: string,
  complexityLabel: string,
): string {
  if (locale === "tr") {
    return `3D model üretimi: ${prompt}, Karmaşıklık: ${complexityLabel}, Gemini API ile gerçek zamanlı üretim`;
  }

  return `3D model generation: ${prompt}, Complexity: ${complexityLabel}, Real-time generation with Gemini API`;
}

export type { ComplexityLevel };
