"use server";

import { z } from "zod";
import { getPerformanceHistoryForSubject } from "@/services/performance-service";
import { AIFactory } from "@/services/ai/AIFactory";

const PersonalizeQuestionDifficultyInputSchema = z.object({
  userId: z.string().describe("The ID of the user."),
  subject: z
    .string()
    .describe(
      "The subject for which to personalize question difficulty (e.g., Finansal Tablo Analizi).",
    ),
  performanceData: z
    .string()
    .describe(
      "A stringified JSON object of the user's performance data from localStorage. The tool will handle this data.",
    ),
  preferences: z.record(z.any()).optional().describe("User AI preferences"),
});

export type PersonalizeQuestionDifficultyInput = z.infer<
  typeof PersonalizeQuestionDifficultyInputSchema
>;

const PersonalizeQuestionDifficultyOutputSchema = z.object({
  difficulty: z
    .enum(["Easy", "Medium", "Hard"])
    .describe("The personalized difficulty level for the user in the given subject."),
});

export type PersonalizeQuestionDifficultyOutput = z.infer<
  typeof PersonalizeQuestionDifficultyOutputSchema
>;

export async function personalizeQuestionDifficulty(
  input: PersonalizeQuestionDifficultyInput,
): Promise<PersonalizeQuestionDifficultyOutput> {
  try {
    const provider = AIFactory.getProviderFromPreferences(input.preferences || {});

    // Get real performance history
    const pastPerformance = getPerformanceHistoryForSubject(input.subject, input.userId);

    const promptText = `You are an AI that personalizes the difficulty of quiz questions for a student.

Analyze the user's average score from their most recent tests. Consider the last 3 tests for the analysis if available. The 'score' field is the number of correct answers and 'totalQuestions' is the total number of questions.

## USER PAST PERFORMANCE:
${JSON.stringify(pastPerformance, null, 2)}

Follow these rules strictly:
- If there is no performance history for the subject, you MUST recommend 'Easy'.
- If the average score from the recent tests is below 50%, you MUST recommend 'Easy'.
- If the average score is between 50% and 80% (inclusive), you MUST recommend 'Medium'.
- If the average score is above 80%, you MUST recommend 'Hard'.

Return ONLY the difficulty level in THE FOLLOWING EXACT JSON FORMAT:
{
  "difficulty": "Easy" | "Medium" | "Hard"
}

User ID: ${input.userId}
Subject: ${input.subject}`;

    const result = await provider.generateObject<PersonalizeQuestionDifficultyOutput>({
      schema: PersonalizeQuestionDifficultyOutputSchema,
      prompt: promptText,
    });

    return result;
  } catch (error) {
    console.error("Personalize difficulty error:", error);
    return { difficulty: "Easy" }; // Fallback
  }
}
