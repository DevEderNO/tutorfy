import { prisma } from '../../lib/prisma.js';
import type { CreatePlanInput, UpdatePlanInput } from './plans.schema.js';

export class PlansService {
  async list() {
    return prisma.plan.findMany({
      orderBy: { priceMonthly: 'asc' },
      include: {
        _count: { select: { subscriptions: true } },
      },
    });
  }

  async create(data: CreatePlanInput) {
    const existing = await prisma.plan.findUnique({ where: { slug: data.slug } });
    if (existing) {
      throw { statusCode: 409, message: 'Já existe um plano com este slug' };
    }

    return prisma.plan.create({ data });
  }

  async update(id: string, data: UpdatePlanInput) {
    const plan = await prisma.plan.findUnique({ where: { id } });
    if (!plan) {
      throw { statusCode: 404, message: 'Plano não encontrado' };
    }

    return prisma.plan.update({ where: { id }, data });
  }

  async deactivate(id: string) {
    const plan = await prisma.plan.findUnique({ where: { id } });
    if (!plan) {
      throw { statusCode: 404, message: 'Plano não encontrado' };
    }
    if (plan.slug === 'free') {
      throw { statusCode: 400, message: 'O plano Free não pode ser desativado' };
    }

    return prisma.plan.update({ where: { id }, data: { isActive: false } });
  }
}
