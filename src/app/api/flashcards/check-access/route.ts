import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { logError } from "@/lib/error-logger";
import { getUserScopedClient, UNAUTHORIZED } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const auth = await getUserScopedClient(request);
    if (!auth) {
      return NextResponse.json(UNAUTHORIZED, { status: 401 });
    }
    const { user, supabase } = auth;
    const userId = user.id;

    // Simple check to see if user can access flashcards table
    const { error } = await supabase
      .from("flashcards")
      .select("count")
      .eq("user_id", userId)
      .limit(1);

    if (error) {
      logError("Error checking flashcards access", error, { userId });
      return NextResponse.json(
        { error: "Failed to check access", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        hasAccess: true,
        userId,
        message: "Access verified",
      },
      { status: 200 },
    );
  } catch (error) {
    logError("Check access error", error, { url: request.url });
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
