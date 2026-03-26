import { prisma } from '../../lib/prisma.js';
import type { CreateStudentInput, UpdateStudentInput, ListStudentsQuery } from './students.schema.js';
import { Prisma } from '@prisma/client';

export class StudentsRepository {
  private guardianInclude = {
    guardians: {
      include: { guardian: true },
    },
  };

  async findAll(userId: string, params: ListStudentsQuery) {
    const { page, limit, search, active, billingType, sortBy, sortDir } = params;

    const where: Prisma.StudentWhereInput = {
      userId,
      ...(search && {
        OR: [
          { name:   { contains: search, mode: 'insensitive' } },
          { school: { contains: search, mode: 'insensitive' } },
          { grade:  { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(active      !== undefined && { active: active === 'true' }),
      ...(billingType !== undefined && { billingType }),
    };

    const [data, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortDir },
        include: { schedulePreferences: true, ...this.guardianInclude },
      }),
      prisma.student.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string, userId: string) {
    return prisma.student.findFirst({
      where: { id, userId },
      include: { schedulePreferences: true, ...this.guardianInclude },
    });
  }

  async findByIdWithHistory(id: string, userId: string) {
    return prisma.student.findFirst({
      where: { id, userId },
      include: {
        classSessions: {
          orderBy: { date: 'desc' },
          take: 50,
        },
        payments: {
          orderBy: [{ year: 'desc' }, { month: 'desc' }],
          take: 24,
        },
        schedulePreferences: true,
        evolutionEntries: {
          orderBy: { createdAt: 'desc' },
          include: {
            categories: {
              include: {
                category: true,
              },
            },
            classSession: {
              select: {
                id: true,
                date: true,
                content: true,
              },
            },
          },
        },
        ...this.guardianInclude,
      },
    });
  }

  private parseBirthDate(birthDate: string | null | undefined): Date | null | undefined {
    if (birthDate === undefined) return undefined;
    if (!birthDate) return null;
    // "yyyy-MM-dd" → noon UTC to avoid timezone boundary issues
    return new Date(`${birthDate}T12:00:00.000Z`);
  }

  async create(userId: string, data: CreateStudentInput) {
    const { schedulePreferences, guardianIds, birthDate, ...studentData } = data;

    return prisma.student.create({
      data: {
        ...studentData,
        birthDate: this.parseBirthDate(birthDate),
        userId,
        schedulePreferences: schedulePreferences && schedulePreferences.length > 0 ? {
          create: schedulePreferences
        } : undefined,
        guardians: guardianIds && guardianIds.length > 0 ? {
          create: guardianIds.map((guardianId) => ({ guardianId })),
        } : undefined,
        shareToken: {
          create: {},
        },
      },
      include: { schedulePreferences: true, ...this.guardianInclude },
    });
  }

  async update(id: string, userId: string, data: UpdateStudentInput) {
    const { schedulePreferences, guardianIds, birthDate, ...studentData } = data;

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (schedulePreferences) {
        await tx.studentSchedulePreference.deleteMany({ where: { studentId: id } });
        if (schedulePreferences.length > 0) {
          await tx.studentSchedulePreference.createMany({
            data: schedulePreferences.map((pref) => ({ ...pref, studentId: id })),
          });
        }
      }

      if (guardianIds !== undefined) {
        await tx.guardianStudent.deleteMany({ where: { studentId: id } });
        if (guardianIds.length > 0) {
          await tx.guardianStudent.createMany({
            data: guardianIds.map((guardianId) => ({ guardianId, studentId: id })),
          });
        }
      }

      return tx.student.update({
        where: { id },
        data: { ...studentData, ...(birthDate !== undefined ? { birthDate: this.parseBirthDate(birthDate) } : {}) },
        include: { schedulePreferences: true, ...this.guardianInclude },
      });
    });
  }

  async delete(id: string, userId: string) {
    return prisma.student.delete({
      where: { id },
    });
  }

  async countActive(userId: string) {
    return prisma.student.count({
      where: { userId, active: true },
    });
  }

  async getOrCreateShareToken(studentId: string) {
    return prisma.studentShareToken.upsert({
      where: { studentId },
      update: {},
      create: { studentId },
    });
  }
}
