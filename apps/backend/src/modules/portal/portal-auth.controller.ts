import type { FastifyRequest, FastifyReply } from 'fastify';
import { PortalAuthService } from './portal-auth.service.js';
import {
  portalLoginSchema,
  portalRegisterSchema,
  portalLinkStudentSchema,
} from './portal-auth.schema.js';
import { getPortalAccountId } from '../../lib/auth.js';

const service = new PortalAuthService();

export class PortalAuthController {
  async login(request: FastifyRequest, reply: FastifyReply) {
    const parsed = portalLoginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        message: 'Dados inválidos',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    try {
      const account = await service.login(parsed.data);
      const token = await reply.jwtSign({
        portalAccountId: account.id,
        type: 'portal',
        accountType: account.accountType,
      });
      return reply.send({ data: { token, account } });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async register(request: FastifyRequest, reply: FastifyReply) {
    const parsed = portalRegisterSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        message: 'Dados inválidos',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    try {
      const account = await service.register(parsed.data);
      const token = await reply.jwtSign({
        portalAccountId: account.id,
        type: 'portal',
        accountType: account.accountType,
      });
      return reply.status(201).send({ data: { token, account } });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async linkStudent(request: FastifyRequest, reply: FastifyReply) {
    const parsed = portalLinkStudentSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        message: 'Dados inválidos',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    try {
      const portalAccountId = getPortalAccountId(request);
      const result = await service.linkStudent(portalAccountId, parsed.data);
      return reply.status(201).send({ data: result });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    try {
      const portalAccountId = getPortalAccountId(request);
      const account = await service.me(portalAccountId);
      return reply.send({ data: account });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }
}
