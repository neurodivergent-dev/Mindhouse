import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/database/connection";
import { quizResults } from "@/lib/database/schema";
import { sql, avg, sum, count } from "drizzle-orm";
import { getAuthUser } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      // Return zeroed stats if no user is identified.
      return NextResponse.json({
        totalTests: 0,
        averageScore: 0,
        totalTimeSpent: 0,
      });
    }
    const userId = user.id;

    const db = getDb();
    const statsResult = await db
      .select({
        totalTests: count(quizResults.id),
        averageScore: avg(quizResults.score),
        totalTimeSpent: sum(quizResults.timeSpent),
      })
      .from(quizResults)
      .where(sql`${quizResults.userId} = ${userId}`);

    const stats = statsResult[0];

    // Handle the case where there are no results, avg and sum will be null
    return NextResponse.json({
      totalTests: stats?.totalTests || 0,
      averageScore: stats?.averageScore ? Math.round(Number(stats.averageScore)) : 0,
      totalTimeSpent: Number(stats?.totalTimeSpent) || 0,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch quick stats" }, { status: 500 });
  }
}
