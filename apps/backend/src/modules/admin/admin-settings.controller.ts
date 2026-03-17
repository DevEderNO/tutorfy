import type { FastifyRequest, FastifyReply } from 'fastify';
import { AdminSettingsService } from './admin-settings.service.js';
import { updateSettingsSchema } from './admin-settings.schema.js';

const service = new AdminSettingsService();

export class AdminSettingsController {
  async get(_request: FastifyRequest, reply: FastifyReply) {
    try {
      const settings = await service.get();
      return reply.send({ data: settings });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const parsed = updateSettingsSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Dados inválidos', errors: parsed.error.flatten().fieldErrors });
    }
    try {
      const settings = await service.update(parsed.data.config);
      return reply.send({ data: settings });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }
}
