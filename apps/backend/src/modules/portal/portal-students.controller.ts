import type { FastifyRequest, FastifyReply } from 'fastify';
import { PortalStudentsService } from './portal-students.service.js';
import { getPortalAccountId, getPortalAccountType } from '../../lib/auth.js';

const service = new PortalStudentsService();

export class PortalStudentsController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const portalAccountId = getPortalAccountId(request);
      const accountType = getPortalAccountType(request);
      const students = await service.list(portalAccountId, accountType);
      return reply.send({ data: students });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { studentId } = request.params as { studentId: string };
    try {
      const portalAccountId = getPortalAccountId(request);
      const accountType = getPortalAccountType(request);
      const student = await service.getById(portalAccountId, accountType, studentId);
      return reply.send({ data: student });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }
}
