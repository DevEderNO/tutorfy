import type { FastifyInstance } from 'fastify';
import { SkillCategoriesController } from './skill-categories.controller.js';
import { authGuard } from '../../lib/auth.js';

const controller = new SkillCategoriesController();

export async function skillCategoriesRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authGuard);

  app.get('/', controller.list.bind(controller));
  app.post('/', controller.create.bind(controller));
  app.put('/:id', controller.update.bind(controller));
  app.delete('/:id', controller.delete.bind(controller));
}
