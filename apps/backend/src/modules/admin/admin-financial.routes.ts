import type { FastifyInstance } from 'fastify';
import { AdminFinancialController } from './admin-financial.controller.js';
import { adminGuard, requireSuperAdmin } from '../../lib/auth.js';

const controller = new AdminFinancialController();

export async function adminFinancialRoutes(app: FastifyInstance) {
  app.get('/summary', {
    preHandler: [adminGuard, requireSuperAdmin],
  }, controller.summary.bind(controller));

  app.get('/subscriptions', {
    preHandler: [adminGuard, requireSuperAdmin],
  }, controller.listSubscriptions.bind(controller));
}
