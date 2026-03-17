import type { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PortalEvolutionService } from './portal-evolution.service.js';
import { getPortalAccountId, getPortalAccountType } from '../../lib/auth.js';

const service = new PortalEvolutionService();

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

const classesQuerySchema = paginationSchema.extend({
  filter: z.enum(['upcoming', 'history', 'all']).default('all'),
});

export class PortalEvolutionController {
  async listEvolution(request: FastifyRequest, reply: FastifyReply) {
    const { studentId } = request.params as { studentId: string };
    const parsed = paginationSchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Query inválida', errors: parsed.error.flatten().fieldErrors });
    }
    try {
      const portalAccountId = getPortalAccountId(request);
      const accountType = getPortalAccountType(request);
      const result = await service.listEvolution(
        portalAccountId, accountType, studentId, parsed.data.page, parsed.data.limit,
      );
      return reply.send(result);
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async listClasses(request: FastifyRequest, reply: FastifyReply) {
    const { studentId } = request.params as { studentId: string };
    const parsed = classesQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Query inválida', errors: parsed.error.flatten().fieldErrors });
    }
    try {
      const portalAccountId = getPortalAccountId(request);
      const accountType = getPortalAccountType(request);
      const result = await service.listClasses(
        portalAccountId, accountType, studentId,
        parsed.data.filter, parsed.data.page, parsed.data.limit,
      );
      return reply.send(result);
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }
}
