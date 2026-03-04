import type { FastifyInstance } from 'fastify';
import { AuthController } from './auth.controller.js';

const controller = new AuthController();

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', controller.register.bind(controller));
  app.post('/login', controller.login.bind(controller));
  app.post('/request-reset', controller.requestReset.bind(controller));
  app.post('/reset-password', controller.resetPassword.bind(controller));
}
