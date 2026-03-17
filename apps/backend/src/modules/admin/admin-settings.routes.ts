import type { FastifyInstance } from 'fastify';
import { AdminSettingsController } from './admin-settings.controller.js';
import { adminGuard, requireSuperAdmin } from '../../lib/auth.js';

const controller = new AdminSettingsController();

export async function adminSettingsRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: adminGuard }, controller.get.bind(controller));

  app.put('/', {
    preHandler: [adminGuard, requireSuperAdmin],
  }, controller.update.bind(controller));
}
