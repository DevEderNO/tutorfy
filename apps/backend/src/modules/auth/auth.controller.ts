import type { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service.js';
import {
  registerSchema,
  loginSchema,
  requestResetSchema,
  resetPasswordSchema,
  googleLoginSchema,
} from './auth.schema.js';

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
      const token = await reply.jwtSign({ id: user.id, type: 'tutor' });
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
      const token = await reply.jwtSign({ id: user.id, type: 'tutor' });
      return reply.send({ data: { token, user } });
    } catch (error: any) {
      return reply
        .status(error.statusCode || 500)
        .send({ message: error.message });
    }
  }

  async googleLogin(request: FastifyRequest, reply: FastifyReply) {
    const parsed = googleLoginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        message: 'Dados inválidos',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    try {
      const user = await authService.googleLogin(parsed.data);
      const token = await reply.jwtSign({ id: user.id, type: 'tutor' });
      return reply.send({ data: { token, user } });
    } catch (error: any) {
      return reply
        .status(error.statusCode || 500)
        .send({ message: error.message });
    }
  }

  async requestReset(request: FastifyRequest, reply: FastifyReply) {
    const parsed = requestResetSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        message: 'Dados inválidos',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    try {
      await authService.requestPasswordReset(parsed.data);
      // Always return 200 to prevent email enumeration
      return reply.send({
        message: 'Se o email estiver cadastrado, você receberá um link de recuperação.',
      });
    } catch (error: any) {
      return reply
        .status(error.statusCode || 500)
        .send({ message: error.message });
    }
  }

  async resetPassword(request: FastifyRequest, reply: FastifyReply) {
    const parsed = resetPasswordSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        message: 'Dados inválidos',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    try {
      await authService.resetPassword(parsed.data);
      return reply.send({
        message: 'Senha redefinida com sucesso.',
      });
    } catch (error: any) {
      return reply
        .status(error.statusCode || 500)
        .send({ message: error.message });
    }
  }
}
