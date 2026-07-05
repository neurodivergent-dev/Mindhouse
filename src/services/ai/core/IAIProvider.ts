import { z } from "zod";

export interface GenerateObjectOptions<T> {
  prompt: string;
  schema: z.ZodType<T>;
  systemPrompt?: string;
  temperature?: number;
}

export interface GenerateTextOptions {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
}

export interface IAIProvider {
  generateObject<T>(options: GenerateObjectOptions<T>): Promise<T>;
  generateText(options: GenerateTextOptions): Promise<string>;
}
