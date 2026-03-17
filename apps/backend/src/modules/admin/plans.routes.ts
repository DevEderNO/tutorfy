import type { FastifyInstance } from 'fastify';
import { PlansController } from './plans.controller.js';
import { adminGuard, requireSuperAdmin } from '../../lib/auth.js';

const controller = new PlansController();

export async function adminPlansRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: adminGuard }, controller.list.bind(controller));

  app.post('/', {
    preHandler: [adminGuard, requireSuperAdmin],
  }, controller.create.bind(controller));

  app.put('/:id', {
    preHandler: [adminGuard, requireSuperAdmin],
  }, controller.update.bind(controller));

  app.delete('/:id', {
    preHandler: [adminGuard, requireSuperAdmin],
  }, controller.deactivate.bind(controller));
}
