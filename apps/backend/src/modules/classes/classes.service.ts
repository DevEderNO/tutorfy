import { ClassesRepository } from './classes.repository.js';
import type { CreateClassInput, UpdateClassInput } from './classes.schema.js';
import { PaymentsService } from '../payments/payments.service.js';

const repository = new ClassesRepository();
const paymentsService = new PaymentsService();

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
    
    // Sync invoice if student is HOURLY
    const date = new Date(classSession.date);
    await paymentsService.syncStudentInvoice(userId, classSession.studentId, date.getMonth() + 1, date.getFullYear());

    return classSession;
  }

  async update(id: string, userId: string, data: UpdateClassInput) {
    await this.getById(id, userId);
    const classSession = await repository.update(id, data);
    
    // Sync invoice if student is HOURLY
    const date = new Date(classSession.date);
    await paymentsService.syncStudentInvoice(userId, classSession.studentId, date.getMonth() + 1, date.getFullYear());
    
    return classSession;
  }

  async delete(id: string, userId: string) {
    const classSession = await this.getById(id, userId);
    const result = await repository.delete(id);
    
    // Sync invoice if student is HOURLY
    const date = new Date(classSession.date);
    await paymentsService.syncStudentInvoice(userId, classSession.studentId, date.getMonth() + 1, date.getFullYear());

    return result;
  }
}
