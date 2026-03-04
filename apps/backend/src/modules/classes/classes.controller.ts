import type { FastifyRequest, FastifyReply } from 'fastify';
import { ClassesService } from './classes.service.js';
import { createClassSchema, updateClassSchema } from './classes.schema.js';
import { getUserId } from '../../lib/auth.js';

const service = new ClassesService();

export class ClassesController {
  async list(
    request: FastifyRequest<{
      Querystring: { studentId?: string; startDate?: string; endDate?: string };
    }>,
    reply: FastifyReply,
  ) {
    const userId = getUserId(request);
    const { studentId, startDate, endDate } = request.query;
    const classes = await service.list(userId, { studentId, startDate, endDate });
    return reply.send({ data: classes });
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = getUserId(request);
    try {
      const classSession = await service.getById(request.params.id, userId);
      return reply.send({ data: classSession });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const parsed = createClassSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        message: 'Dados inválidos',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const userId = getUserId(request);
    const classSession = await service.create(userId, parsed.data);
    return reply.status(201).send({ data: classSession });
  }

  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const parsed = updateClassSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        message: 'Dados inválidos',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const userId = getUserId(request);
    try {
      const classSession = await service.update(request.params.id, userId, parsed.data);
      return reply.send({ data: classSession });
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
}
