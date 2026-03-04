import { prisma } from '../../lib/prisma.js';
import type { CreateStudentInput, UpdateStudentInput } from './students.schema.js';

export class StudentsRepository {
  async findAll(userId: string) {
    return prisma.student.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string, userId: string) {
    return prisma.student.findFirst({
      where: { id, userId },
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
      },
    });
  }

  async create(userId: string, data: CreateStudentInput) {
    return prisma.student.create({
      data: { ...data, userId },
    });
  }

  async update(id: string, userId: string, data: UpdateStudentInput) {
    return prisma.student.update({
      where: { id },
      data,
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
