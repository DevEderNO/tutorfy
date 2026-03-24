import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface GenerateEvolutionResult {
  mode: 'AUTO' | 'REVIEW';
  evolutionEntryId?: string;
  draft?: { description: string; suggestedCategoryIds: string[] };
}

export function useGenerateStudentEvolution() {
  return useMutation({
    mutationFn: async (classSessionId: string) => {
      const res = await api.post<{ data: GenerateEvolutionResult }>(
        '/ai/student-evolution/generate',
        { classSessionId },
      );
      return res.data.data;
    },
  });
}
