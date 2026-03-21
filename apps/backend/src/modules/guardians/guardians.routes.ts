import type { FastifyInstance } from 'fastify';
import { GuardiansController } from './guardians.controller.js';
import { authGuard } from '../../lib/auth.js';

const controller = new GuardiansController();

export async function guardiansRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authGuard);

  app.get('/', controller.list.bind(controller));
  app.get('/:id', controller.getById.bind(controller));
  app.post('/', controller.create.bind(controller));
  app.put('/:id', controller.update.bind(controller));
  app.delete('/:id', controller.delete.bind(controller));
}
