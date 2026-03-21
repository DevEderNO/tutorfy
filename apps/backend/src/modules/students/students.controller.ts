import type { FastifyRequest, FastifyReply } from 'fastify';
import { StudentsService } from './students.service.js';
import { createStudentSchema, updateStudentSchema, listStudentsQuerySchema } from './students.schema.js';
import { getUserId } from '../../lib/auth.js';

const service = new StudentsService();

export class StudentsController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const parsed = listStudentsQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Parâmetros inválidos', errors: parsed.error.flatten().fieldErrors });
    }
    const userId = getUserId(request);
    const result = await service.list(userId, parsed.data);
    return reply.send({ data: result });
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = getUserId(request);
    try {
      const student = await service.getWithHistory(request.params.id, userId);
      return reply.send({ data: student });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const parsed = createStudentSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        message: 'Dados inválidos',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const userId = getUserId(request);
    const student = await service.create(userId, parsed.data);
    return reply.status(201).send({ data: student });
  }

  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const parsed = updateStudentSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        message: 'Dados inválidos',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const userId = getUserId(request);
    try {
      const student = await service.update(request.params.id, userId, parsed.data);
      return reply.send({ data: student });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = getUserId(request);
    try {
      await service.delete(request.params.id, userId);
      return reply.status(204).send();
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async getPortalLink(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = getUserId(request);
    try {
      const shareToken = await service.getShareToken(request.params.id, userId);
      return reply.send({ data: { token: shareToken.token, studentId: shareToken.studentId } });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }
}
