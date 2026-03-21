import { ClassesRepository } from './classes.repository.js';
import type { CreateClassInput, UpdateClassInput } from './classes.schema.js';
import { PaymentsService } from '../payments/payments.service.js';
import { NotificationService } from '../../lib/notifications/notification.service.js';
import { StudentEvolutionAiService } from '../ai/services/student-evolution/student-evolution.service.js';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../env.js';

const repository = new ClassesRepository();
const paymentsService = new PaymentsService();
const notificationService = new NotificationService();
const studentEvolutionAiService = new StudentEvolutionAiService();

export class ClassesService {
  async list(userId: string, filters?: { studentId?: string; startDate?: string; endDate?: string }) {
    return repository.findAll(userId, filters);
  }

  async getById(id: string, userId: string) {
    const classSession = await repository.findById(id, userId);
    if (!classSession) {
      throw { statusCode: 404, message: 'Aula não encontrada' };
    }
    return classSession;
  }

  async create(userId: string, data: CreateClassInput) {
    const classSession = await repository.create(userId, data);

    const date = new Date(classSession.date);
    await paymentsService.syncStudentInvoice(userId, classSession.studentId, date.getMonth() + 1, date.getFullYear());

    return classSession;
  }

  async update(id: string, userId: string, data: UpdateClassInput) {
    const previous = await this.getById(id, userId);
    const classSession = await repository.update(id, data);

    const date = new Date(classSession.date);
    await paymentsService.syncStudentInvoice(userId, classSession.studentId, date.getMonth() + 1, date.getFullYear());

    // Trigger side effects when transitioning to COMPLETED
    if (data.status === 'COMPLETED' && previous.status !== 'COMPLETED') {
      await Promise.allSettled([
        this.#notifyClassCompleted(classSession),
        studentEvolutionAiService.generateFromSession(id, userId).catch(() => {}),
      ]);
    }

    return classSession;
  }

  async delete(id: string, userId: string) {
    const classSession = await this.getById(id, userId);
    const result = await repository.delete(id);

    const date = new Date(classSession.date);
    await paymentsService.syncStudentInvoice(userId, classSession.studentId, date.getMonth() + 1, date.getFullYear());

    return result;
  }

  async #notifyClassCompleted(classSession: Awaited<ReturnType<ClassesRepository['findById']>>) {
    if (!classSession) return;

    const student = await prisma.student.findUnique({
      where: { id: classSession.studentId },
      include: { shareToken: true },
    });

    if (!student || !student.shareToken) return;

    const formattedDate = new Date(classSession.date).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    });

    await notificationService.sendClassSummary({
      studentName: student.name,
      responsibleName: student.responsibleName ?? '',
      responsiblePhone: student.responsiblePhone ?? '',
      responsibleEmail: null, // TODO: add email field to Student model
      date: formattedDate,
      startTime: classSession.startTime,
      endTime: classSession.endTime,
      content: classSession.content ?? '',
      homework: classSession.homework ?? null,
      portalUrl: `${env.PUBLIC_URL}/p/${student.shareToken.token}`,
    });
  }
}
