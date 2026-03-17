import type { FastifyRequest, FastifyReply } from 'fastify';
import { AdminAccountsService } from './admin-accounts.service.js';
import { createAdminSchema, updateAdminSchema } from './admin-accounts.schema.js';
import { getAdminId } from '../../lib/auth.js';

const service = new AdminAccountsService();

export class AdminAccountsController {
  async list(_request: FastifyRequest, reply: FastifyReply) {
    try {
      const admins = await service.list();
      return reply.send({ data: admins });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const parsed = createAdminSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Dados inválidos', errors: parsed.error.flatten().fieldErrors });
    }
    try {
      const admin = await service.create(parsed.data);
      return reply.status(201).send({ data: admin });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const requestingAdminId = getAdminId(request);
    const parsed = updateAdminSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Dados inválidos', errors: parsed.error.flatten().fieldErrors });
    }
    try {
      const admin = await service.update(id, parsed.data, requestingAdminId);
      return reply.send({ data: admin });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async deactivate(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const requestingAdminId = getAdminId(request);
    try {
      const admin = await service.deactivate(id, requestingAdminId);
      return reply.send({ data: admin });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }
}
