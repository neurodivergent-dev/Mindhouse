import { supabase } from "@/lib/supabase";
import type { Tables, InsertTables, UpdateTables } from "@/lib/supabase";

// Types
export type User = Tables<"users">;
export type Subject = Tables<"subjects">;
export type Question = Tables<"questions">;
export type QuizResult = Tables<"quiz_results">;
export type PerformanceAnalytics = Tables<"performance_analytics">;
export type AIRecommendation = Tables<"ai_recommendations">;
export type FlashcardProgress = Tables<"flashcard_progress">;

// User Service
export class UserService {
  static async getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  }

  static async createUser(email: string, name: string): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .insert({
        email,
        name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("🔴 User creation error:", error);
      return null;
    }

    return data;
  }

  static async getUserById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) {
        console.error("🔴 Get user error:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("🔴 Get user exception:", error);
      return null;
    }
  }
}

// Subject Service
export class SubjectService {
  static async getSubjects(): Promise<Subject[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .eq("is_active", true)
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("🔴 Get subjects error:", error);
      return [];
    }

    return data || [];
  }

  static async createSubject(
    subject: InsertTables<"subjects">,
  ): Promise<Subject | null> {
    // Get current user for created_by field
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from("subjects")
      .insert({
        ...subject,
        created_by: user.id, // Set current user as creator
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("🔴 Subject creation error:", error);
      return null;
    }

    return data;
  }

  static async updateSubject(
    id: string,
    updates: UpdateTables<"subjects">,
  ): Promise<Subject | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("🔴 No authenticated user for subject update");
      return null;
    }

    const { data, error } = await supabase
      .from("subjects")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("created_by", user.id)
      .select()
      .single();

    if (error) {
      console.error("🔴 Subject update error:", error);
      return null;
    }

    return data;
  }

  static async deleteSubject(id: string): Promise<boolean> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("🔴 No authenticated user for subject deletion");
      return false;
    }

    const { error } = await supabase
      .from("subjects")
      .delete()
      .eq("id", id)
      .eq("created_by", user.id);

    if (error) {
      console.error("🔴 Subject deletion error:", error);
      return false;
    }

    return true;
  }

  static async toggleActive(
    id: string,
    isActive: boolean,
  ): Promise<Subject | null> {
    return this.updateSubject(id, { is_active: isActive });
  }
}

// Question Service - FIXED VERSION
export class QuestionService {
  static async getQuestions(): Promise<Question[]> {
    // Get current user for filtering
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("is_active", true)
      .eq("created_by", user.id) // User isolation
      .order("created_at", { ascending: false });

    if (error) {
      return [];
    }

    return data || [];
  }

  static async getQuestionsBySubject(subject: string): Promise<Question[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("subject", subject)
      .eq("is_active", true)
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("🔴 Get questions error:", error);
      return [];
    }

    return data || [];
  }

  static async createQuestion(
    question: InsertTables<"questions">,
  ): Promise<Question | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("🔴 No authenticated user for question creation");
      return null;
    }

    const { data, error } = await supabase
      .from("questions")
      .insert({
        ...question,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("🔴 Question creation error:", error);
      return null;
    }

    return data;
  }

  // 🚀 FIXED UPDATE METHOD
  static async updateQuestion(
    id: string,
    updates: UpdateTables<"questions">,
  ): Promise<Question | null> {
    try {
      console.log("🔍 QuestionService.updateQuestion started");
      
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error("🔴 No authenticated user found");
        return null;
      }

      console.log("🔍 Updating question:", { id, user: user.id });

      // 🎯 FIX: Remove created_by from updates to avoid RLS conflicts
      const { created_by, ...cleanUpdates } = updates as any;
      
      const { data, error } = await supabase
        .from("questions")
        .update({
          ...cleanUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("created_by", user.id) // Only update questions owned by current user
        .select()
        .single();

      if (error) {
        console.error("🔴 Update error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        return null;
      }

      if (!data) {
        console.error("🔴 No data returned from update - question not found or not owned by user");
        return null;
      }

      console.log("✅ Question updated successfully:", data);
      return data;
    } catch (error) {
      console.error("🔴 QuestionService.updateQuestion exception:", error);
      return null;
    }
  }

  // 🚀 FIXED DELETE METHOD
  static async deleteQuestion(id: string): Promise<boolean> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("🔴 No authenticated user for question deletion");
      return false;
    }

    // 🎯 FIX: Direct delete without pre-update
    const { error } = await supabase
      .from("questions")
      .delete()
      .eq("id", id)
      .eq("created_by", user.id); // Only delete questions owned by current user

    if (error) {
      console.error("🔴 Delete error:", error);
      return false;
    }

    console.log("✅ Question deleted successfully");
    return true;
  }
}

// Quiz Result Service
export class QuizResultService {
  static async saveQuizResult(
    result: InsertTables<"quiz_results">,
  ): Promise<QuizResult | null> {
    const { data, error } = await supabase
      .from("quiz_results")
      .insert({
        ...result,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("🔴 Quiz result save error:", error);
      return null;
    }

    return data;
  }

  static async getQuizResultsByUser(userId: string): Promise<QuizResult[]> {
    const { data, error } = await supabase
      .from("quiz_results")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("🔴 Get quiz results error:", error);
      return [];
    }

    return data || [];
  }

  static async getQuizResultsBySubject(subject: string): Promise<QuizResult[]> {
    const { data, error } = await supabase
      .from("quiz_results")
      .select("*")
      .eq("subject", subject)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("🔴 Get quiz results by subject error:", error);
      return [];
    }

    return data || [];
  }
}

// Performance Analytics Service
export class PerformanceAnalyticsService {
  static async saveAnalytics(
    analytics: InsertTables<"performance_analytics">,
  ): Promise<PerformanceAnalytics | null> {
    const { data, error } = await supabase
      .from("performance_analytics")
      .upsert({
        ...analytics,
        last_updated: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("🔴 Analytics save error:", error);
      return null;
    }

    return data;
  }

  static async getAnalyticsByUser(
    userId: string,
  ): Promise<PerformanceAnalytics[]> {
    const { data, error } = await supabase
      .from("performance_analytics")
      .select("*")
      .eq("user_id", userId)
      .order("last_updated", { ascending: false });

    if (error) {
      console.error("🔴 Get analytics error:", error);
      return [];
    }

    return data || [];
  }
}

// AI Recommendation Service
export class AIRecommendationService {
  static async saveRecommendation(
    recommendation: InsertTables<"ai_recommendations">,
  ): Promise<AIRecommendation | null> {
    const { data, error } = await supabase
      .from("ai_recommendations")
      .insert({
        ...recommendation,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("🔴 Recommendation save error:", error);
      return null;
    }

    return data;
  }

  static async getRecommendationsByUser(
    userId: string,
  ): Promise<AIRecommendation[]> {
    const { data, error } = await supabase
      .from("ai_recommendations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("🔴 Get recommendations error:", error);
      return [];
    }

    return data || [];
  }
}

// Flashcard Progress Service
export class FlashcardProgressService {
  static async saveProgress(
    progress: InsertTables<"flashcard_progress">,
  ): Promise<FlashcardProgress | null> {
    const { data, error } = await supabase
      .from("flashcard_progress")
      .upsert({
        ...progress,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("🔴 Progress save error:", error);
      return null;
    }

    return data;
  }

  static async getProgressByUser(userId: string): Promise<FlashcardProgress[]> {
    const { data, error } = await supabase
      .from("flashcard_progress")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("🔴 Get progress error:", error);
      return [];
    }

    return data || [];
  }

  static async getProgressBySubject(
    userId: string,
    subject: string,
  ): Promise<FlashcardProgress[]> {
    const { data, error } = await supabase
      .from("flashcard_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("subject", subject)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("🔴 Get progress by subject error:", error);
      return [];
    }

    return data || [];
  }
}
