import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { LessonPlanResult } from '@tutorfy/types';

export function useGenerateLessonPlan() {
  return useMutation({
    mutationFn: async (studentId: string) => {
      const res = await api.post<{ data: LessonPlanResult }>('/ai/lesson-plan/generate', { studentId });
      return res.data.data;
    },
  });
}
