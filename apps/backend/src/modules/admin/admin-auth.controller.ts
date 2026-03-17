import type { FastifyRequest, FastifyReply } from 'fastify';
import { AdminAuthService } from './admin-auth.service.js';
import { adminLoginSchema } from './admin-auth.schema.js';
import { getAdminId } from '../../lib/auth.js';

const service = new AdminAuthService();

export class AdminAuthController {
  async login(request: FastifyRequest, reply: FastifyReply) {
    const parsed = adminLoginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        message: 'Dados inválidos',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    try {
      const admin = await service.login(parsed.data);
      const token = await reply.jwtSign({
        adminId: admin.id,
        type: 'admin',
        adminRole: admin.adminRole,
      });
      return reply.send({ data: { token, admin } });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    try {
      const adminId = getAdminId(request);
      const admin = await service.me(adminId);
      return reply.send({ data: admin });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }
}
