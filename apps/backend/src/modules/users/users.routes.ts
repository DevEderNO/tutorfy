import type { FastifyInstance } from 'fastify';
import { UsersController } from './users.controller.js';

const controller = new UsersController();

export async function usersRoutes(app: FastifyInstance) {
  app.addHook('onRequest', async (request) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      throw { statusCode: 401, message: 'Não autorizado' };
    }
  });

  app.get('/subscription', controller.getSubscription.bind(controller));
  app.put('/profile', controller.updateProfile.bind(controller));
  app.patch('/ai-settings', controller.updateAiSettings.bind(controller));
}
