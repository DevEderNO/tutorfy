import type { FastifyRequest, FastifyReply } from 'fastify';
import { DashboardService } from './dashboard.service.js';
import { getUserId } from '../../lib/auth.js';

const service = new DashboardService();

export class DashboardController {
  async getData(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUserId(request);
    const data = await service.getData(userId);
    return reply.send({ data });
  }
}
