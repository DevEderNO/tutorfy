import type { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service.js';
import { registerSchema, loginSchema } from './auth.schema.js';

const authService = new AuthService();

export class AuthController {
  async register(request: FastifyRequest, reply: FastifyReply) {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        message: 'Dados inválidos',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    try {
      const user = await authService.register(parsed.data);
      const token = await reply.jwtSign({ id: user.id });
      return reply.status(201).send({ data: { token, user } });
    } catch (error: any) {
      return reply
        .status(error.statusCode || 500)
        .send({ message: error.message });
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        message: 'Dados inválidos',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    try {
      const user = await authService.login(parsed.data);
      const token = await reply.jwtSign({ id: user.id });
      return reply.send({ data: { token, user } });
    } catch (error: any) {
      return reply
        .status(error.statusCode || 500)
        .send({ message: error.message });
    }
  }
}
