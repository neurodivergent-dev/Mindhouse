import type { IAIProvider } from "./core/IAIProvider";
import { GeminiProvider } from "./providers/GeminiProvider";
import { GroqProvider } from "./providers/GroqProvider";
import { OllamaProvider } from "./providers/OllamaProvider";

export interface AIPreferences {
  provider: string;
  geminiApiKey: string;
  geminiModel: string;
  groqApiKey: string;
  groqModel: string;
  ollamaBaseUrl: string;
  ollamaLocalModel: string;
  ollamaCloudApiKey: string;
  ollamaCloudModel: string;
}

export class AIFactory {
  static getProvider(req: Request): IAIProvider {
    // Note: for header-based (API routes), we still delegate to the main logic which now validates keys
    return this.getProviderFromPreferences({
      provider: req.headers.get("x-ai-provider") || "gemini",
      geminiApiKey: req.headers.get("x-ai-api-key") || "",
      geminiModel: req.headers.get("x-ai-model") || "gemini-2.5-flash",
      groqApiKey: req.headers.get("x-ai-api-key") || "",
      groqModel: req.headers.get("x-ai-model") || "llama3-8b-8192",
      ollamaBaseUrl: req.headers.get("x-ai-base-url") || "",
      ollamaLocalModel: req.headers.get("x-ai-model") || "llama3",
      ollamaCloudApiKey: req.headers.get("x-ai-api-key") || "",
      ollamaCloudModel: req.headers.get("x-ai-model") || "llama3",
    });
  }

  static getProviderFromPreferences(prefs: Partial<AIPreferences>): IAIProvider {
    const provider = (prefs.provider || "gemini").toLowerCase();

    switch (provider) {
      case "groq": {
        const key = prefs.groqApiKey || process.env.GROQ_API_KEY || "";
        if (!key) {
          throw new Error("AI API key is not configured for Groq. Please check your API key in Settings.");
        }
        return new GroqProvider(key, prefs.groqModel || "llama3-8b-8192");
      }
      case "ollama-local":
        return new OllamaProvider(
          prefs.ollamaBaseUrl || "http://localhost:11434",
          prefs.ollamaLocalModel || "llama3"
        );
      case "ollama-cloud": {
        const key = prefs.ollamaCloudApiKey || process.env.OLLAMA_CLOUD_API_KEY || "";
        if (!key) {
          throw new Error("AI API key is not configured. Ollama Cloud requires an API key. Please check your API key in Settings.");
        }
        // Official cloud base for native API
        return new OllamaProvider("https://ollama.com/api", prefs.ollamaCloudModel || "llama3", key);
      }
      case "gemini":
      default: {
        const geminiKey = prefs.geminiApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_AI_API_KEY || "";
        if (!geminiKey) {
          throw new Error("AI API key is not configured for Gemini. Please check your API key in Settings.");
        }
        return new GeminiProvider(geminiKey, prefs.geminiModel || "gemini-2.5-flash");
      }
    }
  }
}
