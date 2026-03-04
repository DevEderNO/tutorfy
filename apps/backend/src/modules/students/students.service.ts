import { StudentsRepository } from './students.repository.js';
import type { CreateStudentInput, UpdateStudentInput } from './students.schema.js';

const repository = new StudentsRepository();

export class StudentsService {
  async list(userId: string) {
    return repository.findAll(userId);
  }

  async getById(id: string, userId: string) {
    const student = await repository.findById(id, userId);
    if (!student) {
      throw { statusCode: 404, message: 'Aluno não encontrado' };
    }
    return student;
  }

  async getWithHistory(id: string, userId: string) {
    const student = await repository.findByIdWithHistory(id, userId);
    if (!student) {
      throw { statusCode: 404, message: 'Aluno não encontrado' };
    }
    return student;
  }

  async create(userId: string, data: CreateStudentInput) {
    return repository.create(userId, data);
  }

  async update(id: string, userId: string, data: UpdateStudentInput) {
    await this.getById(id, userId);
    return repository.update(id, userId, data);
  }

  async delete(id: string, userId: string) {
    await this.getById(id, userId);
    return repository.delete(id, userId);
  }
}
