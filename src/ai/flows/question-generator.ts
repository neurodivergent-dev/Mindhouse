"use server";

import { z } from "zod";
import type { IAIProvider } from "@/services/ai/core/IAIProvider";
import type { AIPreferences } from "@/services/ai/AIFactory";
import { AIFactory } from "@/services/ai/AIFactory";

const QuestionGenerationInputSchema = z.object({
  subject: z.string().describe("The subject for which to generate questions"),
  topic: z.string().describe("The specific topic within the subject"),
  difficulty: z
    .enum(["Easy", "Medium", "Hard"])
    .describe("The difficulty level of questions to generate"),
  type: z
    .enum(["multiple-choice", "true-false", "calculation", "case-study"])
    .describe("The type of questions to generate"),
  count: z.number().min(1).max(25).describe("Number of questions to generate"),
  language: z.enum(["tr", "en"]).default("tr").describe("Language for the questions"),
  existingQuestions: z
    .array(z.string())
    .optional()
    .describe("Existing questions to avoid duplicates"),
  guidelines: z
    .string()
    .optional()
    .describe("Additional guidelines or requirements for question generation"),
});

export type QuestionGenerationInput = z.infer<typeof QuestionGenerationInputSchema>;

const GeneratedQuestionSchema = z.object({
  text: z.string().describe("The question text"),
  options: z
    .array(
      z.object({
        text: z.string().describe("Option text"),
        isCorrect: z.boolean().describe("Whether this option is correct"),
      }),
    )
    .describe("Answer options for multiple choice questions"),
  explanation: z.string().describe("Detailed explanation of the correct answer"),
  topic: z.string().optional().describe("The specific topic this question covers"),
  formula: z.string().optional().describe("Mathematical formula if applicable"),
  difficulty: z
    .enum(["Easy", "Medium", "Hard"])
    .optional()
    .describe("Actual difficulty of the generated question"),
  keywords: z.array(z.string()).optional().describe("Key concepts covered in the question"),
  learningObjective: z
    .string()
    .optional()
    .describe("What the student should learn from this question"),
});

const QuestionGenerationOutputSchema = z.object({
  questions: z.array(GeneratedQuestionSchema).describe("Generated questions"),
  metadata: z
    .object({
      totalGenerated: z.number().describe("Total number of questions generated"),
      subject: z.string().describe("Subject of the questions"),
      topic: z.string().describe("Topic of the questions"),
      averageDifficulty: z.string().describe("Average difficulty level"),
      generationTimestamp: z.string().describe("When the questions were generated"),
    })
    .optional(),
  qualityScore: z.number().optional().describe("Overall quality score of generated questions"),
  suggestions: z
    .union([z.array(z.string()), z.string()])
    .optional()
    .describe("Suggestions for improving question quality"),
});

export type QuestionGenerationOutput = z.infer<typeof QuestionGenerationOutputSchema>;

export async function generateQuestions(
  input: QuestionGenerationInput,
  providerOrPrefs?: IAIProvider | Partial<AIPreferences>,
): Promise<QuestionGenerationOutput> {
  try {
    const provider =
      providerOrPrefs && "generateObject" in providerOrPrefs
        ? providerOrPrefs
        : AIFactory.getProviderFromPreferences((providerOrPrefs as Partial<AIPreferences>) || {});

    const typeDescriptions = {
      "multiple-choice": "multiple choice questions with 4 options where exactly one is correct",
      "true-false": "true/false questions",
      calculation: "calculation-based questions requiring mathematical problem solving",
      "case-study": "case study questions with real-world scenarios",
    };

    const languageInstructions =
      input.language === "tr"
        ? "Generate all content in Turkish. Use proper Turkish grammar and terminology."
        : "Generate all content in English.";

    const systemPrompt = `You are an expert educational content creator specializing in creating high-quality exam questions.
Your task is to generate ${input.count} ${typeDescriptions[input.type]} for the subject "${input.subject}" on the topic "${input.topic}".

${languageInstructions}

Requirements:
1. Questions must be clear, unambiguous, and educationally valuable
2. Difficulty level should match "${input.difficulty}":
   - Easy: Basic recall and understanding
   - Medium: Application and analysis
   - Hard: Synthesis and evaluation
3. Each question must test a specific learning objective
4. Avoid questions that are too similar to existing ones: ${input.existingQuestions?.join(", ") || "None provided"}
5. Include detailed explanations that help students learn
6. For calculation questions, include the formula used
7. Ensure factual accuracy and pedagogical soundness

${input.guidelines ? `Additional Guidelines: ${input.guidelines}` : ""}

Quality Criteria:
- Clarity: Questions should be easily understood
- Relevance: Questions must be directly related to the topic
- Discrimination: Questions should differentiate between students who understand and those who don't
- Validity: Questions should measure what they intend to measure

CRITICAL INSTRUCTION: You MUST output a JSON object containing the exact keys defined in the schema (e.g. 'questions' array, 'metadata' object, 'qualityScore', 'suggestions'). DO NOT output just an array of questions.`;

    // We use a simplified and highly permissive schema for the LLM to prevent Zod validation errors
    // because local models often hallucinate slightly different key names (e.g. questionText instead of question).
    const LLMQuestionSchema = z
      .object({
        question: z.string().optional().describe("The question text"),
        questionText: z.string().optional(),
        text: z.string().optional(),

        options: z.array(z.any()).optional().describe("Answer options as an array of strings"),

        correctAnswer: z
          .string()
          .optional()
          .describe("The correct answer exactly matching one of the options"),
        correctOption: z.string().optional(),
        correct_answer: z.string().optional(),

        explanation: z.string().optional().describe("Detailed explanation of the correct answer"),
      })
      .catchall(z.any());

    const LLMOutputSchema = z
      .object({
        questions: z.array(LLMQuestionSchema).optional().describe("Generated questions"),
        metadata: z.any().optional(),
        qualityScore: z.any().optional(),
        suggestions: z.any().optional(),
      })
      .catchall(z.any());

    const output = await provider.generateObject<any>({
      prompt: `Generate ${input.count} questions.`,
      systemPrompt,
      schema: LLMOutputSchema,
      temperature: 0.7,
    });

    // Map the simplified LLM output back to our complex application schema
    const mappedQuestions = (output?.questions || []).map((q: any) => {
      // Sometimes local models return options as objects despite the string array schema
      const mappedOptions = (q.options || []).map((opt: any) => {
        const textStr = typeof opt === "string" ? opt : opt.optionText || opt.text || String(opt);
        const correctStr = q.correctAnswer || q.correctOption || q.correct_answer;
        return {
          text: textStr,
          isCorrect:
            typeof opt === "object" && typeof opt.isCorrect === "boolean"
              ? opt.isCorrect
              : textStr === correctStr,
        };
      });

      return {
        text: q.question || q.questionText || q.text || "",
        options: mappedOptions,
        explanation: q.explanation || "",
        topic: input.topic,
        difficulty: input.difficulty,
        keywords: [input.topic],
        learningObjective: `Understand ${input.topic}`,
      };
    });

    const finalOutput = {
      questions: mappedQuestions,
      metadata: {
        totalGenerated: mappedQuestions.length,
        subject: input.subject,
        topic: input.topic,
        averageDifficulty: input.difficulty,
        generationTimestamp: new Date().toISOString(),
      },
      qualityScore: 1.0,
      suggestions: [],
    };

    return validateGeneratedQuestions(finalOutput, input);
  } catch (error) {
    console.error("Failed to generate questions:", error);
    throw new Error("Failed to generate questions");
  }
}

function validateGeneratedQuestions(
  output: any,
  input: QuestionGenerationInput,
): QuestionGenerationOutput {
  // Ensure we have the requested number of questions
  if (!output.questions) {
    output.questions = [];
  }

  // Validate each question
  output.questions = output.questions.map((question: any) => {
    // Ensure multiple choice questions have exactly 4 options
    if (
      input.type === "multiple-choice" &&
      Array.isArray(question.options) &&
      question.options.length !== 4
    ) {
      // Pad or trim options
      while (question.options.length < 4) {
        question.options.push({
          text: `Option ${question.options.length + 1}`,
          isCorrect: false,
        });
      }
      question.options = question.options.slice(0, 4);
    }

    // Ensure exactly one correct answer for multiple choice
    if (input.type === "multiple-choice" && Array.isArray(question.options)) {
      const correctCount = question.options.filter((opt: any) => opt.isCorrect).length;
      if (correctCount !== 1) {
        // Reset all to false and set first as correct
        question.options.forEach((opt: any) => (opt.isCorrect = false));
        if (question.options[0]) {
          question.options[0].isCorrect = true;
        }
      }
    }

    // Ensure true/false questions have exactly 2 options
    if (input.type === "true-false") {
      if (!Array.isArray(question.options) || question.options.length !== 2) {
        question.options = [
          { text: input.language === "tr" ? "Doğru" : "True", isCorrect: true },
          {
            text: input.language === "tr" ? "Yanlış" : "False",
            isCorrect: false,
          },
        ];
      }
    }

    // Fill in missing optional fields
    question.topic = question.topic || input.topic;
    question.difficulty = question.difficulty || input.difficulty;
    question.keywords = question.keywords || [input.topic];
    question.learningObjective = question.learningObjective || `Understand ${input.topic}`;

    return question;
  });

  // Ensure metadata exists
  if (!output.metadata) {
    output.metadata = {
      totalGenerated: output.questions.length,
      subject: input.subject,
      topic: input.topic,
      averageDifficulty: input.difficulty,
      generationTimestamp: new Date().toISOString(),
    };
  }

  // Normalize quality score
  if (output.qualityScore === undefined) {
    output.qualityScore = 1.0;
  } else if (output.qualityScore > 1) {
    output.qualityScore = output.qualityScore / 10;
  }

  // Normalize suggestions
  if (!output.suggestions) {
    output.suggestions = [];
  } else if (typeof output.suggestions === "string") {
    output.suggestions = [output.suggestions];
  }

  // Calculate quality score based on various factors
  let calculatedQualityScore = output.qualityScore;

  // Deduct for missing questions
  if (output.questions.length < input.count) {
    calculatedQualityScore -= (input.count - output.questions.length) * 0.1;
  }

  // Check for empty fields
  output.questions.forEach((q: any) => {
    if (!q.text || q.text.trim().length < 10) {
      calculatedQualityScore -= 0.1;
    }
    if (!q.explanation || q.explanation.trim().length < 20) {
      calculatedQualityScore -= 0.05;
    }
  });

  output.qualityScore = Math.max(0, Math.min(1, calculatedQualityScore));

  return output as QuestionGenerationOutput;
}
