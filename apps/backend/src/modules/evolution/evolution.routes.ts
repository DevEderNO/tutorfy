import type { FastifyInstance } from 'fastify';
import { EvolutionController } from './evolution.controller.js';
import { authGuard } from '../../lib/auth.js';

const controller = new EvolutionController();

export async function evolutionRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authGuard);

  app.get('/:studentId', controller.listByStudent.bind(controller));
  app.post('/', controller.create.bind(controller));
  app.put('/:id', controller.update.bind(controller));
  app.delete('/:id', controller.delete.bind(controller));
}
