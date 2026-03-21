import type { FastifyRequest, FastifyReply } from 'fastify';
import { GuardiansService } from './guardians.service.js';
import { createGuardianSchema, updateGuardianSchema, listGuardiansQuerySchema } from './guardians.schema.js';
import { getUserId } from '../../lib/auth.js';

const service = new GuardiansService();

export class GuardiansController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const parsed = listGuardiansQuerySchema.safeParse(request.query);
    if (!parsed.success) return reply.status(400).send({ message: 'Parâmetros inválidos' });
    const userId = getUserId(request);
    const result = await service.list(userId, parsed.data);
    return reply.send({ data: result });
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const userId = getUserId(request);
    try {
      const guardian = await service.getById(id, userId);
      return reply.send({ data: guardian });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const parsed = createGuardianSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ message: 'Dados inválidos', errors: parsed.error.flatten().fieldErrors });
    const userId = getUserId(request);
    const guardian = await service.create(userId, parsed.data);
    return reply.status(201).send({ data: guardian });
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const parsed = updateGuardianSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ message: 'Dados inválidos', errors: parsed.error.flatten().fieldErrors });
    const userId = getUserId(request);
    try {
      const guardian = await service.update(id, userId, parsed.data);
      return reply.send({ data: guardian });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const userId = getUserId(request);
    try {
      await service.delete(id, userId);
      return reply.status(204).send();
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }
}
