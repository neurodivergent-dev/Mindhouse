"use client";

import type { AIPreferences } from "@/services/ai/AIFactory";

export function getStoredAiPreferences(): Partial<AIPreferences> {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const stored = localStorage.getItem("aiPreferences");
    if (!stored) {
      return {};
    }
    const parsed = JSON.parse(stored);
    // Basic sanitization
    return {
      provider: parsed.provider || "gemini",
      geminiApiKey: parsed.geminiApiKey || "",
      geminiModel: parsed.geminiModel || "gemini-2.5-flash",
      groqApiKey: parsed.groqApiKey || "",
      groqModel: parsed.groqModel || "llama3-8b-8192",
      ollamaBaseUrl: parsed.ollamaBaseUrl || "http://localhost:11434",
      ollamaLocalModel: parsed.ollamaLocalModel || "llama3",
      ollamaCloudApiKey: parsed.ollamaCloudApiKey || "",
      ollamaCloudModel: parsed.ollamaCloudModel || "llama3",
    };
  } catch {
    return {};
  }
}

export function saveAiPreferences(prefs: Partial<AIPreferences>) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.setItem("aiPreferences", JSON.stringify(prefs));
  } catch {}
}

export function isAiConfigured(prefs?: Partial<AIPreferences>): boolean {
  const p = prefs || getStoredAiPreferences();
  const provider = (p.provider || "gemini").toLowerCase();

  if (provider === "ollama-local") {
    // Local Ollama doesn't need API key, but user must have Ollama running
    return true;
  }
  if (provider === "gemini") {
    return Boolean(p.geminiApiKey?.trim());
  }
  if (provider === "groq") {
    return Boolean(p.groqApiKey?.trim());
  }
  if (provider === "ollama-cloud") {
    return Boolean(p.ollamaCloudApiKey?.trim());
  }
  return false;
}
