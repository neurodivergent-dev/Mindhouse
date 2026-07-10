import { generateObject, generateText } from "ai";
import { createOllama } from "ai-sdk-ollama";
import type { IAIProvider, GenerateObjectOptions, GenerateTextOptions } from "../core/IAIProvider";

export class OllamaProvider implements IAIProvider {
  private ollama;
  private model: string;
  private isCloud: boolean;

  constructor(
    baseURL: string = "http://localhost:11434",
    model: string = "llama3",
    apiKey?: string,
  ) {
    this.isCloud = Boolean(
      apiKey && (baseURL.includes("ollama.com") || baseURL.includes("api.ollama")),
    );

    let normalizedBase =
      baseURL || (this.isCloud ? "https://ollama.com" : "http://localhost:11434");

    // Remove any trailing /api or /api/api from the base URL to prevent /api/api/chat error
    normalizedBase = normalizedBase.replace(/(\/api)+\/?$/, "").replace(/\/$/, "");

    if (!normalizedBase) {
      normalizedBase = this.isCloud ? "https://ollama.com" : "http://localhost:11434";
    }

    this.ollama = createOllama({
      baseURL: normalizedBase,
      ...(apiKey ? { apiKey } : {}), // pass apiKey directly to the provider (recommended for cloud)
    });
    this.model = model;
  }

  async generateObject<T>(options: GenerateObjectOptions<T>): Promise<T> {
    try {
      // Ollama models often include conversational text even when asked for JSON.
      // Adding a strict instruction helps prevent this.
      const strictInstruction =
        "\n\nCRITICAL INSTRUCTION: You must respond with ONLY raw, valid JSON. Do not include ANY conversational text, introductions, or markdown formatting (like ```json). Your entire response must be directly parsable by JSON.parse().";
      const enhancedSystemPrompt = options.systemPrompt
        ? options.systemPrompt + strictInstruction
        : strictInstruction;

      const { object } = await generateObject({
        model: this.ollama(this.model) as unknown as Parameters<typeof generateObject>[0]["model"],
        schema: options.schema,
        mode: "json",
        prompt: options.prompt,
        system: enhancedSystemPrompt,
        ...(options.temperature !== undefined && { temperature: options.temperature }),
      });
      return object;
    } catch (err: unknown) {
      const error = err as Error;
      if (
        error?.message?.includes("Failed to fetch") ||
        error?.message?.toLowerCase().includes("fetch")
      ) {
        if (this.isCloud) {
          throw new Error(
            `Ollama Cloud Error: Failed to fetch. Check your API key in Settings (Ollama Cloud), internet connection, and that the cloud model is available.`,
          );
        } else {
          throw new Error(
            `Ollama Local Error: Failed to fetch. Is Ollama running locally? Start it with 'ollama serve' and verify the base URL in Settings.`,
          );
        }
      }
      throw err;
    }
  }

  async generateText(options: GenerateTextOptions): Promise<string> {
    try {
      const { text } = await generateText({
        model: this.ollama(this.model) as unknown as Parameters<typeof generateObject>[0]["model"],
        prompt: options.prompt,
        ...(options.systemPrompt !== undefined && { system: options.systemPrompt }),
        ...(options.temperature !== undefined && { temperature: options.temperature }),
      });
      return text;
    } catch (err: unknown) {
      const error = err as Error;
      if (
        error?.message?.includes("Failed to fetch") ||
        error?.message?.toLowerCase().includes("fetch")
      ) {
        if (this.isCloud) {
          throw new Error(
            `Ollama Cloud Error: Failed to fetch. Check your API key in Settings (Ollama Cloud), internet connection, and that the cloud model is available.`,
          );
        } else {
          throw new Error(
            `Ollama Local Error: Failed to fetch. Is Ollama running locally? Start it with 'ollama serve' and verify the base URL in Settings.`,
          );
        }
      }
      throw err;
    }
  }
}
