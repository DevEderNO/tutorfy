import { EvolutionRepository } from './evolution.repository.js';
import { StudentsService } from '../students/students.service.js';
import type { CreateEvolutionEntryInput, UpdateEvolutionEntryInput } from './evolution.schema.js';

const repository = new EvolutionRepository();
const studentsService = new StudentsService();

export class EvolutionService {
  async listByStudent(studentId: string, userId: string) {
    // Verifica ownership do aluno
    await studentsService.getById(studentId, userId);
    return repository.findByStudentId(studentId);
  }

  async getById(id: string, userId: string) {
    const entry = await repository.findById(id);
    if (!entry) {
      throw { statusCode: 404, message: 'Registro de evolução não encontrado' };
    }

    // Verifica ownership via student
    if (entry.student.userId !== userId) {
      throw { statusCode: 404, message: 'Registro de evolução não encontrado' };
    }

    return entry;
  }

  async create(userId: string, data: CreateEvolutionEntryInput) {
    // Verifica ownership do aluno
    await studentsService.getById(data.studentId, userId);
    return repository.create(data);
  }

  async update(id: string, userId: string, data: UpdateEvolutionEntryInput) {
    await this.getById(id, userId);
    return repository.update(id, data);
  }

  async delete(id: string, userId: string) {
    await this.getById(id, userId);
    return repository.delete(id);
  }
}
