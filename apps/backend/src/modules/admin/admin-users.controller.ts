import type { FastifyRequest, FastifyReply } from 'fastify';
import { AdminUsersService } from './admin-users.service.js';
import { listUsersQuerySchema, changePlanSchema, changeStatusSchema } from './admin-users.schema.js';

const service = new AdminUsersService();

export class AdminUsersController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const parsed = listUsersQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Query inválida', errors: parsed.error.flatten().fieldErrors });
    }
    try {
      const result = await service.list(parsed.data);
      return reply.send(result);
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    try {
      const user = await service.getById(id);
      return reply.send({ data: user });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async changePlan(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const parsed = changePlanSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Dados inválidos', errors: parsed.error.flatten().fieldErrors });
    }
    try {
      const subscription = await service.changePlan(id, parsed.data);
      return reply.send({ data: subscription });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async changeStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const parsed = changeStatusSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Dados inválidos', errors: parsed.error.flatten().fieldErrors });
    }
    try {
      const user = await service.changeStatus(id, parsed.data);
      return reply.send({ data: user });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }
}
