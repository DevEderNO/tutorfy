import type { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PortalPaymentsService } from './portal-payments.service.js';
import { getPortalAccountId, getPortalAccountType } from '../../lib/auth.js';

const service = new PortalPaymentsService();

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export class PortalPaymentsController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const { studentId } = request.params as { studentId: string };
    const parsed = paginationSchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Query inválida', errors: parsed.error.flatten().fieldErrors });
    }
    try {
      const portalAccountId = getPortalAccountId(request);
      const accountType = getPortalAccountType(request);
      const result = await service.listPayments(
        portalAccountId, accountType, studentId, parsed.data.page, parsed.data.limit,
      );
      return reply.send(result);
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }
}
