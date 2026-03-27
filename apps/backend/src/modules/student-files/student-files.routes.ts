import type { FastifyInstance } from 'fastify';
import { StudentFilesController } from './student-files.controller.js';
import { authGuard } from '../../lib/auth.js';

const controller = new StudentFilesController();

export async function studentFilesRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authGuard);

  app.post('/:id/files',            controller.create.bind(controller));
  app.get('/:id/files',             controller.list.bind(controller));
  app.delete('/:id/files/:fileId',  controller.delete.bind(controller));
}
