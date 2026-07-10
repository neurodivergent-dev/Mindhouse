import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { SubjectRepository } from "@/lib/database/repositories/subject-repository";
import { initializeDatabase } from "@/lib/database/connection";
import { shouldUseDemoData } from "@/data/demo-data";
import { getAuthUser, UNAUTHORIZED } from "@/lib/supabase/server";

// Force this route to be dynamic
export const dynamic = "force-dynamic";

// Demo subjects for BTK Hackathon
const demoSubjectsData = [
  {
    id: "subj_matematik_001",
    name: "Matematik",
    description: "Temel matematik konuları: Cebir, Geometri, Analiz",
    category: "Fen Bilimleri",
    difficulty: "Orta",
    questionCount: 3,
    isActive: true,
    createdBy: "demo_user_btk_2025",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "subj_fizik_002",
    name: "Fizik",
    description: "Mekanik, Termodinamik, Elektrik ve Manyetizma",
    category: "Fen Bilimleri",
    difficulty: "Orta",
    questionCount: 3,
    isActive: true,
    createdBy: "demo_user_btk_2025",
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "subj_kimya_003",
    name: "Kimya",
    description: "Genel Kimya, Organik ve Anorganik Kimya",
    category: "Fen Bilimleri",
    difficulty: "İleri",
    questionCount: 2,
    isActive: true,
    createdBy: "demo_user_btk_2025",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "subj_tarih_004",
    name: "Tarih",
    description: "Türk Tarihi, Dünya Tarihi, Çağdaş Tarih",
    category: "Sosyal Bilimler",
    difficulty: "Başlangıç",
    questionCount: 2,
    isActive: true,
    createdBy: "demo_user_btk_2025",
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "subj_biyoloji_005",
    name: "Biyoloji",
    description: "Hücre Biyolojisi, Genetik, Ekoloji",
    category: "Fen Bilimleri",
    difficulty: "Orta",
    questionCount: 2,
    isActive: true,
    createdBy: "demo_user_btk_2025",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "subj_edebiyat_006",
    name: "Türk Dili ve Edebiyatı",
    description: "Dil Bilgisi, Klasik Edebiyat, Çağdaş Edebiyat",
    category: "Dil ve Edebiyat",
    difficulty: "Orta",
    questionCount: 2,
    isActive: true,
    createdBy: "demo_user_btk_2025",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "subj_ingilizce_007",
    name: "İngilizce",
    description: "Grammar, Vocabulary, Reading Comprehension",
    category: "Yabancı Dil",
    difficulty: "Orta",
    questionCount: 2,
    isActive: true,
    createdBy: "demo_user_btk_2025",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
];

export async function POST(request: NextRequest) {
  try {
    // Allow POST operation in demo mode
    if (shouldUseDemoData()) {
      return NextResponse.json(
        { error: "Demo modunda yeni ders eklenemez" },
        { status: 403 },
      );
    }

    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(UNAUTHORIZED, { status: 401 });
    }

    // Initialize database if not already done
    initializeDatabase();

    const body = await request.json();
    const { name, description, category, difficulty } = body;
    const createdBy = user.id;

    // Validate required fields
    if (!name || !description || !category || !difficulty) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: name, description, category, difficulty",
        },
        { status: 400 },
      );
    }

    // Validate difficulty
    if (!["Başlangıç", "Orta", "İleri"].includes(difficulty)) {
      return NextResponse.json(
        { error: "Difficulty must be one of: Başlangıç, Orta, İleri" },
        { status: 400 },
      );
    }

    // Create subject
    const subjectId = await SubjectRepository.createSubject({
      name,
      description,
      category,
      difficulty,
      createdBy,
    });

    return NextResponse.json(
      {
        message: "Subject created successfully",
        subjectId,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const isActive = searchParams.get("isActive");
    const search = searchParams.get("search");

    // Demo mode check - Check URL parameter or header on server-side
    const demoParam = searchParams.get("demo") === "true";
    const demoHeader = request.headers.get("x-demo-mode") === "true";
    const isDemoMode = demoParam || demoHeader;

    if (isDemoMode) {
      let filteredSubjects = [...demoSubjectsData];

      // Apply filters
      if (category) {
        filteredSubjects = filteredSubjects.filter(
          (s) => s.category === category,
        );
      }

      if (difficulty) {
        filteredSubjects = filteredSubjects.filter(
          (s) => s.difficulty === difficulty,
        );
      }

      if (isActive !== null) {
        const activeFilter = isActive === "true";
        filteredSubjects = filteredSubjects.filter(
          (s) => s.isActive === activeFilter,
        );
      }

      if (search) {
        const searchLower = search.toLowerCase();
        filteredSubjects = filteredSubjects.filter(
          (s) =>
            s.name.toLowerCase().includes(searchLower) ||
            s.description.toLowerCase().includes(searchLower),
        );
      }

      return NextResponse.json(filteredSubjects, { status: 200 });
    }

    // 🔍 Session control - Check if the user is logged in

    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json([], { status: 200 });
    }

    // Normal API flow - only if the user is logged in
    initializeDatabase();

    // Build filters with user isolation
    const filters: Record<string, string | boolean> = {};
    if (category) {
      filters.category = category;
    }
    if (difficulty) {
      filters.difficulty = difficulty;
    }
    if (isActive !== null) {
      filters.isActive = isActive === "true";
    }
    if (search) {
      filters.search = search;
    }

    // Add user filter for data isolation
    filters.userId = user.id;

    // Get subjects with user filtering
    const subjects = await SubjectRepository.getAllSubjects(filters);

    return NextResponse.json(subjects, { status: 200 });
  } catch {
    // If there is an error, return demo data
    if (shouldUseDemoData()) {
      return NextResponse.json(demoSubjectsData, { status: 200 });
    }

    // Return empty array instead of error for better UX
    return NextResponse.json([], { status: 200 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(UNAUTHORIZED, { status: 401 });
    }

    // Initialize database if not already done
    initializeDatabase();

    const body = await request.json();
    const { id, name, description, category, difficulty, isActive } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "Subject ID is required" },
        { status: 400 },
      );
    }

    // Validate difficulty if provided
    if (difficulty && !["Başlangıç", "Orta", "İleri"].includes(difficulty)) {
      return NextResponse.json(
        { error: "Difficulty must be one of: Başlangıç, Orta, İleri" },
        { status: 400 },
      );
    }

    // Update subject
    await SubjectRepository.updateSubject(id, {
      name,
      description,
      category,
      difficulty,
      isActive,
    });

    return NextResponse.json(
      { message: "Subject updated successfully" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to update subject" },
      { status: 500 },
    );
  }
}
