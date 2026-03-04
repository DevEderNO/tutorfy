import type { FastifyInstance } from 'fastify';
import { PaymentsController } from './payments.controller.js';
import { authGuard } from '../../lib/auth.js';

const controller = new PaymentsController();

export async function paymentsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authGuard);

  app.get('/', controller.list.bind(controller));
  app.get('/:id', controller.getById.bind(controller));
  app.post('/', controller.create.bind(controller));
  app.post('/generate', controller.generateForMonth.bind(controller));
  app.patch('/:id/paid', controller.markPaid.bind(controller));
  app.delete('/:id', controller.delete.bind(controller));
}
