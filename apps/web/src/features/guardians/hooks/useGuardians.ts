import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface GuardianStudent {
  id: string;
  name: string;
  grade: string | null;
  school: string | null;
  avatarUrl: string | null;
  active: boolean;
}

export interface Guardian {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  cpf: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  studentLinks?: { relationship: string | null; student: GuardianStudent }[];
}

export interface GuardianFormData {
  name: string;
  phone?: string;
  email?: string;
  cpf?: string;
  notes?: string;
  studentLinks?: { id: string; relationship?: string }[];
}

export interface GuardiansListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'createdAt';
  sortDir?: 'asc' | 'desc';
}

export function useGuardians(params: GuardiansListParams = {}) {
  return useQuery({
    queryKey: ['guardians', params],
    queryFn: async () => {
      const res = await api.get<{ data: { data: Guardian[]; total: number; page: number; limit: number } }>('/guardians', { params });
      return res.data.data;
    },
  });
}

export function useGuardian(id: string | undefined) {
  return useQuery({
    queryKey: ['guardians', id],
    queryFn: async () => {
      const res = await api.get<{ data: Guardian }>(`/guardians/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateGuardian() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: GuardianFormData) => {
      const res = await api.post<{ data: Guardian }>('/guardians', data);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['guardians'] }),
  });
}

export function useUpdateGuardian() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: GuardianFormData }) => {
      const res = await api.put<{ data: Guardian }>(`/guardians/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['guardians'] }),
  });
}

export function useDeleteGuardian() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/guardians/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['guardians'] }),
  });
}
