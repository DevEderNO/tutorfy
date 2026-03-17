import type { FastifyRequest, FastifyReply } from 'fastify';
import { AdminFinancialService } from './admin-financial.service.js';
import { z } from 'zod';

const service = new AdminFinancialService();

const listSubscriptionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['ACTIVE', 'CANCELED', 'PAST_DUE', 'TRIALING']).optional(),
  period: z.enum(['MONTHLY', 'ANNUAL']).optional(),
  planId: z.string().optional(),
});

export class AdminFinancialController {
  async summary(_request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = await service.summary();
      return reply.send({ data });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async listSubscriptions(request: FastifyRequest, reply: FastifyReply) {
    const parsed = listSubscriptionsQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Query inválida', errors: parsed.error.flatten().fieldErrors });
    }
    try {
      const result = await service.listSubscriptions(parsed.data);
      return reply.send(result);
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }
}
