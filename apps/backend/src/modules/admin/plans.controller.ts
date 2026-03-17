import type { FastifyRequest, FastifyReply } from 'fastify';
import { PlansService } from './plans.service.js';
import { createPlanSchema, updatePlanSchema } from './plans.schema.js';

const service = new PlansService();

export class PlansController {
  async list(_request: FastifyRequest, reply: FastifyReply) {
    try {
      const plans = await service.list();
      return reply.send({ data: plans });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const parsed = createPlanSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Dados inválidos', errors: parsed.error.flatten().fieldErrors });
    }
    try {
      const plan = await service.create(parsed.data);
      return reply.status(201).send({ data: plan });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const parsed = updatePlanSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Dados inválidos', errors: parsed.error.flatten().fieldErrors });
    }
    try {
      const plan = await service.update(id, parsed.data);
      return reply.send({ data: plan });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async deactivate(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    try {
      const plan = await service.deactivate(id);
      return reply.send({ data: plan });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }
}
