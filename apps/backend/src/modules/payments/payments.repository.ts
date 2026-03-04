import { prisma } from '../../lib/prisma.js';
import type { CreatePaymentInput } from './payments.schema.js';

export class PaymentsRepository {
  async findAll(userId: string, filters?: { month?: number; year?: number; studentId?: string }) {
    const where: any = { userId };

    if (filters?.month) where.month = filters.month;
    if (filters?.year) where.year = filters.year;
    if (filters?.studentId) where.studentId = filters.studentId;

    return prisma.payment.findMany({
      where,
      include: { student: { select: { id: true, name: true, monthlyFee: true, billingType: true, hourlyRate: true } } },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async findById(id: string, userId: string) {
    return prisma.payment.findFirst({
      where: { id, userId },
      include: { student: { select: { id: true, name: true } } },
    });
  }

  async findByStudentMonthYear(studentId: string, month: number, year: number) {
    return prisma.payment.findUnique({
      where: { studentId_month_year: { studentId, month, year } },
    });
  }

  async create(userId: string, data: CreatePaymentInput) {
    return prisma.payment.create({
      data: {
        userId,
        studentId: data.studentId,
        month: data.month,
        year: data.year,
        amount: data.amount,
        billingType: data.billingType || 'MONTHLY',
        classHours: data.classHours ?? null,
      },
      include: { student: { select: { id: true, name: true } } },
    });
  }

  async upsert(userId: string, data: CreatePaymentInput) {
    return prisma.payment.upsert({
      where: {
        studentId_month_year: {
          studentId: data.studentId,
          month: data.month,
          year: data.year,
        },
      },
      create: {
        userId,
        studentId: data.studentId,
        month: data.month,
        year: data.year,
        amount: data.amount,
        billingType: data.billingType || 'MONTHLY',
        classHours: data.classHours ?? null,
      },
      update: {
        amount: data.amount,
        billingType: data.billingType || 'MONTHLY',
        classHours: data.classHours ?? null,
      },
      include: { student: { select: { id: true, name: true } } },
    });
  }

  async markPaid(id: string, paid: boolean) {
    return prisma.payment.update({
      where: { id },
      data: {
        paid,
        paidAt: paid ? new Date() : null,
      },
      include: { student: { select: { id: true, name: true } } },
    });
  }

  async delete(id: string) {
    return prisma.payment.delete({ where: { id } });
  }

  async countPending(userId: string, month: number, year: number) {
    return prisma.payment.count({
      where: { userId, month, year, paid: false },
    });
  }
}
