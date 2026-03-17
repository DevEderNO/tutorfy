import { prisma } from '../../lib/prisma.js';
import type { PortalAccountType } from '@prisma/client';
import { assertStudentAccess } from './portal.helpers.js';

export class PortalPaymentsService {
  async listPayments(
    portalAccountId: string,
    accountType: PortalAccountType,
    studentId: string,
    page: number,
    limit: number,
  ) {
    if (accountType !== 'GUARDIAN') {
      throw { statusCode: 403, message: 'Apenas responsáveis têm acesso ao financeiro' };
    }

    await assertStudentAccess(portalAccountId, accountType, studentId);

    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { studentId },
        skip,
        take: limit,
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        select: {
          id: true,
          month: true,
          year: true,
          amount: true,
          billingType: true,
          classHours: true,
          paid: true,
          paidAt: true,
          createdAt: true,
        },
      }),
      prisma.payment.count({ where: { studentId } }),
    ]);

    const totalPaid = await prisma.payment.aggregate({
      where: { studentId, paid: true },
      _sum: { amount: true },
    });

    const totalPending = await prisma.payment.aggregate({
      where: { studentId, paid: false },
      _sum: { amount: true },
    });

    return {
      data: payments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalPaid: totalPaid._sum.amount ?? 0,
        totalPending: totalPending._sum.amount ?? 0,
      },
    };
  }
}
