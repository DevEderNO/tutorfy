import type { FastifyInstance } from 'fastify';
import { AdminUsersController } from './admin-users.controller.js';
import { adminGuard, requireSuperAdmin } from '../../lib/auth.js';

const controller = new AdminUsersController();

export async function adminUsersRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: adminGuard }, controller.list.bind(controller));
  app.get('/:id', { preHandler: adminGuard }, controller.getById.bind(controller));

  app.patch('/:id/plan', {
    preHandler: [adminGuard, requireSuperAdmin],
  }, controller.changePlan.bind(controller));

  app.patch('/:id/status', {
    preHandler: [adminGuard, requireSuperAdmin],
  }, controller.changeStatus.bind(controller));
}
