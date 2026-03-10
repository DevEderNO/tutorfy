import type { FastifyRequest, FastifyReply } from 'fastify';
import { EvolutionService } from './evolution.service.js';
import { createEvolutionEntrySchema, updateEvolutionEntrySchema } from './evolution.schema.js';
import { getUserId } from '../../lib/auth.js';

const service = new EvolutionService();

export class EvolutionController {
  async listByStudent(request: FastifyRequest<{ Params: { studentId: string } }>, reply: FastifyReply) {
    const userId = getUserId(request);
    try {
      const entries = await service.listByStudent(request.params.studentId, userId);
      return reply.send({ data: entries });
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      return reply.status(err.statusCode || 500).send({ message: err.message });
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const parsed = createEvolutionEntrySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        message: 'Dados inválidos',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const userId = getUserId(request);
    try {
      const entry = await service.create(userId, parsed.data);
      return reply.status(201).send({ data: entry });
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      return reply.status(err.statusCode || 500).send({ message: err.message });
    }
  }

  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const parsed = updateEvolutionEntrySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        message: 'Dados inválidos',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const userId = getUserId(request);
    try {
      const entry = await service.update(request.params.id, userId, parsed.data);
      return reply.send({ data: entry });
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      return reply.status(err.statusCode || 500).send({ message: err.message });
    }
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = getUserId(request);
    try {
      await service.delete(request.params.id, userId);
      return reply.status(204).send();
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      return reply.status(err.statusCode || 500).send({ message: err.message });
    }
  }
}
