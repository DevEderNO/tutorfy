import type { FastifyInstance } from 'fastify';
import { PortalAuthController } from './portal-auth.controller.js';
import { portalGuard } from '../../lib/auth.js';

const controller = new PortalAuthController();

export async function portalAuthRoutes(app: FastifyInstance) {
  app.post('/login', controller.login.bind(controller));
  app.post('/register', controller.register.bind(controller));
  app.post('/token-login', controller.loginWithToken.bind(controller));
  app.post('/link-student', { preHandler: portalGuard }, controller.linkStudent.bind(controller));
  app.get('/me', { preHandler: portalGuard }, controller.me.bind(controller));
}
