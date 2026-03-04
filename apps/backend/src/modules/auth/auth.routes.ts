import type { FastifyInstance } from 'fastify';
import { AuthController } from './auth.controller.js';

const controller = new AuthController();

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', controller.register.bind(controller));
  app.post('/login', controller.login.bind(controller));
}
