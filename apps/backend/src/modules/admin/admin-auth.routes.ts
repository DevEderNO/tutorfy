import type { FastifyInstance } from 'fastify';
import { AdminAuthController } from './admin-auth.controller.js';
import { adminGuard } from '../../lib/auth.js';

const controller = new AdminAuthController();

export async function adminAuthRoutes(app: FastifyInstance) {
  app.post('/login', controller.login.bind(controller));
  app.get('/me', { preHandler: adminGuard }, controller.me.bind(controller));
}
