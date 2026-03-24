import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  maxStudents: number | null;
  aiEnabled: boolean;
  priceMonthly: number;
  priceAnnual: number;
}

interface Subscription {
  id: string;
  status: string;
  period: string;
  startedAt: string;
  expiresAt: string | null;
  plan: SubscriptionPlan;
}

interface SubscriptionData {
  subscription: Subscription | null;
  studentCount: number;
}

export function useSubscription() {
  return useQuery({
    queryKey: ['users', 'subscription'],
    queryFn: async () => {
      const res = await api.get<{ data: SubscriptionData }>('/users/subscription');
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCanAddStudent() {
  const { data } = useSubscription();
  if (!data) return { canAdd: true, isAtLimit: false, max: null, current: 0 };
  const max = data.subscription?.plan.maxStudents ?? null;
  const current = data.studentCount;
  const isAtLimit = max !== null && current >= max;
  return { canAdd: !isAtLimit, isAtLimit, max, current };
}

export function usePlanAiEnabled() {
  const { data } = useSubscription();
  if (!data) return true; // optimistic default
  return data.subscription?.plan.aiEnabled ?? false;
}
