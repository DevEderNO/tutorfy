import { PaymentsRepository } from './payments.repository.js';
import { prisma } from '../../lib/prisma.js';
import type { CreatePaymentInput, GeneratePaymentsInput } from './payments.schema.js';

const repository = new PaymentsRepository();

export class PaymentsService {
  async list(userId: string, filters?: { month?: number; year?: number; studentId?: string }) {
    return repository.findAll(userId, filters);
  }

  async getById(id: string, userId: string) {
    const payment = await repository.findById(id, userId);
    if (!payment) {
      throw { statusCode: 404, message: 'Pagamento não encontrado' };
    }
    return payment;
  }

  async create(userId: string, data: CreatePaymentInput) {
    return repository.create(userId, data);
  }

  async markPaid(id: string, userId: string, paid: boolean) {
    await this.getById(id, userId);
    return repository.markPaid(id, paid);
  }

  async delete(id: string, userId: string) {
    await this.getById(id, userId);
    return repository.delete(id);
  }

  /**
   * Sync a specific student's payment up to date with their classes for a specific month/year.
   * If they are HOURLY and now have 0 hours, it deletes any existing empty invoice.
   */
  async syncStudentInvoice(userId: string, studentId: string, month: number, year: number) {
    const student = await prisma.student.findUnique({
      where: { id: studentId, userId }
    });

    if (!student) return null;

    let amount = 0;
    let classHours: number | null = null;

    if (student.billingType === 'MONTHLY') {
      amount = student.monthlyFee;
    } else if (student.billingType === 'HOURLY') {
      // Calculate total hours from completed classes in this month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const completedClasses = await prisma.classSession.findMany({
        where: {
          userId,
          studentId: student.id,
          status: 'COMPLETED',
          date: { gte: startDate, lte: endDate },
        },
      });

      // Calculate hours from startTime/endTime (format: "HH:MM")
      let totalMinutes = 0;
      for (const cls of completedClasses) {
        const [startH, startM] = cls.startTime.split(':').map(Number);
        const [endH, endM] = cls.endTime.split(':').map(Number);
        const minutes = (endH * 60 + endM) - (startH * 60 + startM);
        totalMinutes += Math.max(0, minutes);
      }

      classHours = Math.round((totalMinutes / 60) * 100) / 100; // round to 2 decimal places
      amount = classHours * (student.hourlyRate || 0);
    }

    if (amount > 0) {
      return repository.upsert(userId, {
        studentId: student.id,
        month,
        year,
        amount,
        billingType: student.billingType,
        classHours,
      });
    } else if (student.billingType === 'HOURLY') {
      // If hourly and amount dropped to 0, attempt to gracefully delete existing payment if exists and unpaid
      const existingPayment = await prisma.payment.findFirst({
         where: { studentId: student.id, month, year, userId }
      });
      if (existingPayment && !existingPayment.paid) {
         await prisma.payment.delete({ where: { id: existingPayment.id }});
      }
    }
    
    return null;
  }

  /**
   * Generate payments for all active students in a given month/year.
   */
  async generateForMonth(userId: string, data: GeneratePaymentsInput) {
    const { month, year } = data;

    // Get all active students for this user
    const students = await prisma.student.findMany({
      where: { userId, active: true },
    });

    const results = [];

    for (const student of students) {
      const payment = await this.syncStudentInvoice(userId, student.id, month, year);
      if (payment) {
        results.push(payment);
      }
    }

    return results;
  }
}

