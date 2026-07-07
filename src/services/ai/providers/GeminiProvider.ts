import { generateObject, generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { IAIProvider, GenerateObjectOptions, GenerateTextOptions } from "../core/IAIProvider";

export class GeminiProvider implements IAIProvider {
  private google;
  private model: string;

  constructor(apiKey?: string, model: string = "gemini-2.5-flash") {
    this.google = createGoogleGenerativeAI({
      apiKey: apiKey || process.env.GEMINI_API_KEY || "",
    });
    this.model = model;
  }

  async generateObject<T>(options: GenerateObjectOptions<T>): Promise<T> {
    const { object } = await generateObject({
      model: this.google(this.model) as unknown as Parameters<typeof generateObject>[0]["model"],
      schema: options.schema,
      prompt: options.prompt,
      ...(options.systemPrompt !== undefined && { system: options.systemPrompt }),
      ...(options.temperature !== undefined && { temperature: options.temperature }),
    });
    return object;
  }

  async generateText(options: GenerateTextOptions): Promise<string> {
    const { text } = await generateText({
      model: this.google(this.model) as unknown as Parameters<typeof generateObject>[0]["model"],
      prompt: options.prompt,
      ...(options.systemPrompt !== undefined && { system: options.systemPrompt }),
      ...(options.temperature !== undefined && { temperature: options.temperature }),
    });
    return text;
  }
}
