import { prisma } from '../../lib/prisma.js';
import type { PortalAccountType } from '@prisma/client';
import { assertStudentAccess } from './portal.helpers.js';

const studentPublicSelect = {
  id: true,
  name: true,
  avatarUrl: true,
  grade: true,
  school: true,
  currentLevel: true,
  strengths: true,
  areasToImprove: true,
  goals: true,
  active: true,
} as const;

export class PortalStudentsService {
  async list(portalAccountId: string, accountType: PortalAccountType) {
    if (accountType === 'STUDENT') {
      const link = await prisma.studentPortalLink.findUnique({
        where: { portalAccountId },
        include: { student: { select: studentPublicSelect } },
      });
      return link ? [link.student] : [];
    }

    const links = await prisma.guardianStudentLink.findMany({
      where: { guardianId: portalAccountId },
      include: { student: { select: studentPublicSelect } },
      orderBy: { createdAt: 'asc' },
    });

    return links.map((l) => l.student);
  }

  async getById(
    portalAccountId: string,
    accountType: PortalAccountType,
    studentId: string,
  ) {
    await assertStudentAccess(portalAccountId, accountType, studentId);

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        ...studentPublicSelect,
        initialObservations: true,
        responsibleName: true,
        responsiblePhone: true,
        billingType: true,
        monthlyFee: true,
        hourlyRate: true,
        createdAt: true,
        schedulePreferences: {
          select: { dayOfWeek: true, startTime: true, endTime: true },
          orderBy: { dayOfWeek: 'asc' },
        },
        files: {
          select: { id: true, type: true, title: true, url: true, classSessionId: true, createdAt: true },
          orderBy: { createdAt: 'desc' as const },
        },
      },
    });

    if (!student) {
      throw { statusCode: 404, message: 'Aluno não encontrado' };
    }

    return student;
  }
}
