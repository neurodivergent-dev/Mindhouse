import localforage from "localforage";

export interface AIChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  image?: string;
}

export interface AIChatSession {
  id: string;
  userId: string;
  sessionId: string;
  subject: string;
  title?: string;
  messages: AIChatMessage[];
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

// 1. Dependency Inversion Principle: Abstraction Interface
export interface IAiChatSessionRepository {
  getSessions(userId?: string): Promise<AIChatSession[]>;
  getSession(sessionId: string): Promise<AIChatSession | null>;
  saveSession(
    session: Omit<AIChatSession, "id" | "createdAt" | "updatedAt" | "messageCount">,
  ): Promise<AIChatSession>;
  updateSession(sessionId: string, updates: Partial<AIChatSession>): Promise<boolean>;
  deleteSession(sessionId: string): Promise<boolean>;
  addMessage(
    sessionId: string,
    message: Omit<AIChatMessage, "id" | "timestamp">,
  ): Promise<AIChatMessage>;
  searchSessions(userId: string, searchTerm: string): Promise<AIChatSession[]>;
}

// 2. Single Responsibility Principle & Liskov Substitution / OCP Implementation
export class IndexedDbAiChatSessionRepository implements IAiChatSessionRepository {
  private readonly STORAGE_KEY = "mindhouse_ai_chat_sessions";

  private async getAllRawSessions(): Promise<AIChatSession[]> {
    try {
      const sessions = await localforage.getItem<AIChatSession[]>(this.STORAGE_KEY);
      return sessions || [];
    } catch (error) {
      console.error("Failed to read AI chat sessions from IndexedDB:", error);
      return [];
    }
  }

  private async saveAllRawSessions(sessions: AIChatSession[]): Promise<void> {
    try {
      await localforage.setItem(this.STORAGE_KEY, sessions);
    } catch (error) {
      console.error("Failed to write AI chat sessions to IndexedDB:", error);
    }
  }

  async getSessions(userId?: string): Promise<AIChatSession[]> {
    const sessions = await this.getAllRawSessions();
    if (userId) {
      return sessions.filter((s) => s.userId === userId);
    }
    return sessions;
  }

  async getSession(sessionId: string): Promise<AIChatSession | null> {
    const sessions = await this.getAllRawSessions();
    return sessions.find((s) => s.sessionId === sessionId) || null;
  }

  async saveSession(
    session: Omit<AIChatSession, "id" | "createdAt" | "updatedAt" | "messageCount">,
  ): Promise<AIChatSession> {
    const sessions = await this.getAllRawSessions();
    const existingIndex = sessions.findIndex((s) => s.sessionId === session.sessionId);

    const timestamp = new Date().toISOString();
    const existingSession = existingIndex >= 0 ? sessions[existingIndex] : null;

    const newSession: AIChatSession = {
      ...session,
      id:
        existingSession?.id ||
        `ai_chat_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      messageCount: session.messages?.length || 0,
      createdAt: existingSession?.createdAt || timestamp,
      updatedAt: timestamp,
    };

    if (existingIndex >= 0) {
      sessions[existingIndex] = newSession;
    } else {
      sessions.push(newSession);
    }

    await this.saveAllRawSessions(sessions);
    return newSession;
  }

  async updateSession(sessionId: string, updates: Partial<AIChatSession>): Promise<boolean> {
    const sessions = await this.getAllRawSessions();
    const index = sessions.findIndex((s) => s.sessionId === sessionId);

    if (index === -1) {
      return false;
    }

    const existing = sessions[index];
    if (!existing) {
      return false;
    }

    sessions[index] = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.saveAllRawSessions(sessions);
    return true;
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const sessions = await this.getAllRawSessions();
    const filtered = sessions.filter((s) => s.sessionId !== sessionId);

    if (filtered.length === sessions.length) {
      return false;
    }

    await this.saveAllRawSessions(filtered);
    return true;
  }

  async addMessage(
    sessionId: string,
    message: Omit<AIChatMessage, "id" | "timestamp">,
  ): Promise<AIChatMessage> {
    const sessions = await this.getAllRawSessions();
    const index = sessions.findIndex((s) => s.sessionId === sessionId);

    if (index === -1) {
      throw new Error(`AI Chat session with ID ${sessionId} not found`);
    }

    const session = sessions[index];
    if (!session) {
      throw new Error(`AI Chat session with ID ${sessionId} not found`);
    }

    const timestamp = new Date().toISOString();
    const newMessage: AIChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      timestamp,
    };

    session.messages.push(newMessage);
    session.messageCount = session.messages.length;
    session.lastMessageAt = timestamp;
    session.updatedAt = timestamp;

    await this.saveAllRawSessions(sessions);
    return newMessage;
  }

  async searchSessions(userId: string, searchTerm: string): Promise<AIChatSession[]> {
    const sessions = await this.getSessions(userId);
    const term = searchTerm.toLowerCase().trim();

    if (!term) {
      return sessions;
    }

    return sessions.filter(
      (s) =>
        s.title?.toLowerCase().includes(term) ||
        s.subject.toLowerCase().includes(term) ||
        s.messages.some((m) => m.content.toLowerCase().includes(term)),
    );
  }
}

// Export a single instance to be used across the app
export const aiChatSessionRepository: IAiChatSessionRepository =
  new IndexedDbAiChatSessionRepository();
