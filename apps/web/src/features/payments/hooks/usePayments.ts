import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Payment, CreatePaymentDTO, GeneratePaymentsDTO } from '@tutorfy/types';

export function usePayments(filters?: { month?: number; year?: number; studentId?: string }) {
  return useQuery({
    queryKey: ['payments', filters],
    queryFn: async (): Promise<Payment[]> => {
      const params = new URLSearchParams();
      if (filters?.month) params.set('month', String(filters.month));
      if (filters?.year) params.set('year', String(filters.year));
      if (filters?.studentId) params.set('studentId', filters.studentId);
      const res = await api.get(`/payments?${params.toString()}`);
      return res.data.data;
    },
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePaymentDTO) => {
      const res = await api.post('/payments', data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useMarkPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, paid }: { id: string; paid: boolean }) => {
      const res = await api.patch(`/payments/${id}/paid`, { paid });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useGeneratePayments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: GeneratePaymentsDTO) => {
      const res = await api.post('/payments/generate', data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
export function useDeletePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/payments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
