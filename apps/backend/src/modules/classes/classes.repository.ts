import { prisma } from '../../lib/prisma.js';
import type { CreateClassInput, UpdateClassInput } from './classes.schema.js';

export class ClassesRepository {
  async findAll(userId: string, filters?: { studentId?: string; startDate?: string; endDate?: string }) {
    const where: any = { userId };

    if (filters?.studentId) {
      where.studentId = filters.studentId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = new Date(filters.startDate);
      if (filters.endDate) where.date.lte = new Date(filters.endDate);
    }

    return prisma.classSession.findMany({
      where,
      include: { student: { select: { id: true, name: true } } },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findById(id: string, userId: string) {
    return prisma.classSession.findFirst({
      where: { id, userId },
      include: { student: { select: { id: true, name: true } } },
    });
  }

  async create(userId: string, data: CreateClassInput) {
    return prisma.classSession.create({
      data: {
        ...data,
        userId,
        date: new Date(data.date),
      },
      include: { student: { select: { id: true, name: true } } },
    });
  }

  async update(id: string, data: UpdateClassInput) {
    const updateData: any = { ...data };
    if (data.date) updateData.date = new Date(data.date);

    return prisma.classSession.update({
      where: { id },
      data: updateData,
      include: { student: { select: { id: true, name: true } } },
    });
  }

  async delete(id: string) {
    return prisma.classSession.delete({ where: { id } });
  }

  async findWeekClasses(userId: string, startDate: Date, endDate: Date) {
    return prisma.classSession.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      include: { student: { select: { id: true, name: true } } },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findNextClass(userId: string, now: Date) {
    return prisma.classSession.findFirst({
      where: {
        userId,
        date: { gte: now },
        status: 'SCHEDULED',
      },
      include: { student: { select: { id: true, name: true } } },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }
}
