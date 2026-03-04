import type { FastifyInstance } from 'fastify';
import { DashboardController } from './dashboard.controller.js';
import { authGuard } from '../../lib/auth.js';

const controller = new DashboardController();

export async function dashboardRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authGuard);

  app.get('/', controller.getData.bind(controller));
}
