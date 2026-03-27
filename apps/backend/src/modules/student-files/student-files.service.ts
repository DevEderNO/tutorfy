import { StudentFilesRepository } from './student-files.repository.js';
import { StudentsService } from '../students/students.service.js';
import type { CreateStudentFileInput, ListStudentFilesQuery } from './student-files.schema.js';

const repository = new StudentFilesRepository();
const studentsService = new StudentsService();

export class StudentFilesService {
  async create(userId: string, studentId: string, data: CreateStudentFileInput) {
    await studentsService.getById(studentId, userId);
    return repository.create(userId, studentId, data);
  }

  async list(userId: string, studentId: string, query: ListStudentFilesQuery) {
    await studentsService.getById(studentId, userId);
    return repository.findAll(userId, studentId, query);
  }

  async delete(id: string, userId: string) {
    const file = await repository.findOne(id, userId);
    if (!file) throw { statusCode: 404, message: 'Arquivo não encontrado' };
    return repository.delete(id);
  }
}
