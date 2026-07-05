import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt gerekli" }, { status: 400 });
    }

    // URL çok uzun olmaması için 1000 karaktere kadar izin ver (Önceki 200 çok kısaydı)
    const shortPrompt = prompt.length > 1000 ? `${prompt.substring(0, 1000)}...` : prompt;

    // AI zaten çok detaylı bir prompt ürettiği için ekstra İngilizce kelimelerle kafasını karıştırmıyoruz
    const cleanPrompt = shortPrompt;

    const seed = Math.floor(Math.random() * 1000000);

    // enhance=false yapıyoruz çünkü bizim AI'ımız zaten yeterince detaylı bir prompt verdi.
    // enhance=true olunca Pollinations kendi kafasına göre promptu tamamen değiştirip alakasız şeyler üretebiliyor.
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=768&height=768&seed=${seed}&enhance=false&nologo=true`;

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
        errorMessage = "Resim servisi şu anda erişilebilir değil. Lütfen daha sonra tekrar deneyin.";
      } else if (error.message.includes("invalid") || error.message.includes("malformed")) {
        errorMessage = "Resim oluşturma isteği geçersiz. Lütfen farklı bir açıklama deneyin.";
      }
    }

    return NextResponse.json({
      error: errorMessage,
      success: false,
    }, { status: 500 });
  }
}
