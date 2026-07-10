import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { prompt, pollinationsApiKey, pollinationsModel } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt gerekli" }, { status: 400 });
    }

    // URL çok uzun olmaması için 1000 karaktere kadar izin ver (Önceki 200 çok kısaydı)
    const shortPrompt = prompt.length > 1000 ? `${prompt.substring(0, 1000)}...` : prompt;

    const cleanPrompt = shortPrompt;

    const seed = Math.floor(Math.random() * 1000000);
    const model = pollinationsModel || "flux";

    const fluxUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=768&height=768&seed=${seed}&model=${model}&enhance=false&nologo=true`;
    const defaultUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=768&height=768&seed=${seed}&enhance=false&nologo=true`;

    let imageUrl = fluxUrl;

    const fetchHeaders: Record<string, string> = {};
    if (pollinationsApiKey) {
      fetchHeaders.Authorization = `Bearer ${pollinationsApiKey}`;
    }

    // Verify if the selected model is rate-limited (429) or failing
    try {
      const response = await fetch(fluxUrl, { 
        method: "HEAD", 
        headers: fetchHeaders,
        signal: AbortSignal.timeout(2000) 
      });
      if (response.status === 429 || !response.ok) {
        imageUrl = defaultUrl;
      }
    } catch {
      imageUrl = defaultUrl;
    }

    return NextResponse.json({
      imageUrl,
      success: true,
      confidence: 0.9,
    });
  } catch (error) {
    // Image generation error handled silently

    let errorMessage = "Resim oluşturulurken bir hata oluştu.";

    if (error instanceof Error) {
      if (error.message.includes("network") || error.message.includes("timeout")) {
        errorMessage =
          "Resim servisi şu anda erişilebilir değil. Lütfen daha sonra tekrar deneyin.";
      } else if (error.message.includes("invalid") || error.message.includes("malformed")) {
        errorMessage = "Resim oluşturma isteği geçersiz. Lütfen farklı bir açıklama deneyin.";
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        success: false,
      },
      { status: 500 },
    );
  }
}
