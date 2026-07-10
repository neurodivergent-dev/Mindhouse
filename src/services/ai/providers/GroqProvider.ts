import { generateObject, generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import type { IAIProvider, GenerateObjectOptions, GenerateTextOptions } from "../core/IAIProvider";

export class GroqProvider implements IAIProvider {
  private groq;
  private model: string;

  constructor(apiKey?: string, model: string = "llama3-8b-8192") {
    this.groq = createOpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      ...(apiKey !== undefined && { apiKey }),
    });
    this.model = model;
  }

  async generateObject<T>(options: GenerateObjectOptions<T>): Promise<T> {
    const { object } = await generateObject({
      model: this.groq(this.model) as unknown as Parameters<typeof generateObject>[0]["model"],
      schema: options.schema,
      prompt: options.prompt,
      ...(options.systemPrompt !== undefined && { system: options.systemPrompt }),
      ...(options.temperature !== undefined && { temperature: options.temperature }),
    });
    return object;
  }

  async generateText(options: GenerateTextOptions): Promise<string> {
    const { text } = await generateText({
      model: this.groq(this.model) as unknown as Parameters<typeof generateObject>[0]["model"],
      prompt: options.prompt,
      ...(options.systemPrompt !== undefined && { system: options.systemPrompt }),
      ...(options.temperature !== undefined && { temperature: options.temperature }),
    });
    return text;
  }
}
