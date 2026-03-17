import { prisma } from '../../lib/prisma.js';
import type { ListUsersQuery, ChangePlanInput, ChangeStatusInput } from './admin-users.schema.js';

export class AdminUsersService {
  async list(query: ListUsersQuery) {
    const { page, limit, planSlug, isActive, search } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(isActive !== undefined ? { isActive } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(planSlug
        ? { subscription: { plan: { slug: planSlug } } }
        : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          createdAt: true,
          _count: { select: { students: true } },
          subscription: {
            select: {
              status: true,
              period: true,
              startedAt: true,
              plan: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        evolutionAiMode: true,
        lessonPlanAiMode: true,
        _count: { select: { students: true, classSessions: true, payments: true } },
        subscription: {
          select: {
            id: true,
            status: true,
            period: true,
            startedAt: true,
            expiresAt: true,
            plan: { select: { id: true, name: true, slug: true, maxStudents: true, aiEnabled: true } },
          },
        },
      },
    });

    if (!user) {
      throw { statusCode: 404, message: 'Usuário não encontrado' };
    }

    return user;
  }

  async changePlan(id: string, data: ChangePlanInput) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { subscription: true },
    });
    if (!user) {
      throw { statusCode: 404, message: 'Usuário não encontrado' };
    }

    const plan = await prisma.plan.findUnique({ where: { id: data.planId } });
    if (!plan || !plan.isActive) {
      throw { statusCode: 404, message: 'Plano não encontrado ou inativo' };
    }

    if (user.subscription) {
      return prisma.subscription.update({
        where: { userId: id },
        data: {
          planId: data.planId,
          ...(data.period ? { period: data.period } : {}),
          status: 'ACTIVE',
        },
        include: { plan: true },
      });
    }

    return prisma.subscription.create({
      data: {
        userId: id,
        planId: data.planId,
        period: data.period ?? 'MONTHLY',
        status: 'ACTIVE',
      },
      include: { plan: true },
    });
  }

  async changeStatus(id: string, data: ChangeStatusInput) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw { statusCode: 404, message: 'Usuário não encontrado' };
    }

    return prisma.user.update({
      where: { id },
      data: { isActive: data.isActive },
      select: { id: true, name: true, email: true, isActive: true },
    });
  }
}
