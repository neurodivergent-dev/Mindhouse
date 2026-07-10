import { toast } from "@/hooks/use-toast";
import { SubjectService } from "@/services/supabase-service";
import { supabase } from "@/lib/supabase";
import { UnifiedStorageService } from "@/services/unified-storage-service";
import type { AIGeneratedSubject } from "@/types/subject";

interface SubjectToastMessages {
  successTitle: string;
  successDescription: string;
  errorTitle: string;
  errorDescription: string;
}

export const handleAIGeneratedSubjects = async (
  aiSubjects: AIGeneratedSubject[],
  messages?: SubjectToastMessages,
) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    for (const aiSubject of aiSubjects) {
      const subjectData = {
        name: aiSubject.name,
        description: aiSubject.description,
        category: aiSubject.category,
        difficulty: aiSubject.difficulty,
        questionCount: 0,
        isActive: true,
      };

      if (session) {
        // Logged-in user: save to Supabase
        await SubjectService.createSubject({
          name: subjectData.name,
          description: subjectData.description,
          category: subjectData.category,
          difficulty: subjectData.difficulty,
          question_count: 0,
          is_active: true,
        });
      } else {
        // Guest / no session: save to IndexedDB via UnifiedStorageService
        UnifiedStorageService.addSubject(subjectData);
      }
    }

    toast({
      title: messages?.successTitle ?? "Başarılı!",
      description: messages?.successDescription ?? `${aiSubjects.length} ders başarıyla eklendi`,
    });

    return true;
  } catch {
    toast({
      title: messages?.errorTitle ?? "Hata!",
      description: messages?.errorDescription ?? "Dersler eklenirken bir hata oluştu",
      variant: "destructive",
    });
    return false;
  }
};
