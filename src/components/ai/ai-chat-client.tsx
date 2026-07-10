// components/ai/ai-chat-client.tsx
"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FeatureCards from "@/components/ui/feature-cards";
import type { AiChatInput } from "@/ai/flows/ai-chat";
import { getAiChatResponse } from "@/ai/flows/ai-chat";
import { getStoredAiPreferences, isAiConfigured } from "@/lib/ai-preferences";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  User,
  Sparkles,
  BrainCircuit,
  Lightbulb,
  Loader2,
  Plus,
  ChevronDown,
  BookOpen,
  Volume2,
  Maximize,
  Minimize,
  Check,
  Brain,
  MessageCircle,
  Zap,
  Target,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { supabase } from "@/lib/supabase";
import AiChatHistory from "./ai-chat-history";
import { aiChatSessionRepository } from "@/services/ai-chat-session-storage";
import VoiceAssistant from "../voice-assistant";
import { UnifiedStorageService } from "@/services/unified-storage-service";
import { SubjectService } from "@/services/supabase-service";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string; // Make image optional to match the actual usage
}

interface Suggestions {
  suggestedTopics: string[];
  followUpQuestions: string[];
  learningTips: string[];
}

interface Subject {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  isActive: boolean;
}

const GENERAL_SUBJECT = "Genel";

export default function AiChatClient() {
  const t = useTranslations("AIChat");
  const locale = useLocale();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentSubject, setCurrentSubject] = useState("Genel");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showSubjectSelector, setShowSubjectSelector] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const currentSubjectRef = useRef<string>("Genel");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Voice Assistant states
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getSubjectLabel = useCallback(
    (subject: string) => {
      if (subject === GENERAL_SUBJECT) {
        return t("general");
      }
      if (locale === "tr") {
        return subject;
      }
      const map: Record<string, string> = {
        Matematik: "Mathematics",
        Fizik: "Physics",
        Kimya: "Chemistry",
        Biyoloji: "Biology",
        Tarih: "History",
        "Türk Dili ve Edebiyatı": "Turkish Literature",
        "Türk Dili": "Turkish Literature",
        İngilizce: "English",
        Coğrafya: "Geography",
      };
      return map[subject] || subject;
    },
    [t, locale],
  );

  const getWelcomeMessage = useCallback(
    (subject: string) => {
      if (subject === GENERAL_SUBJECT) {
        return t("welcomeMessageGeneral");
      }
      return t("welcomeMessage", { subject: getSubjectLabel(subject) });
    },
    [t, getSubjectLabel],
  );

  const aiChatFeatures = useMemo(
    () => [
      {
        icon: Brain,
        title: t("featureSmartTutor"),
        description: t("featureSmartTutorDesc"),
        iconBgColor: "bg-gradient-to-r from-blue-500 to-blue-600",
      },
      {
        icon: MessageCircle,
        title: t("featureQa"),
        description: t("featureQaDesc"),
        iconBgColor: "bg-gradient-to-r from-green-500 to-green-600",
      },
      {
        icon: BookOpen,
        title: t("featureSubjectSupport"),
        description: t("featureSubjectSupportDesc"),
        iconBgColor: "bg-gradient-to-r from-purple-500 to-purple-600",
      },
      {
        icon: Lightbulb,
        title: t("featureSuggestions"),
        description: t("featureSuggestionsDesc"),
        iconBgColor: "bg-gradient-to-r from-yellow-500 to-orange-500",
      },
      {
        icon: Zap,
        title: t("featureFastLearning"),
        description: t("featureFastLearningDesc"),
        iconBgColor: "bg-gradient-to-r from-red-500 to-pink-500",
      },
      {
        icon: Target,
        title: t("featureGoalFocused"),
        description: t("featureGoalFocusedDesc"),
        iconBgColor: "bg-indigo-500",
      },
    ],
    [t],
  );

  const starterPrompts = useMemo(() => {
    if (locale === "tr") {
      return [
        {
          title: "Karmaşık Konuları Açıkla",
          description: "Kuantum fiziğini 5 yaşındaki birine anlatır gibi kolayca açıkla.",
          prompt:
            "Kuantum fiziğini 5 yaşındaki bir çocuğun anlayabileceği şekilde en sade haliyle açıkla.",
          icon: Lightbulb,
          color:
            "hover:border-blue-500/30 dark:hover:border-blue-400/30 hover:shadow-md hover:shadow-blue-500/[0.02]",
          glow: "from-blue-500/[0.04] to-indigo-500/[0.03] dark:from-blue-500/[0.06] dark:to-indigo-500/[0.04]",
          iconBg: "bg-blue-500/10 dark:bg-blue-500/20",
          iconColor: "text-blue-600 dark:text-blue-400",
        },
        {
          title: "Çalışma Planı Hazırla",
          description: "Sınavlarım için verimli bir haftalık çalışma programı oluştur.",
          prompt:
            "Önümüzdeki hafta yapacağım sınavlar için bana verimli, adımlı ve dengeli bir ders çalışma planı hazırlar mısın?",
          icon: Target,
          color:
            "hover:border-emerald-500/30 dark:hover:border-emerald-400/30 hover:shadow-md hover:shadow-emerald-500/[0.02]",
          glow: "from-emerald-500/[0.04] to-teal-500/[0.03] dark:from-emerald-500/[0.06] dark:to-teal-500/[0.04]",
          iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
          iconColor: "text-emerald-600 dark:text-emerald-400",
        },
        {
          title: "Beni Test Et",
          description: "Genel kültür veya tarih konularında bilgi seviyemi ölçecek sorular sor.",
          prompt:
            "Genel kültür ve tarih konularında benim bilgi seviyemi test etmek için sırayla 5 soru sorar mısın?",
          icon: Brain,
          color:
            "hover:border-purple-500/30 dark:hover:border-purple-400/30 hover:shadow-md hover:shadow-purple-500/[0.02]",
          glow: "from-purple-500/[0.04] to-pink-500/[0.03] dark:from-purple-500/[0.06] dark:to-pink-500/[0.04]",
          iconBg: "bg-purple-500/10 dark:bg-purple-500/20",
          iconColor: "text-purple-600 dark:text-purple-400",
        },
        {
          title: "Özet ve Analiz Yap",
          description: "Ders çalışma tekniklerini veya zor konuları özetle.",
          prompt:
            "Verimli ders çalışma tekniklerini (Pomodoro, Feynman vb.) kısaca özetle ve analiz et.",
          icon: Sparkles,
          color:
            "hover:border-amber-500/30 dark:hover:border-amber-400/30 hover:shadow-md hover:shadow-amber-500/[0.02]",
          glow: "from-amber-500/[0.04] to-orange-500/[0.03] dark:from-amber-500/[0.06] dark:to-orange-500/[0.04]",
          iconBg: "bg-amber-500/10 dark:bg-amber-500/20",
          iconColor: "text-amber-600 dark:text-amber-400",
        },
      ];
    }
    return [
      {
        title: "Explain Complex Topics",
        description: "Explain quantum physics like I am a 5-year-old.",
        prompt:
          "Explain quantum physics in the simplest terms possible, like I'm a 5-year-old child.",
        icon: Lightbulb,
        color:
          "hover:border-blue-500/30 dark:hover:border-blue-400/30 hover:shadow-md hover:shadow-blue-500/[0.02]",
        glow: "from-blue-500/[0.04] to-indigo-500/[0.03] dark:from-blue-500/[0.06] dark:to-indigo-500/[0.04]",
        iconBg: "bg-blue-500/10 dark:bg-blue-500/20",
        iconColor: "text-blue-600 dark:text-blue-400",
      },
      {
        title: "Create a Study Plan",
        description: "Prepare a custom study schedule for my upcoming exams.",
        prompt:
          "Can you create a productive, step-by-step, balanced study schedule for my exams next week?",
        icon: Target,
        color:
          "hover:border-emerald-500/30 dark:hover:border-emerald-400/30 hover:shadow-md hover:shadow-emerald-500/[0.02]",
        glow: "from-emerald-500/[0.04] to-teal-500/[0.03] dark:from-emerald-500/[0.06] dark:to-teal-500/[0.04]",
        iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
        iconColor: "text-emerald-600 dark:text-emerald-400",
      },
      {
        title: "Quiz Me",
        description: "Ask questions to test my knowledge on any topic.",
        prompt:
          "Can you ask me 5 questions one by one to test my knowledge in history and general science?",
        icon: Brain,
        color:
          "hover:border-purple-500/30 dark:hover:border-purple-400/30 hover:shadow-md hover:shadow-purple-500/[0.02]",
        glow: "from-purple-500/[0.04] to-pink-500/[0.03] dark:from-purple-500/[0.06] dark:to-pink-500/[0.04]",
        iconBg: "bg-purple-500/10 dark:bg-purple-500/20",
        iconColor: "text-purple-600 dark:text-purple-400",
      },
      {
        title: "Summarize & Analyze",
        description: "Summarize difficult concepts or articles quickly.",
        prompt:
          "Briefly summarize and analyze the most effective study techniques (e.g., Pomodoro, Feynman).",
        icon: Sparkles,
        color:
          "hover:border-amber-500/30 dark:hover:border-amber-400/30 hover:shadow-md hover:shadow-amber-500/[0.02]",
        glow: "from-amber-500/[0.04] to-orange-500/[0.03] dark:from-amber-500/[0.06] dark:to-orange-500/[0.04]",
        iconBg: "bg-amber-500/10 dark:bg-amber-500/20",
        iconColor: "text-amber-600 dark:text-amber-400",
      },
    ];
  }, [locale]);

  const imageKeywords = useMemo(
    () =>
      locale === "tr"
        ? ["resim", "görsel", "çiz", "göster"]
        : ["image", "picture", "draw", "show", "illustrate"],
    [locale],
  );

  // Handle scroll events to show/hide scroll button
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    e.stopPropagation(); // Prevent scroll from bubbling to parent
    if (!messagesContainerRef.current) {
      return;
    }
    const isNear = isNearBottom();
    setShowScrollButton(!isNear);
  };

  // Only auto-scroll if user is already near bottom
  useEffect(() => {
    // Remove automatic scrolling - let user control it manually
    // if (isNearBottom()) {
    //   scrollToBottom();
    // }
  }, [messages]);

  // Fetch subjects
  const fetchSubjects = async () => {
    try {
      const { shouldUseDemoData, getDemoSubjects } = await import("@/data/demo-data");
      const demoMode = shouldUseDemoData();

      // Check authentication
      const guestUser = localStorage.getItem("guestUser");
      const {
        data: { session: authSession },
      } = await supabase.auth.getSession();
      const isAuth = Boolean(guestUser || authSession);

      let loadedSubjects: Subject[] = [];

      if (demoMode) {
        const demoData = getDemoSubjects(locale);
        loadedSubjects = demoData.map((subject) => ({
          id: subject.id,
          name: subject.name,
          description: subject.description,
          category: subject.category,
          difficulty: subject.difficulty,
          isActive: subject.isActive,
        }));
      } else if (isAuth) {
        try {
          // Try loading from Supabase first
          const dbSubjects = await SubjectService.getSubjects();

          if (dbSubjects && dbSubjects.length > 0) {
            loadedSubjects = dbSubjects.map((subject) => ({
              id: subject.id,
              name: subject.name,
              description: subject.description,
              category: subject.category,
              difficulty: subject.difficulty,
              questionCount: subject.question_count,
              isActive: subject.is_active,
            }));
          } else {
            // Fallback to localStorage
            loadedSubjects = UnifiedStorageService.getSubjects();
          }
        } catch {
          // Fallback to localStorage on error
          loadedSubjects = UnifiedStorageService.getSubjects();
        }
      } else {
        // Not authenticated, use localStorage
        loadedSubjects = UnifiedStorageService.getSubjects();
      }

      // Only show active subjects
      const activeSubjects = loadedSubjects.filter((subject) => subject.isActive);
      setSubjects(activeSubjects);
    } catch {
      setSubjects([]);
    }
  };

  // Load subjects on mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  // Close subject selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".subject-selector")) {
        setShowSubjectSelector(false);
      }
    };

    if (showSubjectSelector) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSubjectSelector]);

  useEffect(() => {
    setMessages([
      {
        id: "init",
        role: "assistant",
        content: getWelcomeMessage(currentSubject),
      },
    ]);
    // DON'T reset session when subject changes - keep the conversation going
    // setCurrentSessionId(null); // This was causing the issue!
  }, [currentSubject, getWelcomeMessage]);

  // Debug useEffect to track currentSessionId changes
  useEffect(() => {}, [currentSessionId]);

  // Debug useEffect to track currentSubject changes
  useEffect(() => {
    currentSubjectRef.current = currentSubject; // Keep ref in sync
  }, [currentSubject]);

  // Load sessionId from localStorage on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem("currentAIChatSessionId");
    if (savedSessionId && !currentSessionId) {
      setCurrentSessionId(savedSessionId);
      sessionIdRef.current = savedSessionId;
    }
  }, []);

  const createNewSession = async (): Promise<string | null> => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        // Create local session if not authenticated
        const sessionId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await aiChatSessionRepository.saveSession({
          sessionId,
          userId: "guest",
          subject: currentSubjectRef.current,
          title: t("sessionTitle", { subject: getSubjectLabel(currentSubjectRef.current) }),
          messages: [],
          lastMessageAt: new Date().toISOString(),
        });
        return sessionId;
      }

      // Try to create session in Supabase
      try {
        const response = await fetch("/api/ai-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subject: currentSubjectRef.current,
            userId: session.user.id,
            title: t("sessionTitle", { subject: getSubjectLabel(currentSubjectRef.current) }),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return data.sessionId;
        } else {
          // Response not ok, fallback to localStorage
        }
      } catch {
        // Fallback to localStorage on error
      }

      // Fallback to localStorage if Supabase fails
      const sessionId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await aiChatSessionRepository.saveSession({
        sessionId,
        userId: session.user.id,
        subject: currentSubjectRef.current,
        title: t("sessionTitle", { subject: getSubjectLabel(currentSubjectRef.current) }),
        messages: [],
        lastMessageAt: new Date().toISOString(),
      });
      return sessionId;
    } catch {
      //do nothing
      return null;
    }
  };

  const saveMessageToHistory = async (
    role: "user" | "assistant",
    content: string,
    sessionId?: string,
    image?: string,
  ) => {
    try {
      const targetSessionId = sessionId || currentSessionId;
      if (!targetSessionId) {
        return;
      }

      // Try multiple ways to get user ID
      let userId: string | null = null;

      // Method 1: Try getSession first
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.id) {
        userId = session.user.id;
      }

      // Method 2: If session failed, try getUser
      if (!userId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.id) {
          userId = user.id;
        }
      }

      // Method 3: If both failed, try from session again
      if (!userId) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user?.id) {
          userId = session.user.id;
        }
      }

      // If no userId, use 'guest' for localStorage
      if (!userId) {
        userId = "guest";
      }

      // Try to save to Supabase first (only if user is authenticated)
      if (userId !== "guest") {
        try {
          const response = await fetch(`/api/ai-chat/${targetSessionId}/messages`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              role,
              content,
              subject: currentSubject,
              userId,
              image,
            }),
          });

          if (response.ok) {
            return; // Successfully saved to Supabase
          } else {
            // Response not ok, fallback to localStorage
          }
        } catch {
          // Fallback to localStorage on error
        }
      }

      // Fallback to localStorage if Supabase fails or user is guest
      try {
        const messageData: {
          role: "user" | "assistant";
          content: string;
          image?: string;
        } = {
          role,
          content,
        };

        if (image) {
          messageData.image = image;
        }

        await aiChatSessionRepository.addMessage(targetSessionId, messageData);
      } catch {
        //do nothing
      }
    } catch {
      //do nothing
    }
  };

  const loadSessionMessages = async (sessionId: string): Promise<Message[]> => {
    try {
      // Try to load from Supabase first
      let userId: string | null = null;

      // Method 1: Try getSession first
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.id) {
        userId = session.user.id;
      }

      // Method 2: If session failed, try getUser
      if (!userId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.id) {
          userId = user.id;
        }
      }

      if (userId) {
        try {
          const response = await fetch(`/api/ai-chat/${sessionId}?userId=${userId}`);

          if (response.ok) {
            const data = await response.json();
            const formattedMessages: Message[] = data.messages.map(
              (msg: { id: string; role: string; content: string }) => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
              }),
            );

            // Add initial message with correct subject from session data
            const messagesWithInit = [
              {
                id: "init",
                role: "assistant" as const,
                content: getWelcomeMessage(data.subject || currentSubjectRef.current),
              },
              ...formattedMessages,
            ];

            setMessages(messagesWithInit);
            setCurrentSessionId(sessionId);
            return formattedMessages;
          } else {
          }
        } catch {}
      }

      // Fallback to localStorage
      try {
        const localSession = await aiChatSessionRepository.getSession(sessionId);
        if (localSession) {
          const formattedMessages: Message[] = localSession.messages.map((msg) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            ...(msg.image && { image: msg.image }), // Only include image if it exists
          }));

          // Add initial message if session has messages, with correct subject
          const messagesWithInit = [
            {
              id: "init",
              role: "assistant" as const,
              content: getWelcomeMessage(localSession.subject),
            },
            ...formattedMessages,
          ];

          setMessages(messagesWithInit);
          setCurrentSessionId(sessionId);
          return formattedMessages;
        } else {
          // Set empty messages but keep the session ID - with correct subject
          setMessages([
            {
              id: "init",
              role: "assistant",
              content: getWelcomeMessage(currentSubjectRef.current),
            },
          ]);
          setCurrentSessionId(sessionId);
          return [];
        }
      } catch {
        // Set empty messages but keep the session ID - with correct subject
        setMessages([
          {
            id: "init",
            role: "assistant",
            content: getWelcomeMessage(currentSubjectRef.current),
          },
        ]);
        setCurrentSessionId(sessionId);
        return [];
      }
    } catch {
      return [];
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    loadSessionMessages(sessionId);
  };

  // Image generation function
  const generateImage = async (prompt: string, subject: string = "Genel") => {
    try {
      const prefs = getStoredAiPreferences();
      const response = await fetch("/api/generate-image-hf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          subject,
          topic: prompt.substring(0, 50),
          pollinationsApiKey: prefs.pollinationsApiKey || "",
          pollinationsModel: prefs.pollinationsModel || "flux",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.imageUrl;
      }
    } catch {
      // Image generation failed silently
    }
    return null;
  };

  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) {
      return;
    }

    // Sync subject state with ref if they're out of sync
    if (currentSubject !== currentSubjectRef.current) {
      setCurrentSubject(currentSubjectRef.current);
    }

    // Create new session if no current session (for both authenticated and guest users)
    // Check both state and ref, also localStorage as fallback
    const existingSessionId =
      currentSessionId || sessionIdRef.current || localStorage.getItem("currentAIChatSessionId");
    let sessionIdToUse = existingSessionId;

    let updatedMessages: Message[] = [];

    if (!existingSessionId) {
      const newSessionId = await createNewSession();
      if (newSessionId) {
        setCurrentSessionId(newSessionId);
        sessionIdRef.current = newSessionId; // Also store in ref for immediate access
        localStorage.setItem("currentAIChatSessionId", newSessionId); // Persist to localStorage
        sessionIdToUse = newSessionId;
      } else {
        return; // Exit if session creation fails
      }
    } else {
      // Sync the state if it was loaded from ref/localStorage
      if (!currentSessionId) {
        setCurrentSessionId(existingSessionId);
        sessionIdRef.current = existingSessionId;
        // Load existing messages when setting session for the first time
        const existingMessages = await loadSessionMessages(existingSessionId);

        const newUserMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          content: messageContent,
        };

        updatedMessages = [...existingMessages, newUserMessage];
        setMessages(updatedMessages);
        setIsLoading(true);
        setSuggestions(null);

        // Save user message to history if session exists
        if (existingSessionId) {
          await saveMessageToHistory("user", messageContent, existingSessionId);
        }

        sessionIdToUse = existingSessionId;
      } else {
        sessionIdToUse = existingSessionId;
      }
    }

    // Only create newUserMessage and updatedMessages if we didn't handle it above
    if (currentSessionId || !existingSessionId) {
      const newUserMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: messageContent,
      };

      updatedMessages = [...messages, newUserMessage];
      setMessages(updatedMessages);
      setIsLoading(true);
      setSuggestions(null);

      // Save user message to history if session exists
      if (sessionIdToUse) {
        await saveMessageToHistory("user", messageContent, sessionIdToUse);
      }
    }

    const chatInput: AiChatInput = {
      message: messageContent,
      subject: currentSubjectRef.current,
      conversationHistory: updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: new Date().toISOString(),
      })),
    };

    try {
      const aiPreferences = getStoredAiPreferences();
      if (!isAiConfigured(aiPreferences)) {
        const errorContent =
          "AI service configuration error. Please check your API key in Settings.";
        // add as assistant message
        const errorMsg = {
          id: Date.now().toString(),
          role: "assistant" as const,
          content: errorContent,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
        return;
      }

      const result = await getAiChatResponse(chatInput, aiPreferences, locale);

      // Check if user is asking for an image
      const lowerMessage = messageContent.toLowerCase();
      const shouldGenerateImage = imageKeywords.some((keyword) => lowerMessage.includes(keyword));

      let imageUrl = null;
      // Trigger image generation if user requested it OR if the AI model determined that a visual explanation is highly relevant and produced a prompt
      const targetImagePrompt = result.imagePrompt || (shouldGenerateImage ? messageContent : null);
      
      if (targetImagePrompt) {
        imageUrl = await generateImage(targetImagePrompt, currentSubject);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.response,
        image: imageUrl,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Save assistant message to history if session exists
      if (sessionIdToUse) {
        await saveMessageToHistory(
          "assistant",
          result.response,
          sessionIdToUse,
          imageUrl, // Pass the generated image URL
        );
      } else {
      }

      setSuggestions({
        suggestedTopics: result.suggestedTopics,
        followUpQuestions: result.followUpQuestions,
        learningTips: result.learningTips,
      });
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: t("errorMessage"),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
    setInput("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const isNearBottom = () => {
    if (!messagesContainerRef.current) {
      return true;
    }
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const threshold = 150; // pixels from bottom - increased threshold
    return scrollHeight - scrollTop - clientHeight < threshold;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Voice Assistant handlers
  const lastTranscriptRef = useRef<string>("");
  const transcriptTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleVoiceTranscript = (transcript: string) => {
    // Capture the transcript immediately to avoid race condition
    const voiceTranscript = transcript.trim();

    if (!voiceTranscript || voiceTranscript === lastTranscriptRef.current) {
      return; // Skip empty or duplicate transcripts
    }

    // Update last transcript to prevent duplicates
    lastTranscriptRef.current = voiceTranscript;

    // Directly send the message without additional timeout since Voice Assistant already handles timing
    handleSendMessage(voiceTranscript);
    setInput("");
    lastTranscriptRef.current = ""; // Reset for next input
  };

  const handleVoiceCommand = (command: string) => {
    switch (command) {
      case "clear":
        setMessages([]);
        setSuggestions(null);
        break;
      default:
      // Unknown command
    }
  };

  useEffect(
    () => () => {
      if (transcriptTimeoutRef.current) {
        clearTimeout(transcriptTimeoutRef.current);
        transcriptTimeoutRef.current = null;
      }
    },
    [],
  );
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

  // Speak AI response
  const speakAIResponse = (messageId: string, content: string) => {
    if (!("speechSynthesis" in window)) {
      return;
    }

    // Stop any current speech
    window.speechSynthesis.cancel();

    // If already speaking this message, stop it
    if (speakingMessageId === messageId) {
      setSpeakingMessageId(null);
      return;
    }

    const plainText = markdownToPlainText(content);
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.lang = locale === "tr" ? "tr-TR" : "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    // Try to find a male Turkish voice
    const voices = window.speechSynthesis.getVoices();
    const turkishVoices = voices.filter(
      (voice) => voice.lang.includes("tr") || voice.lang.includes("TR"),
    );

    // Look for male voice keywords in Turkish voices
    const maleVoice = turkishVoices.find(
      (voice) =>
        voice.name.toLowerCase().includes("erkek") ||
        voice.name.toLowerCase().includes("male") ||
        voice.name.toLowerCase().includes("man") ||
        voice.name.toLowerCase().includes("ahmet") ||
        voice.name.toLowerCase().includes("mehmet") ||
        (!voice.name.toLowerCase().includes("kadın") &&
          !voice.name.toLowerCase().includes("female") &&
          !voice.name.toLowerCase().includes("woman") &&
          !voice.name.toLowerCase().includes("ayşe") &&
          !voice.name.toLowerCase().includes("fatma")),
    );

    if (maleVoice) {
      utterance.voice = maleVoice;
      // Adjust pitch for more masculine sound
      utterance.pitch = 0.8;
    } else if (turkishVoices.length > 0 && turkishVoices[0]) {
      // Use any Turkish voice available
      utterance.voice = turkishVoices[0];
    }

    utterance.onstart = () => {
      setSpeakingMessageId(messageId);
    };

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div
      className={`flex flex-col justify-center items-center min-h-screen bg-transparent dark:bg-transparent dark:!bg-none ${isFullscreen ? "p-0" : "p-2 sm:p-4 pt-0"}`}
    >
      <Card
        className={`w-full flex flex-col shadow-2xl transition-all duration-300 p-0 ${isFullscreen ? "fixed inset-0 z-[100] rounded-none h-screen max-w-full m-0" : "max-w-[96.25rem] h-[calc(100vh-6rem)] mt-2 border-gradient-question"}`}
      >
        <CardHeader className="border-b">
          <CardTitle className="flex items-center justify-between text-lg md:text-xl">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <BrainCircuit className="text-blue-500 w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
                <span className="text-sm sm:text-base flex-shrink-0">{t("aiTutor")}</span>
                <div className="relative subject-selector flex-1 min-w-0">
                  <Popover open={showSubjectSelector} onOpenChange={setShowSubjectSelector}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        role="combobox"
                        aria-expanded={showSubjectSelector}
                        className="gap-1 sm:gap-2 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0 text-xs sm:text-sm h-8 sm:h-9 min-w-[80px] w-auto max-w-full justify-between"
                      >
                        <div className="flex items-center gap-1 sm:gap-2 min-w-0 overflow-hidden">
                          <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate text-left">
                            {getSubjectLabel(currentSubject)}
                          </span>
                        </div>
                        <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[300px] sm:w-[500px] md:w-[600px] p-0"
                      align="start"
                    >
                      <Command>
                        <CommandInput placeholder={t("searchSubject")} />
                        <CommandList>
                          <CommandEmpty>{t("noSubjectFound")}</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              key={GENERAL_SUBJECT}
                              value={GENERAL_SUBJECT}
                              onSelect={() => {
                                setCurrentSubject(GENERAL_SUBJECT);
                                setShowSubjectSelector(false);
                                setMessages([
                                  {
                                    id: "init",
                                    role: "assistant",
                                    content: getWelcomeMessage(GENERAL_SUBJECT),
                                  },
                                ]);
                              }}
                            >
                              <BookOpen className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                              <span className="break-words whitespace-normal text-left">
                                {t("general")}
                              </span>
                              <Check
                                className={`ml-auto h-4 w-4 ${
                                  currentSubject === GENERAL_SUBJECT ? "opacity-100" : "opacity-0"
                                }`}
                              />
                            </CommandItem>
                            {subjects.map((subject) => (
                              <CommandItem
                                key={subject.id}
                                value={getSubjectLabel(subject.name?.split(":")[0]?.trim() || "")}
                                onSelect={() => {
                                  setCurrentSubject(subject.name);
                                  setShowSubjectSelector(false);
                                  setMessages([
                                    {
                                      id: "init",
                                      role: "assistant",
                                      content: getWelcomeMessage(subject.name),
                                    },
                                  ]);
                                }}
                              >
                                <BookOpen className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                                <span className="break-words whitespace-normal text-left">
                                  {getSubjectLabel(subject.name?.split(":")[0]?.trim() || "") ||
                                    t("unknown")}
                                </span>
                                <Check
                                  className={`ml-auto h-4 w-4 flex-shrink-0 ${
                                    currentSubject === subject.name ? "opacity-100" : "opacity-0"
                                  }`}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                title={isFullscreen ? t("minimize") : t("fullscreen")}
              >
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>

              <AiChatHistory
                onSessionSelect={handleSessionSelect}
                onSessionDelete={(deletedId) => {
                  if (currentSessionId === deletedId) {
                    setCurrentSessionId(null);
                    sessionIdRef.current = null;
                    localStorage.removeItem("currentAIChatSessionId");
                    setMessages([
                      {
                        id: "init",
                        role: "assistant",
                        content: getWelcomeMessage(currentSubject),
                      },
                    ]);
                  }
                }}
                currentSessionId={currentSessionId || undefined}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Clear all session references
                  setCurrentSessionId(null);
                  sessionIdRef.current = null;
                  localStorage.removeItem("currentAIChatSessionId");

                  // Use current state value instead of ref for UI consistency
                  const subjectToUse = currentSubject;

                  // Reset messages with current subject
                  setMessages([
                    {
                      id: "init",
                      role: "assistant",
                      content: getWelcomeMessage(subjectToUse),
                    },
                  ]);
                }}
                className="gap-1 sm:gap-2 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0 text-xs sm:text-sm h-8 sm:h-9"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t("newChat")}</span>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent
          className="flex-1 overflow-y-auto p-3 md:p-6 space-y-6"
          onScroll={handleScroll}
          ref={messagesContainerRef}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 md:gap-4 ${message.role === "user" ? "justify-end" : ""}`}
            >
              {message.role === "assistant" && (
                <Avatar className="w-8 h-8 md:w-10 md:h-10 border-2 border-blue-200">
                  <AvatarFallback className="bg-blue-100 dark:bg-blue-800">
                    <BrainCircuit className="text-blue-500 w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl rounded-2xl px-4 py-3 shadow-sm relative ${message.role === "user" ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-br-none" : "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-bl-none"}`}
              >
                {message.role === "assistant" ? (
                  <div className="max-w-none text-white">
                    {/* Display image if available */}
                    {message.image && (
                      <div className="mb-4 overflow-hidden rounded-xl border border-white/10 shadow-lg bg-black/20 group relative transition-transform duration-300 hover:scale-[1.02]">
                        <Image
                          src={message.image}
                          alt={t("generatedImageAlt")}
                          width={768}
                          height={432}
                          className="w-full h-auto object-cover max-h-[350px] transition-opacity duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                          <span className="text-xs text-white/90 font-medium drop-shadow-md">
                            {t("openImageInNewTab")}
                          </span>
                        </div>
                        <a 
                          href={message.image} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="absolute inset-0 z-10"
                        />
                      </div>
                    )}

                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        code({ className, children, ...props }: React.ComponentProps<"code">) {
                          const match = /language-(\w+)/.exec(className || "");
                          const isInline = !className?.includes("language-");
                          return !isInline && match ? (
                            <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto">
                              <code className={className} {...props}>
                                {children}
                              </code>
                            </pre>
                          ) : (
                            <code
                              className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
                        ),
                        li: ({ children }) => <li className="text-sm">{children}</li>,
                        h1: ({ children }) => (
                          <h1 className="text-xl font-bold mb-2">{children}</h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-lg font-bold mb-2">{children}</h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-base font-bold mb-2">{children}</h3>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-blue-500 pl-4 italic bg-blue-50 dark:bg-blue-900/20 py-2 rounded-r">
                            {children}
                          </blockquote>
                        ),
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>

                    {/* Voice Play Button for AI responses */}
                    <button
                      onClick={() => speakAIResponse(message.id, message.content)}
                      className="absolute bottom-2 right-2 w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                      title={speakingMessageId === message.id ? t("stopVoice") : t("listenVoice")}
                    >
                      <Volume2
                        className={`w-3 h-3 ${speakingMessageId === message.id ? "animate-pulse" : ""}`}
                      />
                    </button>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-sm md:text-base">{message.content}</p>
                )}
              </div>
              {message.role === "user" && (
                <Avatar className="w-8 h-8 md:w-10 md:h-10 border-2 border-gray-300">
                  <AvatarFallback>
                    <User />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {messages.length === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto pt-4 w-full">
              {starterPrompts.map((p, i) => {
                const IconComponent = p.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(p.prompt)}
                    className={`relative overflow-hidden flex flex-col items-start justify-between text-left p-6 sm:p-7 min-h-[190px] sm:min-h-[210px] rounded-2xl bg-white/[0.4] dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.05] ${p.color} transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] group`}
                  >
                    {/* Subtle Gradient Glow on Hover */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${p.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                    />

                    <div className="relative z-10 w-full h-full flex flex-col justify-between items-start">
                      <div className="w-full">
                        <div
                          className={`w-11 h-11 rounded-xl ${p.iconBg} ${p.iconColor} flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-base text-gray-900 dark:text-gray-100 mb-2">
                          {p.title}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed mt-2">
                        {p.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          {isLoading && (
            <div className="flex items-start gap-4">
              <Avatar className="w-10 h-10 border-2 border-blue-200">
                <AvatarFallback className="bg-blue-100 dark:bg-blue-800">
                  <Sparkles className="text-blue-500" />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-2xl px-4 py-3 ">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            </div>
          )}
          {suggestions && !isLoading && (
            <div className="space-y-4 pt-4">
              {suggestions.followUpQuestions?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    {t("followUpTitle")}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.followUpQuestions.map((q, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => handleSuggestionClick(q)}
                      >
                        {q}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {suggestions.suggestedTopics?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-purple-500" />
                    {t("relatedTopics")}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.suggestedTopics.map((topic, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                        onClick={() => handleSuggestionClick(t("explainTopic", { topic }))}
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />

          {/* Scroll to bottom button */}
          {showScrollButton && (
            <Button
              onClick={() => scrollToBottom()}
              size="sm"
              className="fixed bottom-24 right-4 z-10 rounded-full w-12 h-12 p-0 shadow-lg bg-blue-500 hover:bg-blue-600 text-white"
              aria-label={t("scrollToLatest")}
            >
              <ChevronDown className="w-5 h-5" />
            </Button>
          )}
        </CardContent>
        <div className="border-t p-4 bg-white dark:bg-gray-950">
          <form onSubmit={handleFormSubmit} className="flex items-center gap-2 md:gap-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("inputPlaceholder")}
              className="flex-1"
              disabled={isLoading}
            />
            <VoiceAssistant
              onCommand={handleVoiceCommand}
              onTranscript={handleVoiceTranscript}
              isListening={isListening}
              onListeningChange={setIsListening}
              show={true}
              inline={true}
              aiTutorOutput={
                messages.length > 0
                  ? messages
                      .slice()
                      .reverse()
                      .find((msg) => msg.role === "assistant")?.content || ""
                  : ""
              }
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("send")}
            </Button>
          </form>
        </div>
      </Card>

      {/* FeatureCards - Added BELOW the main chat container */}
      <div className="w-full max-w-[96.25rem] mt-8">
        <FeatureCards title={t("featuresTitle")} features={aiChatFeatures} columns={3} />
      </div>
    </div>
  );
}
