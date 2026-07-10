import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/database/connection";
import { quizResults } from "@/lib/database/schema";
import { desc, eq } from "drizzle-orm";
import { getAuthUser, UNAUTHORIZED } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json(UNAUTHORIZED, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "10");

  try {
    const db = getDb();
    const results = await db
      .select()
      .from(quizResults)
      .where(eq(quizResults.userId, user.id))
      .orderBy(desc(quizResults.createdAt))
      .limit(limit);

    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: "Failed to fetch quiz results" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(UNAUTHORIZED, { status: 401 });
    }

    const body = await request.json();
    const { subject, score, totalQuestions, timeSpent, weakTopics } = body;

    // Basic validation
    if (!subject || score === undefined || !totalQuestions) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = getDb();
    const newResult = await db
      .insert(quizResults)
      .values({
        userId: user.id,
        subject,
        score,
        totalQuestions,
        timeSpent,
        weakTopics: JSON.stringify(weakTopics || []),
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json(newResult[0], { status: 201 });
  } catch (error) {
    // Check for specific DB errors if needed
    if (error instanceof Error && error.message.includes("FOREIGN KEY constraint failed")) {
      return NextResponse.json(
        { error: "User does not exist. Cannot save result." },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Failed to save quiz result" }, { status: 500 });
  }
}
