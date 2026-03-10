import { prisma } from '../../lib/prisma.js';
import type { CreateStudentInput, UpdateStudentInput } from './students.schema.js';
import { Prisma } from '@prisma/client';

export class StudentsRepository {
  async findAll(userId: string) {
    return prisma.student.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      include: { schedulePreferences: true },
    });
  }

  async findById(id: string, userId: string) {
    return prisma.student.findFirst({
      where: { id, userId },
      include: { schedulePreferences: true },
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
      },
    });
  }

  async create(userId: string, data: CreateStudentInput) {
    const { schedulePreferences, ...studentData } = data;

    return prisma.student.create({
      data: {
        ...studentData,
        userId,
        schedulePreferences: schedulePreferences && schedulePreferences.length > 0 ? {
          create: schedulePreferences
        } : undefined
      },
      include: { schedulePreferences: true },
    });
  }

  async update(id: string, userId: string, data: UpdateStudentInput) {
    const { schedulePreferences, ...studentData } = data;

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (schedulePreferences) {
        // Delete all existing and recreate
        await tx.studentSchedulePreference.deleteMany({
          where: { studentId: id },
        });

        if (schedulePreferences.length > 0) {
          await tx.studentSchedulePreference.createMany({
            data: schedulePreferences.map((pref) => ({
              ...pref,
              studentId: id,
            })),
          });
        }
      }

      return tx.student.update({
        where: { id },
        data: studentData,
        include: { schedulePreferences: true },
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
}
