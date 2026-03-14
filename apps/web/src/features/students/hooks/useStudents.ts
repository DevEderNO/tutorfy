import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  Student,
  CreateStudentDTO,
  UpdateStudentDTO,
  StudentsListParams,
  PaginatedResponse,
} from '@tutorfy/types';

export function useStudents(params: StudentsListParams = {}) {
  return useQuery({
    queryKey: ['students', params],
    queryFn: async (): Promise<PaginatedResponse<Student>> => {
      const res = await api.get('/students', { params });
      return res.data.data;
    },
  });
}

const INFINITE_LIMIT = 15;

export function useStudentsInfinite(params: Omit<StudentsListParams, 'page' | 'limit'> = {}) {
  return useInfiniteQuery({
    queryKey: ['students', 'infinite', params],
    queryFn: async ({ pageParam = 1 }): Promise<PaginatedResponse<Student>> => {
      const res = await api.get('/students', {
        params: { ...params, page: pageParam, limit: INFINITE_LIMIT },
      });
      return res.data.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / INFINITE_LIMIT);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
  });
}

export function useStudent(id: string | undefined) {
  return useQuery({
    queryKey: ['students', id],
    queryFn: async () => {
      const res = await api.get(`/students/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateStudentDTO) => {
      const res = await api.post('/students', data);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] }),
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateStudentDTO }) => {
      const res = await api.put(`/students/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] }),
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/students/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] }),
  });
}
