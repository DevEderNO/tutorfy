import { prisma } from '../../lib/prisma.js';
import type { SubscriptionStatus, SubscriptionPeriod } from '@prisma/client';

interface ListSubscriptionsQuery {
  page: number;
  limit: number;
  status?: SubscriptionStatus;
  period?: SubscriptionPeriod;
  planId?: string;
}

export class AdminFinancialService {
  async summary() {
    const activeSubscriptions = await prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      include: { plan: { select: { priceMonthly: true, priceAnnual: true } } },
    });

    let mrr = 0;
    for (const sub of activeSubscriptions) {
      if (sub.period === 'MONTHLY') {
        mrr += sub.plan.priceMonthly;
      } else {
        mrr += sub.plan.priceAnnual / 12;
      }
    }

    const arr = mrr * 12;

    const byPlan = await prisma.subscription.groupBy({
      by: ['planId'],
      where: { status: 'ACTIVE' },
      _count: { _all: true },
    });

    const plans = await prisma.plan.findMany({
      where: { id: { in: byPlan.map((b) => b.planId) } },
      select: { id: true, name: true, slug: true },
    });

    const planMap = Object.fromEntries(plans.map((p) => [p.id, p]));

    const subscribersByPlan = byPlan.map((b) => ({
      plan: planMap[b.planId],
      count: b._count._all,
    }));

    const [totalUsers, activeUsers, totalCanceled] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.subscription.count({ where: { status: 'CANCELED' } }),
    ]);

    return {
      mrr: Math.round(mrr * 100) / 100,
      arr: Math.round(arr * 100) / 100,
      subscribersByPlan,
      totalUsers,
      activeUsers,
      totalCanceled,
    };
  }

  async listSubscriptions(query: ListSubscriptionsQuery) {
    const { page, limit, status, period, planId } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(status ? { status } : {}),
      ...(period ? { period } : {}),
      ...(planId ? { planId } : {}),
    };

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startedAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, isActive: true } },
          plan: { select: { id: true, name: true, slug: true, priceMonthly: true, priceAnnual: true } },
        },
      }),
      prisma.subscription.count({ where }),
    ]);

    return {
      data: subscriptions,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
