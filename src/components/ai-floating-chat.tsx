"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Bot, X, Send, Maximize2, Minimize2, MessageCircle, Trash2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { getAiChatResponse } from "@/ai/flows/ai-chat";
import { Loader2 } from "lucide-react";
import { getStoredAiPreferences, isAiConfigured } from "@/lib/ai-preferences";

interface AIChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  image?: string;
}

interface AIFloatingChatProps {
  subject: string;
  context?: string;
  currentStepTitle?: string;
  topicData?: Record<string, unknown>; // for topic explainer
  quizData?: {
    questions?: unknown[];
    currentQuestionIndex?: number;
    currentQuestion?: Record<string, unknown>;
    selectedAnswer?: number | null;
    timeSpent?: number;
    timeRemaining?: number | null;
    timeLimit?: number | null;
    showTimer?: boolean;
    totalQuestions?: number;
    aiTutorUsed?: boolean;
    showResult?: boolean;
  };
  onOpenChange?: (open: boolean) => void;
}

const AIFloatingChat: React.FC<AIFloatingChatProps> = ({
  subject,
  context: externalContext,
  currentStepTitle,
  topicData,
  quizData,
  onOpenChange,
}) => {
  const tTopic = useTranslations("TopicExplainer");
  const tQuiz = useTranslations("Quiz");
  const t = quizData ? tQuiz : tTopic;
  const tSubjects = useTranslations("Subjects");

  // Safe subject name resolution (Subjects namespace contains lesson names only).
  // "Dashboard" (and unknown values) fall back gracefully to prevent MISSING_MESSAGE.
  const getDisplaySubject = (name: string) => {
    if (name === "Dashboard") {
      return name;
    }
    const demoSubjectNames = [
      "Matematik",
      "Fizik",
      "Kimya",
      "Biyoloji",
      "Tarih",
      "Türk Dili ve Edebiyatı",
      "İngilizce",
    ];
    if (!demoSubjectNames.includes(name)) {
      return name;
    }
    try {
      return tSubjects(name as never);
    } catch {
      return name;
    }
  };
  const displaySubject = getDisplaySubject(subject);
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const closeChat = () => {
    setIsOpen(false);
    setIsFullscreen(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const clearChat = () => {
    setMessages([]);
    setInput("");
    setShowClearConfirm(false);
  };

  const handleClearClick = () => {
    if (messages.length === 0) {
      return;
    }
    setShowClearConfirm(true);
  };

  // Notify parent on open state changes
  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  // Initialize welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      let welcomeContent = "";

      if (quizData) {
        const qNum = (quizData.currentQuestionIndex ?? 0) + 1;
        const total = quizData.totalQuestions || quizData.questions?.length || "?";
        const timeInfo =
          quizData.timeRemaining !== null && quizData.timeRemaining !== undefined
            ? `You have ${quizData.timeRemaining} seconds left.`
            : "No time limit.";
        const selectedInfo =
          quizData.selectedAnswer !== null && quizData.selectedAnswer !== undefined
            ? "You have selected an answer."
            : "You have not selected an answer yet.";
        const isFlash = Boolean(
          quizData.currentQuestion?.answer && !quizData.currentQuestion.options,
        );
        if (isFlash) {
          welcomeContent = t("flashcardAiChatWelcome", {
            subject: displaySubject,
          });
        } else {
          welcomeContent = `${t("quizAiChatWelcome", {
            subject: displaySubject,
          })} You are on question ${qNum} of ${total}. ${timeInfo} ${selectedInfo} I can see the current question, your selection, time info, and whether you used the AI Tutor. Ask away!`;
        }
      } else if (externalContext) {
        // Dashboard or general context
        const isDemo = externalContext.includes("DEMO");
        welcomeContent =
          locale === "tr"
            ? `Merhaba! Dashboard verilerine göre yardımcı oluyorum. ${isDemo ? "Demo verileri aktif." : "Gerçek veriler kullanılıyor."} Performans, zayıf konular veya genel sorular sorabilirsin.`
            : `Hello! Helping with dashboard data. ${isDemo ? "Demo mode active." : "Using real data."} Ask about performance, weak topics or general queries.`;
      } else {
        welcomeContent = t("aiChatWelcome", {
          step: currentStepTitle || "Quiz",
          topic: displaySubject,
          subject: displaySubject,
        });
      }

      const welcome: AIChatMessage = {
        id: "welcome-ai",
        role: "assistant",
        content: welcomeContent,
        timestamp: new Date().toISOString(),
      };
      setMessages([welcome]);
    }
  }, [
    isOpen,
    messages.length,
    subject,
    currentStepTitle,
    quizData,
    externalContext,
    t,
    displaySubject,
    locale,
  ]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) {
      return;
    }

    const aiPreferences = getStoredAiPreferences();
    if (!isAiConfigured(aiPreferences)) {
      const errMsg: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "AI service configuration error. Please check your API key in Settings.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
      return;
    }

    const userMessage: AIChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      }));

      // Build context based on where it's used
      let context = externalContext || "";

      if (topicData?.steps) {
        const step =
          (topicData.steps as Array<Record<string, unknown>>)?.find(
            (s) => s.title === currentStepTitle,
          ) || (topicData.steps as Array<Record<string, unknown>>)?.[0];
        context = `
Current Topic: ${topicData.topic}
Subject: ${topicData.subject}
Current Step: ${step?.title || ""}
Difficulty: ${topicData.difficulty}

Explanation Content:
${step?.content || ""}

Examples:
${(step?.examples as string[] | undefined)?.join("\n- ") || ""}

Tips:
${(step?.tips as string[] | undefined)?.join("\n- ") || ""}
`.trim();
      } else if (quizData) {
        const q = quizData.currentQuestion;
        const selectedIdx = quizData.selectedAnswer;
        const hasAnswered = selectedIdx !== null && selectedIdx !== undefined;
        const showResult = Boolean(quizData.showResult);

        // Sanitize options: never include isCorrect unless showResult is true
        let optionsText = "N/A";
        if (q && Array.isArray(q.options)) {
          optionsText = q.options
            .map((o: Record<string, unknown> | string, i: number) => {
              const text = typeof o === "string" ? o : (o.text as string);
              const isCorrect = typeof o === "string" ? false : Boolean(o.isCorrect);
              if (showResult && isCorrect) {
                return `${i}: ${text} (correct)`;
              }
              return `${i}: ${text}`;
            })
            .join(" | ");
        }

        const selectedText =
          hasAnswered && Array.isArray(q?.options) && q?.options?.[selectedIdx]
            ? typeof q.options[selectedIdx] === "object" && q.options[selectedIdx] !== null
              ? (q.options[selectedIdx] as Record<string, unknown>).text
              : q.options[selectedIdx]
            : "None yet";

        const isFlashcard = Boolean(q?.answer && !Array.isArray(q.options));

        if (isFlashcard) {
          context = `
Current Subject: ${subject}
Current Flashcard: ${(quizData.currentQuestionIndex ?? 0) + 1} / ${quizData.totalQuestions || quizData.questions?.length || "?"}

Question: ${q?.question || q?.text || "N/A"}
${showResult ? `Answer: ${q?.answer || q?.correctAnswer}` : "Answer: (not yet revealed by flipping)"}
Explanation: ${q?.explanation || "N/A"}
Topic: ${q?.topic || "N/A"}
Difficulty: ${q?.difficulty || "N/A"}

User has seen the answer (flipped): ${showResult ? "Yes" : "No"}
AI Tutor was used: ${quizData.aiTutorUsed ? "Yes" : "No"}

Current study progress and state is available above.
`.trim();
        } else {
          context = `
Current Subject: ${subject}
Current Question Number: ${(quizData.currentQuestionIndex ?? 0) + 1} / ${quizData.totalQuestions || quizData.questions?.length || "?"}
Total Questions: ${quizData.totalQuestions || quizData.questions?.length || "?"}

Current Question: ${q?.question || q?.text || "N/A"}
Question Topic: ${q?.topic || "N/A"}
Options: ${optionsText}

User's Selected Answer: ${selectedText}
User has answered this question: ${hasAnswered ? "Yes" : "No"}
Show Result / feedback visible: ${showResult ? "Yes" : "No"}

AI Tutor was used on this question: ${quizData.aiTutorUsed ? "Yes" : "No"}

Time Info:
- Time Spent so far: ${quizData.timeSpent ?? "N/A"} seconds
- Time Remaining: ${quizData.timeRemaining !== null && quizData.timeRemaining !== undefined ? `${quizData.timeRemaining} seconds` : "No limit"}
- Timer is enabled: ${quizData.showTimer ? "Yes" : "No"}
- Time Limit for this quiz: ${quizData.timeLimit !== null && quizData.timeLimit !== undefined ? `${quizData.timeLimit} seconds` : "No limit"}

IMPORTANT INSTRUCTIONS FOR YOU (the AI assistant):
- The user is in the middle of solving a quiz.
- If showResult is false (user has not submitted the answer yet and has not seen the result/feedback), DO NOT reveal the correct answer under any circumstances, even if the user directly asks "what is the answer?" or "which one is correct?".
- In that case, only give hints, explain related concepts, common pitfalls, or encourage them to think and choose.
- Only when showResult is true, you may confirm if their choice was right and fully explain the correct answer.
- Never spoil the quiz before the user has committed to an answer.
- Use the provided question text, topic, options, and user's selection to give targeted help.
`.trim();
        }
      }

      const response = await getAiChatResponse(
        {
          message: currentInput,
          subject,
          conversationHistory,
          context,
        },
        aiPreferences,
        locale,
      );

      // Check if user is asking for an image
      const imageKeywords = locale === "tr"
        ? ["resim", "görsel", "çiz", "göster"]
        : ["image", "picture", "draw", "show", "illustrate"];
      const lowerMessage = currentInput.toLowerCase();
      const shouldGenerateImage = imageKeywords.some((keyword) => lowerMessage.includes(keyword));

      let imageUrl = undefined;
      const imageGenerationEnabled = aiPreferences.imageGenerationEnabled !== false;
      const targetImagePrompt = imageGenerationEnabled ? (response.imagePrompt || (shouldGenerateImage ? currentInput : null)) : null;

      if (targetImagePrompt) {
        try {
          const imgResponse = await fetch("/api/generate-image-hf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: targetImagePrompt,
              subject,
              topic: targetImagePrompt.substring(0, 50),
              pollinationsApiKey: aiPreferences.pollinationsApiKey || "",
              pollinationsModel: aiPreferences.pollinationsModel || "flux",
            }),
          });
          if (imgResponse.ok) {
            const data = await imgResponse.json();
            imageUrl = data.imageUrl || undefined;
          }
        } catch {
          // Fail silently for image generation
        }
      }

      const assistantMessage: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.response,
        timestamp: new Date().toISOString(),
        image: imageUrl,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: t("aiError"),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 shadow-xl hover:scale-105 transition-transform"
          size="icon"
          title={t("aiAssistantTooltip")}
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          className={`${
            isFullscreen
              ? "fixed inset-0 z-[100] bg-white dark:bg-gray-900 flex flex-col"
              : "fixed bottom-4 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96 z-50 h-[520px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl flex flex-col overflow-hidden"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <div>
                <div className="font-semibold text-sm">{t("aiAssistant")}</div>
                <div className="text-[10px] opacity-80 truncate max-w-[200px]">
                  {displaySubject} {currentStepTitle ? `• ${currentStepTitle}` : ""}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearClick}
                disabled={messages.length === 0}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                title={t("clearChat")}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                title={isFullscreen ? t("exitFullscreen") : t("fullscreen")}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeChat}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div
            className={`flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-950 text-sm ${isFullscreen ? "p-6 text-base" : ""}`}
          >
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-xs py-4">{t("aiChatEmpty")}</div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${isFullscreen ? "max-w-[70%]" : ""} ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border rounded-bl-none"
                  }`}
                >
                  {msg.image && (
                    <div className="mb-2 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-md bg-black/5 group relative transition-transform duration-300 hover:scale-[1.01]">
                      <Image
                        src={msg.image}
                        alt="AI generated visual"
                        width={768}
                        height={432}
                        className="w-full h-auto object-cover max-h-[220px]"
                      />
                      <a 
                        href={msg.image} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="absolute inset-0 z-10"
                      />
                    </div>
                  )}
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-2xl text-xs flex items-center gap-2 border">
                  <Loader2 className="w-3 h-3 animate-spin" /> {t("aiThinking")}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div
            className={`p-3 border-t bg-white dark:bg-gray-900 flex gap-2 ${isFullscreen ? "p-4" : ""}`}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("aiChatPlaceholder")}
              className={`flex-1 text-sm ${isFullscreen ? "text-base" : ""}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={isLoading}
            />
            <Button
              onClick={() => {
                void sendMessage();
              }}
              disabled={!input.trim() || isLoading}
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Clear Confirmation Dialog */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("clearChat")}</AlertDialogTitle>
            <AlertDialogDescription>{t("clearChatConfirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("no")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={clearChat}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("yes")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AIFloatingChat;
