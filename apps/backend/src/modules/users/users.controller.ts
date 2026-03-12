import type { FastifyRequest, FastifyReply } from 'fastify';
import { UsersService } from './users.service.js';
import { updateProfileSchema, updateAiSettingsSchema } from './users.schema.js';
import { getUserId } from '../../lib/auth.js';

const usersService = new UsersService();

export class UsersController {
  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    const parsed = updateProfileSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        message: 'Dados inválidos',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    try {
      const userId = getUserId(request);
      const user = await usersService.updateProfile(userId, parsed.data);
      return reply.send({ data: user });
    } catch (error: any) {
      return reply
        .status(error.statusCode || 500)
        .send({ message: error.message });
    }
  }

  async updateAiSettings(request: FastifyRequest, reply: FastifyReply) {
    const parsed = updateAiSettingsSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        message: 'Dados inválidos',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    try {
      const userId = getUserId(request);
      const result = await usersService.updateAiSettings(userId, parsed.data);
      return reply.send({ data: result });
    } catch (error: any) {
      return reply
        .status(error.statusCode || 500)
        .send({ message: error.message });
    }
  }
}
