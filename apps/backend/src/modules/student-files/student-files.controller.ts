import type { FastifyRequest, FastifyReply } from 'fastify';
import { StudentFilesService } from './student-files.service.js';
import { createStudentFileSchema, listStudentFilesSchema } from './student-files.schema.js';
import { getUserId } from '../../lib/auth.js';

const service = new StudentFilesService();

export class StudentFilesController {
  async create(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const parsed = createStudentFileSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Dados inválidos', errors: parsed.error.flatten().fieldErrors });
    }
    const userId = getUserId(request);
    try {
      const file = await service.create(userId, request.params.id, parsed.data);
      return reply.status(201).send({ data: file });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async list(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const parsed = listStudentFilesSchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Parâmetros inválidos' });
    }
    const userId = getUserId(request);
    try {
      const files = await service.list(userId, request.params.id, parsed.data);
      return reply.send({ data: files });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async delete(request: FastifyRequest<{ Params: { id: string; fileId: string } }>, reply: FastifyReply) {
    const userId = getUserId(request);
    try {
      await service.delete(request.params.fileId, userId);
      return reply.status(204).send();
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }
}
