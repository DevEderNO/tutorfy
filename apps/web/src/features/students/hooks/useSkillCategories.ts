import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface SkillCategory {
  id: string;
  name: string;
  color: string | null;
  userId: string;
  createdAt: string;
}

interface CreateSkillCategoryDTO {
  name: string;
  color?: string;
}

interface UpdateSkillCategoryDTO {
  name?: string;
  color?: string;
}

export function useSkillCategories() {
  return useQuery<SkillCategory[]>({
    queryKey: ['skill-categories'],
    queryFn: async () => {
      const res = await api.get('/skill-categories');
      return res.data.data;
    },
  });
}

export function useCreateSkillCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateSkillCategoryDTO) => {
      const res = await api.post('/skill-categories', data);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skill-categories'] }),
  });
}

export function useUpdateSkillCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSkillCategoryDTO }) => {
      const res = await api.put(`/skill-categories/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skill-categories'] }),
  });
}

export function useDeleteSkillCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/skill-categories/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skill-categories'] }),
  });
}
