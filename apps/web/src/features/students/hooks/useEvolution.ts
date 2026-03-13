import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface EvolutionEntry {
  id: string;
  studentId: string;
  description: string;
  classSessionId: string | null;
  createdAt: string;
  updatedAt: string;
  categories: {
    entryId: string;
    categoryId: string;
    category: {
      id: string;
      name: string;
      color: string | null;
    };
  }[];
}

interface CreateEvolutionDTO {
  studentId: string;
  description: string;
  classSessionId?: string;
  categoryIds?: string[];
}

interface UpdateEvolutionDTO {
  description?: string;
  categoryIds?: string[];
}

export function useEvolutionEntries(studentId: string | undefined) {
  return useQuery<EvolutionEntry[]>({
    queryKey: ['evolution', studentId],
    queryFn: async () => {
      const res = await api.get(`/evolution/${studentId}`);
      return res.data.data;
    },
    enabled: !!studentId,
  });
}

export function useCreateEvolution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateEvolutionDTO) => {
      const res = await api.post('/evolution', data);
      return res.data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['evolution', variables.studentId] });
    },
  });
}

export function useUpdateEvolution(studentId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateEvolutionDTO }) => {
      const res = await api.put(`/evolution/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolution', studentId] });
    },
  });
}

export function useDeleteEvolution(studentId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/evolution/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolution', studentId] });
    },
  });
}
