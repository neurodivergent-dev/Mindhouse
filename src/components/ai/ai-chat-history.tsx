"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { History, Search, Trash2, MessageSquare, Calendar, BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { aiChatSessionRepository } from "@/services/ai-chat-session-storage";

interface AiChatSession {
  id: string;
  userId: string;
  sessionId: string;
  subject: string;
  title?: string | undefined;
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?:
    | {
        content: string;
        image?: string;
      }
    | undefined;
}

interface AiChatHistoryProps {
  onSessionSelect: (sessionId: string) => void;
  onSessionDelete?: (sessionId: string) => void;
  currentSessionId?: string | undefined;
}

const GENERAL_SUBJECT = "Genel";

export default function AiChatHistory({
  onSessionSelect,
  onSessionDelete,
  currentSessionId,
}: AiChatHistoryProps) {
  const t = useTranslations("AIChat");
  const tCommon = useTranslations("Common");
  const [sessions, setSessions] = useState<AiChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const getSubjectLabel = useCallback(
    (subject: string) => (subject === GENERAL_SUBJECT ? t("general") : subject),
    [t],
  );

  const fetchSessions = async (search?: string) => {
    try {
      setIsLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;

      let allSessions: AiChatSession[] = [];

      if (user) {
        try {
          const url = search
            ? `/api/ai-chat?search=${encodeURIComponent(search)}&userId=${user.id}`
            : `/api/ai-chat?userId=${user.id}`;

          const response = await fetch(url);

          if (response.ok) {
            const data = await response.json();
            allSessions = data;
          }
        } catch {}
      }

      const localSessions = await aiChatSessionRepository.getSessions(user?.id);

      let localFormattedSessions: AiChatSession[] = localSessions.map((session) => {
        const lastMessage =
          session.messages && session.messages.length > 0
            ? session.messages[session.messages.length - 1]
            : undefined;

        return {
          id: session.id,
          userId: session.userId,
          sessionId: session.sessionId,
          subject: session.subject,
          title: session.title || undefined,
          messageCount: session.messages?.length || 0,
          lastMessageAt: session.lastMessageAt,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                ...(lastMessage.image && { image: lastMessage.image }),
              }
            : undefined,
        };
      });

      if (search?.trim()) {
        const searchLower = search.toLowerCase().trim();
        localFormattedSessions = localFormattedSessions.filter((session) => {
          if (session.title?.toLowerCase().includes(searchLower)) {
            return true;
          }

          if (session.subject.toLowerCase().includes(searchLower)) {
            return true;
          }

          if (session.lastMessage?.content?.toLowerCase().includes(searchLower)) {
            return true;
          }

          const originalSession = localSessions.find((s) => s.sessionId === session.sessionId);
          if (originalSession?.messages) {
            return originalSession.messages.some((msg) =>
              msg.content.toLowerCase().includes(searchLower),
            );
          }

          return false;
        });
      }

      const combinedSessions = [...allSessions, ...localFormattedSessions];

      combinedSessions.sort(
        (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
      );

      setSessions(combinedSessions);
    } catch {
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    console.log("deleteSession called with ID:", sessionId);
    let deletedFromSupabase = false;
    let userId: string | null = null;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        userId = session.user.id;
      }
    } catch (e) {
      console.warn("Could not get user for database delete, proceeding locally:", e);
    }

    if (userId) {
      try {
        console.log("Attempting to delete from Supabase for user:", userId);
        const response = await fetch(`/api/ai-chat/${sessionId}?userId=${userId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          deletedFromSupabase = true;
          console.log("Successfully deleted from Supabase");
        } else {
          console.warn("Supabase delete response not OK:", response.status);
        }
      } catch (e) {
        console.error("Failed to delete session from Supabase:", e);
      }
    }

    try {
      console.log("Attempting to delete from IndexedDB local repo...");
      const deletedFromLocal = await aiChatSessionRepository.deleteSession(sessionId);
      console.log("IndexedDB delete result:", deletedFromLocal);

      if (deletedFromLocal || deletedFromSupabase) {
        toast({
          title: t("success"),
          description: t("deleteSuccess"),
        });
        if (onSessionDelete) {
          onSessionDelete(sessionId);
        }
        await fetchSessions(searchTerm);
      } else {
        console.warn("Session not found in local IndexedDB or Supabase");
        toast({
          title: tCommon("error"),
          description: t("deleteNotFound"),
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error("Failed to delete session from local storage:", e);
      toast({
        title: tCommon("error"),
        description: t("deleteError"),
        variant: "destructive",
      });
    }
  };

  const handleSearch = () => {
    fetchSessions(searchTerm);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return t("justNow");
    } else if (diffInHours < 24) {
      return t("hoursAgo", { hours: diffInHours });
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return t("daysAgo", { days: diffInDays });
    }
  };

  useEffect(() => {
    if (isDialogOpen) {
      fetchSessions();
    }
  }, [isDialogOpen]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1 sm:gap-2 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0 text-xs sm:text-sm h-8 sm:h-9"
        >
          <History className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">{t("history")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="
          max-w-2xl
          h-[600px]
          overflow-hidden
          flex
          flex-col
          w-[94vw] mx-auto
          p-4 sm:p-6
        "
      >
        <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <DialogTitle className="flex items-center gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <History className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div>
              <span className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {t("historyTitle")}
              </span>
              <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mt-1">
                {t("historySubtitle")}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-3 mb-6 lg:mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
            <Input
              placeholder={t("historySearch")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10 lg:h-12 lg:text-base border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800"
            />
          </div>
          <Button
            onClick={handleSearch}
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 lg:h-12 lg:px-6"
          >
            <Search className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="hidden sm:inline ml-2">{t("search")}</span>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <p className="text-base text-gray-600 dark:text-gray-400 font-medium">
                {t("loading")}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{t("loadingHistory")}</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 h-[350px] text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-500/20 dark:border-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <MessageSquare className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {searchTerm ? t("noSearchResults") : t("noHistory")}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto text-center leading-relaxed">
                {searchTerm ? t("noSearchResultsDesc") : t("noHistoryDesc")}
              </p>
            </div>
          ) : (
            sessions.map((session) => (
              <Card
                key={session.sessionId}
                className={`group cursor-pointer transition-all duration-300 hover:shadow-md border ${
                  currentSessionId === session.sessionId
                    ? "bg-gradient-to-r from-blue-500/[0.03] to-purple-500/[0.03] dark:from-blue-500/[0.06] dark:to-purple-500/[0.04] border-blue-400/50 dark:border-blue-800/60 shadow-sm"
                    : "bg-white/[0.4] dark:bg-white/[0.02] border-slate-200/50 dark:border-white/[0.05] hover:border-blue-500/30 dark:hover:border-blue-500/20"
                }`}
                onClick={() => {
                  onSessionSelect(session.sessionId);
                  setIsDialogOpen(false);
                }}
              >
                <CardContent className="p-4 lg:p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                          <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base lg:text-lg truncate text-gray-900 dark:text-gray-100">
                            {session.title ||
                              t("sessionTitle", { subject: getSubjectLabel(session.subject) })}
                          </h3>
                          <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 truncate">
                            {t("chatAbout", { subject: getSubjectLabel(session.subject) })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 mb-3">
                        <div className="flex items-center gap-2 text-sm lg:text-base text-gray-600 dark:text-gray-300">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <MessageSquare className="w-4 h-4 lg:w-5 lg:h-5" />
                          <span className="font-medium">
                            {t("messageCount", { count: session.messageCount })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm lg:text-base text-gray-600 dark:text-gray-300">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <Calendar className="w-4 h-4 lg:w-5 lg:h-5" />
                          <span className="font-medium">{formatDate(session.lastMessageAt)}</span>
                        </div>
                      </div>

                      {session.lastMessage && (
                        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            {t("lastMessage")}
                          </p>
                          <div className="flex items-start gap-2">
                            {session.lastMessage.image && (
                              <Image
                                src={session.lastMessage.image}
                                alt={t("lastMessageImageAlt")}
                                width={48}
                                height={48}
                                className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                              />
                            )}
                            <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 flex-1">
                              {session.lastMessage.content}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-1 mt-2">
                        <Badge
                          variant="secondary"
                          className="text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 dark:from-blue-900/30 dark:to-purple-900/30 dark:text-blue-200 border border-blue-200 dark:border-blue-700"
                        >
                          {getSubjectLabel(session.subject)}
                        </Badge>
                        {session.messageCount > 0 && (
                          <Badge
                            variant="outline"
                            className="text-xs font-medium text-green-600 border-green-300 dark:text-green-400 dark:border-green-700"
                          >
                            {t("active")}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.sessionId);
                      }}
                      className="opacity-70 hover:opacity-100 text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 w-8 h-8 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
