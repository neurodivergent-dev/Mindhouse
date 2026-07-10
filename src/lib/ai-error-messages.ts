import en from "../../messages/en.json";
import tr from "../../messages/tr.json";

export type AiErrorType =
  "generic" | "rateLimit" | "apiKey" | "apiKeyAdmin" | "network" | "ollamaLocal" | "ollamaCloud";

type Locale = "en" | "tr";

const messages: Record<Locale, typeof en> = { en, tr };

function resolveLocale(locale?: string): Locale {
  return locale === "en" ? "en" : "tr";
}

export function getAiErrorMessage(locale?: string, type: AiErrorType = "generic"): string {
  const errors = messages[resolveLocale(locale)].AIChat.errors;
  return errors[type];
}

export function resolveAiErrorMessage(
  error: unknown,
  locale?: string,
  apiKeyType: "apiKey" | "apiKeyAdmin" = "apiKey",
): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const name = (error as any).name?.toLowerCase() || "";

    if (message.includes("rate limit") || message.includes("quota") || message.includes("429")) {
      return getAiErrorMessage(locale, "rateLimit");
    }

    if (
      message.includes("api key") ||
      message.includes("authentication") ||
      message.includes("401") ||
      name.includes("auth")
    ) {
      return getAiErrorMessage(locale, apiKeyType);
    }

    // Special handling for Ollama errors (distinguish cloud vs local)
    if (
      (name.includes("ollama") || message.includes("ollama")) &&
      (message.includes("failed to fetch") ||
        message.includes("fetch") ||
        message.includes("connect") ||
        message.includes("econnrefused"))
    ) {
      if (message.includes("cloud") || message.includes("Cloud")) {
        return getAiErrorMessage(locale, "ollamaCloud");
      }
      return getAiErrorMessage(locale, "ollamaLocal");
    }

    if (
      message.includes("network") ||
      message.includes("timeout") ||
      message.includes("fetch") ||
      message.includes("econnrefused") ||
      message.includes("connect")
    ) {
      return getAiErrorMessage(locale, "network");
    }
  }

  return getAiErrorMessage(locale, "generic");
}
