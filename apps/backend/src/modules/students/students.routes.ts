import type { FastifyInstance } from 'fastify';
import { StudentsController } from './students.controller.js';
import { authGuard } from '../../lib/auth.js';

const controller = new StudentsController();

export async function studentsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authGuard);

  app.get('/', controller.list.bind(controller));
  app.get('/:id', controller.getById.bind(controller));
  app.get('/:id/portal-link', controller.getPortalLink.bind(controller));
  app.post('/', controller.create.bind(controller));
  app.put('/:id', controller.update.bind(controller));
  app.delete('/:id', controller.delete.bind(controller));
}
