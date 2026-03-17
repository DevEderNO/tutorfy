import { prisma } from '../../lib/prisma.js';
import type { PortalAccountType } from '@prisma/client';
import { assertStudentAccess } from './portal.helpers.js';

export class PortalEvolutionService {
  async listEvolution(
    portalAccountId: string,
    accountType: PortalAccountType,
    studentId: string,
    page: number,
    limit: number,
  ) {
    await assertStudentAccess(portalAccountId, accountType, studentId);

    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      prisma.evolutionEntry.findMany({
        where: { studentId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          description: true,
          createdAt: true,
          classSession: {
            select: { date: true, startTime: true, endTime: true },
          },
          categories: {
            select: {
              category: { select: { id: true, name: true, color: true } },
            },
          },
        },
      }),
      prisma.evolutionEntry.count({ where: { studentId } }),
    ]);

    return {
      data: entries,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async listClasses(
    portalAccountId: string,
    accountType: PortalAccountType,
    studentId: string,
    filter: 'upcoming' | 'history' | 'all',
    page: number,
    limit: number,
  ) {
    await assertStudentAccess(portalAccountId, accountType, studentId);

    const now = new Date();
    const skip = (page - 1) * limit;

    const statusFilter =
      filter === 'upcoming'
        ? { status: { in: ['SCHEDULED' as const] }, date: { gte: now } }
        : filter === 'history'
          ? { status: { in: ['COMPLETED' as const, 'CANCELED' as const, 'MISSED' as const] } }
          : {};

    const [classes, total] = await Promise.all([
      prisma.classSession.findMany({
        where: { studentId, ...statusFilter },
        skip,
        take: limit,
        orderBy: filter === 'upcoming' ? { date: 'asc' } : { date: 'desc' },
        select: {
          id: true,
          date: true,
          startTime: true,
          endTime: true,
          status: true,
          content: true,
          homework: true,
        },
      }),
      prisma.classSession.count({ where: { studentId, ...statusFilter } }),
    ]);

    return {
      data: classes,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
