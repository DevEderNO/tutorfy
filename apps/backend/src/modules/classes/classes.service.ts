import { ClassesRepository } from './classes.repository.js';
import type { CreateClassInput, UpdateClassInput } from './classes.schema.js';

const repository = new ClassesRepository();

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
    return repository.create(userId, data);
  }

  async update(id: string, userId: string, data: UpdateClassInput) {
    await this.getById(id, userId);
    return repository.update(id, data);
  }

  async delete(id: string, userId: string) {
    await this.getById(id, userId);
    return repository.delete(id);
  }
}
