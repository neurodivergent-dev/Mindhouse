import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AiChatRepository } from "@/lib/database/repositories/ai-chat-repository";
import { getAuthUser, UNAUTHORIZED } from "@/lib/supabase/server";

// GET /api/ai-chat/[sessionId] - Get all messages for a specific session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(UNAUTHORIZED, { status: 401 });
    }

    const { sessionId } = await params;
    const messages = await AiChatRepository.getMessagesBySessionId(
      sessionId,
      user.id,
    );

    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/ai-chat/[sessionId] - Delete a chat session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(UNAUTHORIZED, { status: 401 });
    }

    const { sessionId } = await params;
    const success = await AiChatRepository.deleteSession(sessionId, user.id);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete session" },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "Session deleted successfully" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/ai-chat/[sessionId] - Update session title
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(UNAUTHORIZED, { status: 401 });
    }

    const { sessionId } = await params;
    const { title } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    await AiChatRepository.updateSessionTitle(sessionId, title, user.id);

    return NextResponse.json({ message: "Session title updated successfully" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
