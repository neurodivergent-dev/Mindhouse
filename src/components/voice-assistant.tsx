"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX, Play, Pause, Brain, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface CustomSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: CustomSpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: CustomSpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: CustomSpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: CustomSpeechRecognition, ev: Event) => void) | null;
  start(): void;
  stop(): void;
}

interface VoiceAssistantProps {
  onCommand?: (command: string) => void;
  onQuestionRead?: (question: string) => void;
  onAnswerRead?: (answer: string) => void;
  onTranscript?: (transcript: string) => void;
  currentQuestion?: string;
  currentAnswer?: string;
  currentOptions?: Array<{ text: string; isCorrect: boolean }>;
  currentExplanation?: string;
  aiTutorOutput?: string;
  isListening?: boolean;
  onListeningChange?: (listening: boolean) => void;
  show?: boolean;
  showExplanation?: boolean;
  mode?: "quiz" | "flashcard" | "ai-chat";
  inline?: boolean;
}

const matchesAny = (command: string, terms: string[]) =>
  terms.some((term) => command.includes(term));

function VoiceCommandHint({
  phrase,
  description,
  dotColor,
  hoverBg,
  phraseColor,
}: {
  phrase: string;
  description: string;
  dotColor: string;
  hoverBg: string;
  phraseColor: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 ${hoverBg} rounded-lg sm:rounded-xl transition-colors group`}
    >
      <div
        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 ${dotColor} rounded-full group-hover:scale-125 transition-transform`}
      />
      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-200">
        <span className={`font-semibold ${phraseColor}`}>&quot;{phrase}&quot;</span>
        <span className="text-gray-500 dark:text-gray-400 hidden sm:inline"> - {description}</span>
      </span>
    </div>
  );
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  onCommand,
  onTranscript,
  currentQuestion,
  currentAnswer,
  currentOptions,
  currentExplanation,
  aiTutorOutput,
  isListening = false,
  onListeningChange,
  show = true,
  showExplanation = false,
  mode = "quiz",
  inline = false,
}) => {
  const t = useTranslations("Voice");
  const locale = useLocale();
  const speechLocale = locale === "tr" ? "tr-TR" : "en-US";
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isReadingQuestion, setIsReadingQuestion] = useState(false);
  const [isReadingAnswer, setIsReadingAnswer] = useState(false);
  const [isReadingExplanation, setIsReadingExplanation] = useState(false);
  const [isReadingAiTutor, setIsReadingAiTutor] = useState(false);
  const [recognitionState, setRecognitionState] = useState<
    "idle" | "starting" | "active" | "stopping"
  >("idle");

  const recognitionRef = useRef<CustomSpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const lastProcessedTranscript = useRef<string>("");
  const transcriptProcessingTimeout = useRef<NodeJS.Timeout | null>(null);

  // Convert markdown to plain text for speech
  const markdownToPlainText = (markdown: string): string =>
    markdown
      .replace(/#{1,6}\s+/g, "") // Remove headers
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
      .replace(/\*(.*?)\*/g, "$1") // Remove italic
      .replace(/`(.*?)`/g, "$1") // Remove inline code
      .replace(/```[\s\S]*?```/g, "") // Remove code blocks
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Convert links to text
      .replace(/^\s*[-*+]\s+/gm, "") // Remove list markers
      .replace(/^\s*\d+\.\s+/gm, "") // Remove numbered list markers
      .replace(/\n\s*\n/g, ". ") // Replace double newlines with periods
      .replace(/\n/g, " ") // Replace single newlines with spaces
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();

  // Check browser support
  useEffect(() => {
    const checkSupport = () => {
      const hasRecognition = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
      const hasSynthesis = "speechSynthesis" in window;
      setIsSupported(hasRecognition && hasSynthesis);
    };

    checkSupport();
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported) {
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition() as CustomSpeechRecognition;

    const recognition = recognitionRef.current;
    if (!recognition) {
      return;
    }

    recognition.continuous = true; // Always use continuous mode for stability
    recognition.interimResults = true;
    recognition.lang = speechLocale;

    recognition.onstart = () => {
      setRecognitionState("active");
      onListeningChange?.(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const firstAlternative = result?.[0];
        if (result && firstAlternative) {
          if (result.isFinal) {
            finalTranscript += firstAlternative.transcript;
          } else {
            interimTranscript += firstAlternative.transcript;
          }
        }
      }

      // Get the most recent transcript (either final or interim)
      const currentTranscript = finalTranscript || interimTranscript;

      if (currentTranscript) {
        const cleanTranscript = currentTranscript.trim();

        // Show current transcript for user feedback
        setTranscript(cleanTranscript);

        // Clear any existing timeout
        if (transcriptProcessingTimeout.current) {
          clearTimeout(transcriptProcessingTimeout.current);
        }

        // Only process if we have meaningful content and it's different from last processed
        if (
          cleanTranscript.length > 1 &&
          cleanTranscript.toLowerCase() !== lastProcessedTranscript.current.toLowerCase()
        ) {
          // Set timeout to send after silence (2 seconds as requested)
          transcriptProcessingTimeout.current = setTimeout(() => {
            // Double-check to prevent duplicates (remove isListening check for continuous mode)
            if (cleanTranscript.toLowerCase() !== lastProcessedTranscript.current.toLowerCase()) {
              lastProcessedTranscript.current = cleanTranscript; // Store original case
              handleCommand(cleanTranscript); // Send original case to handleCommand
              setTranscript(""); // Clear transcript after sending
            }
          }, 2000); // 2 seconds timeout as requested
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // Log errors only in development
      if (process.env.NODE_ENV === "development") {
        // do nothing
      }

      // Handle different error types appropriately
      switch (event.error) {
        case "no-speech":
          // User didn&apos;t speak - this is normal, just reset quietly
          setRecognitionState("idle");
          onListeningChange?.(false);
          break;
        case "audio-capture":
          // Microphone access issues - should notify user
          setRecognitionState("idle");
          onListeningChange?.(false);
          if (process.env.NODE_ENV === "development") {
            // do nothing
          }
          break;
        case "not-allowed":
          // Permission denied - should notify user
          setRecognitionState("idle");
          onListeningChange?.(false);
          if (process.env.NODE_ENV === "development") {
            // do nothing
          }
          break;
        case "network":
          // Network issues - might retry or notify user
          setRecognitionState("idle");
          onListeningChange?.(false);
          if (process.env.NODE_ENV === "development") {
            // do nothing
          }
          break;
        case "aborted":
          // Recognition was aborted - normal during stop operation
          setRecognitionState("idle");
          onListeningChange?.(false);
          break;
        default:
          // Other errors - generic handling
          setRecognitionState("idle");
          onListeningChange?.(false);
          if (process.env.NODE_ENV === "development") {
            // do nothing
          }
      }
      setTranscript("");
    };

    recognition.onend = () => {
      // Simple onend handler - don't auto-restart to prevent multiple instances
      if (recognitionState === "stopping" || !isListening) {
        setRecognitionState("idle");
        onListeningChange?.(false);
        setTranscript("");
      } else {
        // If unexpectedly ended but should still be listening, just reset state
        setRecognitionState("idle");
        onListeningChange?.(false);
        setTranscript("");
      }
    };

    return () => {
      if (transcriptProcessingTimeout.current) {
        clearTimeout(transcriptProcessingTimeout.current);
        transcriptProcessingTimeout.current = null;
      }
      if (recognition) {
        try {
          recognition.stop();
          setRecognitionState("idle");
        } catch {
          // Silently handle cleanup errors
          setRecognitionState("idle");
        }
      }
    };
  }, [isSupported, speechLocale]);

  // Initialize speech synthesis
  useEffect(() => {
    if (!isSupported) {
      return;
    }
    synthesisRef.current = window.speechSynthesis;
  }, [isSupported]);

  // Listen for automatic explanation reading
  useEffect(() => {
    const handleReadExplanation = (event: CustomEvent) => {
      if (event.detail?.explanation) {
        speakText(event.detail.explanation, "explanation");
      }
    };

    window.addEventListener("readExplanation", handleReadExplanation as EventListener);

    return () => {
      window.removeEventListener("readExplanation", handleReadExplanation as EventListener);
    };
  }, []);

  // Reset reading states when currentQuestion changes
  useEffect(() => {
    setIsReadingQuestion(false);
    setIsReadingAnswer(false);
    setIsReadingExplanation(false);
    setIsReadingAiTutor(false);
  }, [currentQuestion]);

  const speakOptions = () => {
    if (currentOptions && currentOptions.length > 0) {
      const optionsText = currentOptions
        .map((option, index) => `${index + 1}. ${option.text}`)
        .join(". ");
      speakText(t("optionsPrefix", { options: optionsText }), "answer");
    } else if (currentAnswer) {
      speakText(currentAnswer, "answer");
    }
  };

  const speakBackSide = () => {
    if (currentAnswer && currentExplanation) {
      speakText(
        t("backSideText", {
          answer: currentAnswer,
          explanation: currentExplanation,
        }),
        "explanation",
      );
    } else if (currentAnswer) {
      speakText(t("answerPrefix", { answer: currentAnswer }), "answer");
    } else if (currentExplanation) {
      speakText(currentExplanation, "explanation");
    } else {
      speakText(t("noAnswerOrExplanation"), "help");
    }
  };

  const handleCommand = (command: string) => {
    const normalized = command.toLowerCase();

    if (onTranscript) {
      if (matchesAny(normalized, ["temizle", "clear"])) {
        onCommand?.("clear");
        return;
      }
      onTranscript(command);
      return;
    }

    if (
      matchesAny(normalized, ["cevap", "yanıt", "şıkları", "şık", "answer", "options", "choices"])
    ) {
      speakOptions();
    } else if (
      matchesAny(normalized, ["soru oku", "read question"]) ||
      (normalized.includes("soru") && normalized.includes("oku")) ||
      (normalized.includes("read") && normalized.includes("question"))
    ) {
      if (currentQuestion) {
        speakText(currentQuestion, "question");
      }
    } else if (
      matchesAny(normalized, [
        "arka yüz",
        "arkayüz",
        "cevap ve açıklama",
        "back side",
        "answer and explanation",
      ])
    ) {
      speakBackSide();
    } else if (matchesAny(normalized, ["açıklama", "açıkla", "explanation", "explain"])) {
      if (currentExplanation) {
        speakText(currentExplanation, "explanation");
      } else {
        speakText(t("noExplanation"), "help");
      }
    } else if (
      (normalized.includes("ai") && (normalized.includes("oku") || normalized.includes("read"))) ||
      (normalized.includes("tutor") && (normalized.includes("oku") || normalized.includes("read")))
    ) {
      if (aiTutorOutput) {
        speakText(markdownToPlainText(aiTutorOutput), "ai-tutor");
      } else {
        speakText(t("aiTutorNotAvailable"), "help");
      }
    } else if (
      matchesAny(normalized, ["ipucu oku", "read hint"]) ||
      (normalized.includes("ipucu") && normalized.includes("oku")) ||
      (normalized.includes("hint") && normalized.includes("read"))
    ) {
      onCommand?.("hint");
    } else if (matchesAny(normalized, ["ipucu", "hint"])) {
      onCommand?.("hint");
    } else if (matchesAny(normalized, ["sonraki", "ileri", "next", "forward"])) {
      onCommand?.("next");
    } else if (matchesAny(normalized, ["önceki", "geri", "previous", "back"])) {
      onCommand?.("previous");
    } else if (
      matchesAny(normalized, ["başa dön", "baştan", "karıştır", "shuffle", "restart", "from start"])
    ) {
      onCommand?.("shuffle");
    } else if (matchesAny(normalized, ["çevir", "flip", "döndür", "turn"])) {
      onCommand?.("flip");
    } else if (matchesAny(normalized, ["göster", "show"])) {
      onCommand?.("show");
    } else if (matchesAny(normalized, ["gizle", "hide"])) {
      onCommand?.("hide");
    } else if (matchesAny(normalized, ["dur", "stop"])) {
      stopSpeaking();
    } else if (matchesAny(normalized, ["yardım", "komutlar", "help", "commands"])) {
      const helpText =
        mode === "flashcard"
          ? t("helpCommands.flashcard")
          : onTranscript
            ? t("helpCommands.aiChat")
            : t("helpCommands.quiz");
      speakText(helpText, "help");
    }
  };

  const speakText = (
    text: string,
    type: "question" | "answer" | "help" | "ai-tutor" | "explanation" = "question",
  ) => {
    if (!synthesisRef.current) {
      return;
    }

    // Stop any current speech
    stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLocale;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    utterance.onstart = () => {
      setIsSpeaking(true);
      if (type === "question") {
        setIsReadingQuestion(true);
      }
      if (type === "answer") {
        setIsReadingAnswer(true);
      }
      if (type === "explanation") {
        setIsReadingExplanation(true);
      }
      if (type === "ai-tutor") {
        setIsReadingAiTutor(true);
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsReadingQuestion(false);
      setIsReadingAnswer(false);
      setIsReadingExplanation(false);
      setIsReadingAiTutor(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsReadingQuestion(false);
      setIsReadingAnswer(false);
      setIsReadingExplanation(false);
      setIsReadingAiTutor(false);
    };

    synthesisRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
      setIsReadingQuestion(false);
      setIsReadingAnswer(false);
      setIsReadingAiTutor(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      return;
    }

    // Prevent rapid toggling that can cause race conditions
    if (recognitionState === "starting" || recognitionState === "stopping") {
      return;
    }

    try {
      if (recognitionState === "active" || isListening) {
        // Stop listening
        setRecognitionState("stopping");
        onListeningChange?.(false);
        setTranscript(""); // Clear transcript immediately

        try {
          recognitionRef.current.stop();
        } catch {
          // If stop fails, force reset
          setRecognitionState("idle");
          onListeningChange?.(false);
          setTranscript("");
        }
      } else if (recognitionState === "idle") {
        // Start listening
        setRecognitionState("starting");
        onListeningChange?.(true);

        // Clear any previous transcript and timeout
        setTranscript("");
        lastProcessedTranscript.current = "";
        if (transcriptProcessingTimeout.current) {
          clearTimeout(transcriptProcessingTimeout.current);
          transcriptProcessingTimeout.current = null;
        }

        try {
          recognitionRef.current.start();
        } catch {
          // If start fails, reset to idle
          setRecognitionState("idle");
          onListeningChange?.(false);
        }
      }
    } catch {
      // Handle any unexpected errors by resetting to clean state
      setRecognitionState("idle");
      onListeningChange?.(false);
      setTranscript("");

      // Clean up any pending timeouts
      if (transcriptProcessingTimeout.current) {
        clearTimeout(transcriptProcessingTimeout.current);
        transcriptProcessingTimeout.current = null;
      }
    }
  };

  const renderCommandHint = (
    commandKey: string,
    style: { dotColor: string; hoverBg: string; phraseColor: string },
  ) => (
    <VoiceCommandHint
      key={commandKey}
      phrase={t(`commands.${commandKey}.phrase`)}
      description={t(`commands.${commandKey}.description`)}
      dotColor={style.dotColor}
      hoverBg={style.hoverBg}
      phraseColor={style.phraseColor}
    />
  );

  if (!isSupported) {
    return show ? (
      <div className="fixed bottom-6 left-6 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 max-w-sm">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
          <MicOff className="w-5 h-5" />
          <span className="text-sm font-medium">{t("voiceAssistantNotSupported")}</span>
        </div>
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{t("browserNotSupported")}</p>
      </div>
    ) : null;
  }

  if (!show) {
    return null;
  }

  return (
    <>
      <div className={inline ? "relative z-[110]" : "fixed bottom-6 left-6 z-[110]"}>
        {/* Main voice assistant button */}
        <motion.div
          key="main-button"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="relative"
        >
          <Button
            type="button"
            onClick={toggleListening}
            disabled={recognitionState === "starting" || recognitionState === "stopping"}
            size={inline ? "default" : "lg"}
            className={`rounded-full shadow-lg transition-all duration-300 ${inline ? "w-10 h-10 p-0" : "w-16 h-16"} ${
              isListening || recognitionState === "active"
                ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 animate-pulse"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            } ${recognitionState === "starting" || recognitionState === "stopping" ? "opacity-50 cursor-not-allowed" : ""}`}
            title={t("voiceAssistant")}
          >
            {isListening || recognitionState === "active" ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </Button>

          {/* Status indicator */}
          {(isListening || recognitionState === "active") && (
            <motion.div
              key="status-indicator"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-ping"
            />
          )}
        </motion.div>

        {/* Control buttons */}
        {(isSpeaking || currentQuestion) && (
          <motion.div
            key="control-buttons"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="absolute bottom-20 left-0 flex flex-col gap-2"
          >
            {/* Speak question button */}
            {currentQuestion && (
              <Button
                key="speak-question"
                onClick={() => speakText(currentQuestion, "question")}
                size="sm"
                variant="outline"
                className={`rounded-full w-12 h-12 shadow-lg backdrop-blur-sm transition-all ${
                  isReadingQuestion
                    ? "bg-green-500/20 border-green-500/30 text-green-600 dark:text-green-400 hover:bg-green-500/30"
                    : "bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-white/10"
                }`}
                disabled={isSpeaking && !isReadingQuestion}
              >
                {isReadingQuestion ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            )}

            {/* Speak answer button - hidden in flashcard mode */}
            {(currentAnswer || currentOptions) && mode !== "flashcard" && (
              <Button
                key="speak-answer"
                onClick={speakOptions}
                size="sm"
                variant="outline"
                className={`rounded-full w-12 h-12 shadow-lg backdrop-blur-sm transition-all ${
                  isReadingAnswer
                    ? "bg-green-500/20 border-green-500/30 text-green-600 dark:text-green-400 hover:bg-green-500/30"
                    : "bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-white/10"
                }`}
                disabled={isSpeaking && !isReadingAnswer}
                title={t("readAnswer")}
              >
                {isReadingAnswer ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            )}

            {/* Speak back side button for flashcards */}
            {mode === "flashcard" && currentAnswer && currentExplanation && (
              <Button
                key="speak-back-side"
                onClick={speakBackSide}
                size="sm"
                variant="outline"
                className={`rounded-full w-12 h-12 shadow-lg backdrop-blur-sm transition-all ${
                  isReadingExplanation
                    ? "bg-blue-500/20 border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/30"
                    : "bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-white/10"
                }`}
                disabled={isSpeaking && !isReadingExplanation}
                title={t("readBackSide")}
              >
                {isReadingExplanation ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <BookOpen className="w-4 h-4" />
                )}
              </Button>
            )}

            {/* Speak explanation button */}
            {currentExplanation && showExplanation && (
              <Button
                key="speak-explanation"
                onClick={() => speakText(currentExplanation, "explanation")}
                size="sm"
                variant="outline"
                className={`rounded-full w-12 h-12 shadow-lg backdrop-blur-sm transition-all ${
                  isReadingExplanation
                    ? "bg-blue-500/20 border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/30"
                    : "bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-white/10"
                }`}
                disabled={isSpeaking && !isReadingExplanation}
                title={t("readExplanation")}
              >
                {isReadingExplanation ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <BookOpen className="w-4 h-4" />
                )}
              </Button>
            )}

            {/* Speak AI Tutor output button */}
            {aiTutorOutput && (
              <Button
                key="speak-ai-tutor"
                onClick={() => {
                  const plainText = markdownToPlainText(aiTutorOutput);
                  speakText(plainText, "ai-tutor");
                }}
                size="sm"
                variant="outline"
                className={`rounded-full w-12 h-12 shadow-lg backdrop-blur-sm transition-all ${
                  isReadingAiTutor
                    ? "bg-purple-500/20 border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/30"
                    : "bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-white/10"
                }`}
                disabled={isSpeaking && !isReadingAiTutor}
                title={t("aiTutorRead")}
              >
                {isReadingAiTutor ? <Pause className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
              </Button>
            )}

            {/* Stop speaking button */}
            {isSpeaking && (
              <Button
                key="stop-speaking"
                onClick={stopSpeaking}
                size="sm"
                variant="outline"
                className="rounded-full w-12 h-12 shadow-lg backdrop-blur-sm bg-red-500/20 border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/30 transition-all"
              >
                <VolumeX className="w-4 h-4" />
              </Button>
            )}
          </motion.div>
        )}

        {/* Help tooltip */}
        {(isListening || recognitionState === "active") && (
          <motion.div
            key="help-tooltip"
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            className="absolute bottom-20 left-0 max-w-xs sm:max-w-sm"
          >
            <div className="relative">
              {/* Modern gradient background */}
              <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-100 dark:from-gray-800 dark:via-blue-900/30 dark:to-indigo-900/40 rounded-2xl p-3 sm:p-4 shadow-2xl border border-white/20 dark:border-gray-700/50 backdrop-blur-sm">
                {/* Decorative elements */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-pulse delay-300"></div>

                {/* Header with modern design */}
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-blue-200/50 dark:border-blue-700/30">
                  <div className="relative">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                      <Mic className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-ping"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-white text-xs sm:text-sm">
                      {t("voiceCommands")}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                      {t("assistantMode")}
                    </p>
                  </div>
                </div>

                {/* Commands with modern styling */}
                <div className="space-y-2">
                  {onTranscript ? (
                    <>
                      <div
                        key="voice-input-mode"
                        className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg sm:rounded-xl border border-blue-200/50 dark:border-blue-700/30"
                      >
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">
                          {t("voiceInputActive")}
                        </span>
                      </div>
                      <div
                        key="voice-info"
                        className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-2 sm:mb-3"
                      >
                        {t("voiceInputAutoSend")}
                      </div>
                      <VoiceCommandHint
                        phrase={t("commands.clear.phrase")}
                        description={t("commands.clear.description")}
                        dotColor="bg-red-500"
                        hoverBg="hover:bg-red-50 dark:hover:bg-red-900/10"
                        phraseColor="text-red-600 dark:text-red-400"
                      />
                    </>
                  ) : mode === "quiz" ? (
                    <>
                      <VoiceCommandHint
                        phrase={t("commands.readQuestion.phrase")}
                        description={t("commands.readQuestion.description")}
                        dotColor="bg-blue-500"
                        hoverBg="hover:bg-blue-50 dark:hover:bg-blue-900/10"
                        phraseColor="text-blue-600 dark:text-blue-400"
                      />
                      <VoiceCommandHint
                        phrase={t("commands.readOptions.phrase")}
                        description={t("commands.readOptions.description")}
                        dotColor="bg-green-500"
                        hoverBg="hover:bg-green-50 dark:hover:bg-green-900/10"
                        phraseColor="text-green-600 dark:text-green-400"
                      />
                      {showExplanation && (
                        <VoiceCommandHint
                          phrase={t("commands.readExplanation.phrase")}
                          description={t("commands.readExplanation.description")}
                          dotColor="bg-blue-500"
                          hoverBg="hover:bg-blue-50 dark:hover:bg-blue-900/10"
                          phraseColor="text-blue-600 dark:text-blue-400"
                        />
                      )}
                      <VoiceCommandHint
                        phrase={t("commands.readHint.phrase")}
                        description={t("commands.readHint.description")}
                        dotColor="bg-purple-500"
                        hoverBg="hover:bg-purple-50 dark:hover:bg-purple-900/10"
                        phraseColor="text-purple-600 dark:text-purple-400"
                      />
                    </>
                  ) : mode === "flashcard" ? (
                    <>
                      {renderCommandHint("readQuestion", {
                        dotColor: "bg-blue-500",
                        hoverBg: "hover:bg-blue-50 dark:hover:bg-blue-900/10",
                        phraseColor: "text-blue-600 dark:text-blue-400",
                      })}
                      {renderCommandHint("flip", {
                        dotColor: "bg-indigo-500",
                        hoverBg: "hover:bg-indigo-50 dark:hover:bg-indigo-900/10",
                        phraseColor: "text-indigo-600 dark:text-indigo-400",
                      })}
                      {renderCommandHint("nextCard", {
                        dotColor: "bg-purple-500",
                        hoverBg: "hover:bg-purple-50 dark:hover:bg-purple-900/10",
                        phraseColor: "text-purple-600 dark:text-purple-400",
                      })}
                      {renderCommandHint("previousCard", {
                        dotColor: "bg-orange-500",
                        hoverBg: "hover:bg-orange-50 dark:hover:bg-orange-900/10",
                        phraseColor: "text-orange-600 dark:text-orange-400",
                      })}
                      {renderCommandHint("shuffleCards", {
                        dotColor: "bg-pink-500",
                        hoverBg: "hover:bg-pink-50 dark:hover:bg-pink-900/10",
                        phraseColor: "text-pink-600 dark:text-pink-400",
                      })}
                    </>
                  ) : (
                    <>
                      <div
                        key="read-question"
                        className="flex items-center gap-3 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-xl transition-colors group"
                      >
                        <div className="w-2 h-2 bg-blue-500 rounded-full group-hover:scale-125 transition-transform"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            &quot;Soru oku&quot;
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {" "}
                            - Mevcut soruyu sesli oku
                          </span>
                        </span>
                      </div>
                      <div
                        key="read-answer"
                        className="flex items-center gap-3 p-2 hover:bg-green-50 dark:hover:bg-green-900/10 rounded-xl transition-colors group"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full group-hover:scale-125 transition-transform"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            &quot;Cevap oku&quot;
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {" "}
                            - Şıkları sesli oku
                          </span>
                        </span>
                      </div>
                      <div
                        key="read-explanation"
                        className="flex items-center gap-3 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-xl transition-colors group"
                      >
                        <div className="w-2 h-2 bg-blue-500 rounded-full group-hover:scale-125 transition-transform"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            &quot;Açıklama oku&quot;
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {" "}
                            - Açıklamayı sesli oku
                          </span>
                        </span>
                      </div>
                      <div
                        key="read-ai-tutor"
                        className="flex items-center gap-3 p-2 hover:bg-purple-50 dark:hover:bg-purple-900/10 rounded-xl transition-colors group"
                      >
                        <div className="w-2 h-2 bg-purple-500 rounded-full group-hover:scale-125 transition-transform"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          <span className="font-semibold text-purple-600 dark:text-purple-400">
                            &quot;AI oku&quot;
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {" "}
                            - AI Tutor çıktısını sesli oku
                          </span>
                        </span>
                      </div>
                      <div
                        key="hint"
                        className="flex items-center gap-3 p-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/10 rounded-xl transition-colors group"
                      >
                        <div className="w-2 h-2 bg-yellow-500 rounded-full group-hover:scale-125 transition-transform"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                            &quot;İpucu&quot;
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {" "}
                            - AI Tutor ipucu iste
                          </span>
                        </span>
                      </div>
                      <div
                        key="next"
                        className="flex items-center gap-3 p-2 hover:bg-purple-50 dark:hover:bg-purple-900/10 rounded-xl transition-colors group"
                      >
                        <div className="w-2 h-2 bg-purple-500 rounded-full group-hover:scale-125 transition-transform"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          <span className="font-semibold text-purple-600 dark:text-purple-400">
                            &quot;Sonraki&quot;
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {" "}
                            - Sonraki soruya geç
                          </span>
                        </span>
                      </div>
                      <div
                        key="previous"
                        className="flex items-center gap-3 p-2 hover:bg-orange-50 dark:hover:bg-orange-900/10 rounded-xl transition-colors group"
                      >
                        <div className="w-2 h-2 bg-orange-500 rounded-full group-hover:scale-125 transition-transform"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          <span className="font-semibold text-orange-600 dark:text-orange-400">
                            &quot;Önceki&quot;
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {" "}
                            - Önceki soruya geç
                          </span>
                        </span>
                      </div>
                      <div
                        key="shuffle"
                        className="flex items-center gap-3 p-2 hover:bg-pink-50 dark:hover:bg-pink-900/10 rounded-xl transition-colors group"
                      >
                        <div className="w-2 h-2 bg-pink-500 rounded-full group-hover:scale-125 transition-transform"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          <span className="font-semibold text-pink-600 dark:text-pink-400">
                            &quot;Karıştır&quot;
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {" "}
                            - Soruları karıştır
                          </span>
                        </span>
                      </div>
                      <div
                        key="flip"
                        className="flex items-center gap-3 p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 rounded-xl transition-colors group"
                      >
                        <div className="w-2 h-2 bg-indigo-500 rounded-full group-hover:scale-125 transition-transform"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                            &quot;Çevir&quot;
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {" "}
                            - Flashcard&apos;ı çevir
                          </span>
                        </span>
                      </div>
                      <div
                        key="show"
                        className="flex items-center gap-3 p-2 hover:bg-teal-50 dark:hover:bg-teal-900/10 rounded-xl transition-colors group"
                      >
                        <div className="w-2 h-2 bg-teal-500 rounded-full group-hover:scale-125 transition-transform"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          <span className="font-semibold text-teal-600 dark:text-teal-400">
                            &quot;Göster&quot;
                          </span>
                          <span className="text-gray-500 dark:text-gray-400"> - Cevabı göster</span>
                        </span>
                      </div>
                      <div
                        key="hide"
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors group"
                      >
                        <div className="w-2 h-2 bg-gray-500 rounded-full group-hover:scale-125 transition-transform"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          <span className="font-semibold text-gray-600 dark:text-gray-400">
                            &quot;Gizle&quot;
                          </span>
                          <span className="text-gray-500 dark:text-gray-400"> - Cevabı gizle</span>
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Transcript display - independent fixed position on right */}
      {transcript && (
        <motion.div
          key="transcript-display"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="fixed bottom-6 right-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg max-w-xs z-[110]"
        >
          <div className="flex items-center gap-2 mb-2">
            <Mic className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("detectedCommand")}
            </span>
            {/* Listening indicator */}
            {(isListening || recognitionState === "active") && (
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-auto"></div>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{transcript}</p>
          {/* Status indicator */}
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span>{t("listening")}</span>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default VoiceAssistant;
