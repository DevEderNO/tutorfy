import { prisma } from '../../lib/prisma.js';
import type { CreateStudentFileInput, ListStudentFilesQuery } from './student-files.schema.js';

export class StudentFilesRepository {
  async create(userId: string, studentId: string, data: CreateStudentFileInput) {
    return prisma.studentFile.create({
      data: { userId, studentId, ...data },
    });
  }

  async findAll(userId: string, studentId: string, query: ListStudentFilesQuery) {
    return prisma.studentFile.findMany({
      where: {
        userId,
        studentId,
        ...(query.classSessionId !== undefined ? { classSessionId: query.classSessionId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    return prisma.studentFile.findFirst({ where: { id, userId } });
  }

  async delete(id: string) {
    return prisma.studentFile.delete({ where: { id } });
  }
}
