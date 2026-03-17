import { prisma } from '../../lib/prisma.js';
import type { PortalAccountType } from '@prisma/client';

/**
 * Verifica se uma PortalAccount tem acesso a um determinado aluno.
 * Lança erro 403 caso não tenha.
 */
export async function assertStudentAccess(
  portalAccountId: string,
  accountType: PortalAccountType,
  studentId: string,
): Promise<void> {
  if (accountType === 'STUDENT') {
    const link = await prisma.studentPortalLink.findUnique({
      where: { portalAccountId },
      select: { studentId: true },
    });
    if (!link || link.studentId !== studentId) {
      throw { statusCode: 403, message: 'Acesso negado a este aluno' };
    }
  } else {
    const link = await prisma.guardianStudentLink.findUnique({
      where: {
        guardianId_studentId: { guardianId: portalAccountId, studentId },
      },
    });
    if (!link) {
      throw { statusCode: 403, message: 'Acesso negado a este aluno' };
    }
  }
}
