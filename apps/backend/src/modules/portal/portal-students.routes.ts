import type { FastifyInstance } from 'fastify';
import { PortalStudentsController } from './portal-students.controller.js';
import { PortalEvolutionController } from './portal-evolution.controller.js';
import { PortalPaymentsController } from './portal-payments.controller.js';
import { portalGuard } from '../../lib/auth.js';

const studentsController = new PortalStudentsController();
const evolutionController = new PortalEvolutionController();
const paymentsController = new PortalPaymentsController();

export async function portalStudentsRoutes(app: FastifyInstance) {
  // Listar alunos vinculados à conta
  app.get('/', { preHandler: portalGuard }, studentsController.list.bind(studentsController));

  // Detalhes de um aluno
  app.get('/:studentId', { preHandler: portalGuard }, studentsController.getById.bind(studentsController));

  // Evolução do aluno
  app.get('/:studentId/evolution', { preHandler: portalGuard }, evolutionController.listEvolution.bind(evolutionController));

  // Aulas do aluno (histórico + próximas, filtro via ?filter=upcoming|history|all)
  app.get('/:studentId/classes', { preHandler: portalGuard }, evolutionController.listClasses.bind(evolutionController));

  // Extrato financeiro (somente GUARDIAN)
  app.get('/:studentId/payments', { preHandler: portalGuard }, paymentsController.list.bind(paymentsController));
}
