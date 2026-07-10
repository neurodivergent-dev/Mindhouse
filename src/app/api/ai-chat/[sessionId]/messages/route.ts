import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AiChatRepository } from "@/lib/database/repositories/ai-chat-repository";
import { getAuthUser, UNAUTHORIZED } from "@/lib/supabase/server";

// POST /api/ai-chat/[sessionId]/messages - Add a message to a session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(UNAUTHORIZED, { status: 401 });
    }

    const { sessionId } = await params;
    const { role, content, subject } = await request.json();

    if (!role || !content || !subject) {
      return NextResponse.json(
        {
          error: "Role, content, and subject are required",
        },
        { status: 400 },
      );
    }

    if (role !== "user" && role !== "assistant") {
      return NextResponse.json(
        {
          error: 'Role must be either "user" or "assistant"',
        },
        { status: 400 },
      );
    }

    const message = await AiChatRepository.addMessage(user.id, sessionId, subject, role, content);

    return NextResponse.json(message);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
