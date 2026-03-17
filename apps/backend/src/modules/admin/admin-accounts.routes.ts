import type { FastifyInstance } from 'fastify';
import { AdminAccountsController } from './admin-accounts.controller.js';
import { adminGuard, requireSuperAdmin } from '../../lib/auth.js';

const controller = new AdminAccountsController();

export async function adminAccountsRoutes(app: FastifyInstance) {
  app.get('/', {
    preHandler: [adminGuard, requireSuperAdmin],
  }, controller.list.bind(controller));

  app.post('/', {
    preHandler: [adminGuard, requireSuperAdmin],
  }, controller.create.bind(controller));

  app.patch('/:id', {
    preHandler: [adminGuard, requireSuperAdmin],
  }, controller.update.bind(controller));

  app.delete('/:id', {
    preHandler: [adminGuard, requireSuperAdmin],
  }, controller.deactivate.bind(controller));
}
