import type { FastifyRequest, FastifyReply } from 'fastify';
import { PaymentsService } from './payments.service.js';
import { createPaymentSchema, markPaidSchema, generatePaymentsSchema } from './payments.schema.js';
import { getUserId } from '../../lib/auth.js';

const service = new PaymentsService();

export class PaymentsController {
  async list(
    request: FastifyRequest<{
      Querystring: { month?: string; year?: string; studentId?: string };
    }>,
    reply: FastifyReply,
  ) {
    const userId = getUserId(request);
    const { month, year, studentId } = request.query;
    const filters = {
      month: month ? Number(month) : undefined,
      year: year ? Number(year) : undefined,
      studentId,
    };
    const payments = await service.list(userId, filters);
    return reply.send({ data: payments });
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = getUserId(request);
    try {
      const payment = await service.getById(request.params.id, userId);
      return reply.send({ data: payment });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const parsed = createPaymentSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        message: 'Dados inválidos',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const userId = getUserId(request);
    const payment = await service.create(userId, parsed.data);
    return reply.status(201).send({ data: payment });
  }

  async markPaid(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const parsed = markPaidSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        message: 'Dados inválidos',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const userId = getUserId(request);
    try {
      const payment = await service.markPaid(request.params.id, userId, parsed.data.paid);
      return reply.send({ data: payment });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = getUserId(request);
    try {
      await service.delete(request.params.id, userId);
      return reply.status(204).send();
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async generateForMonth(request: FastifyRequest, reply: FastifyReply) {
    const parsed = generatePaymentsSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        message: 'Dados inválidos',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const userId = getUserId(request);
    const payments = await service.generateForMonth(userId, parsed.data);

    return reply.status(201).send({
      message: 'Mensalidades geradas com sucesso',
      data: payments,
    });
  }
}
