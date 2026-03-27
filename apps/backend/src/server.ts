import 'dotenv/config';
import { env } from './env.js';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { authRoutes } from './modules/auth/auth.routes.js';
import { studentsRoutes } from './modules/students/students.routes.js';
import { classesRoutes } from './modules/classes/classes.routes.js';
import { paymentsRoutes } from './modules/payments/payments.routes.js';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes.js';
import { usersRoutes } from './modules/users/users.routes.js';
import { evolutionRoutes } from './modules/evolution/evolution.routes.js';
import { skillCategoriesRoutes } from './modules/skill-categories/skill-categories.routes.js';
import { publicRoutes } from './modules/public/public.routes.js';
import { aiRoutes } from './modules/ai/ai.routes.js';
import { adminAuthRoutes } from './modules/admin/admin-auth.routes.js';
import { adminPlansRoutes } from './modules/admin/plans.routes.js';
import { adminUsersRoutes } from './modules/admin/admin-users.routes.js';
import { adminAccountsRoutes } from './modules/admin/admin-accounts.routes.js';
import { adminFinancialRoutes } from './modules/admin/admin-financial.routes.js';
import { adminSettingsRoutes } from './modules/admin/admin-settings.routes.js';
import { guardiansRoutes } from './modules/guardians/guardians.routes.js';
import { studentFilesRoutes } from './modules/student-files/student-files.routes.js';
import { portalAuthRoutes } from './modules/portal/portal-auth.routes.js';
import { portalStudentsRoutes } from './modules/portal/portal-students.routes.js';

const app = Fastify({ logger: true });

// Plugins
await app.register(cors, {
  origin: [env.FRONTEND_URL, env.ADMIN_URL, env.PORTAL_URL],
  credentials: true,
});

await app.register(jwt, {
  secret: env.JWT_SECRET,
  sign: { expiresIn: '7d' },
});

// Routes
await app.register(authRoutes, { prefix: '/auth' });
await app.register(studentsRoutes, { prefix: '/students' });
await app.register(classesRoutes, { prefix: '/classes' });
await app.register(paymentsRoutes, { prefix: '/payments' });
await app.register(dashboardRoutes, { prefix: '/dashboard' });
await app.register(usersRoutes, { prefix: '/users' });
await app.register(evolutionRoutes, { prefix: '/evolution' });
await app.register(skillCategoriesRoutes, { prefix: '/skill-categories' });
await app.register(publicRoutes, { prefix: '/public' });
await app.register(aiRoutes, { prefix: '/ai' });
await app.register(adminAuthRoutes, { prefix: '/admin/auth' });
await app.register(adminPlansRoutes, { prefix: '/admin/plans' });
await app.register(adminUsersRoutes, { prefix: '/admin/users' });
await app.register(adminAccountsRoutes, { prefix: '/admin/admins' });
await app.register(adminFinancialRoutes, { prefix: '/admin/financial' });
await app.register(adminSettingsRoutes, { prefix: '/admin/settings' });
await app.register(guardiansRoutes, { prefix: '/guardians' });
await app.register(studentFilesRoutes, { prefix: '/students' });
await app.register(portalAuthRoutes, { prefix: '/portal/auth' });
await app.register(portalStudentsRoutes, { prefix: '/portal/students' });

// Health check
app.get('/health', async () => ({ status: 'ok' }));

// Global error handler
app.setErrorHandler((error, request, reply) => {
  app.log.error(error);

  const err = error as { validation?: unknown[]; statusCode?: number; message?: string };

  if (err.validation) {
    reply.status(400).send({
      message: 'Validation error',
      errors: err.validation,
    });
    return;
  }

  reply.status(err.statusCode || 500).send({
    message: err.message || 'Internal server error',
  });
});

// Start
const port = env.PORT;
const host = env.HOST;

try {
  await app.listen({ port, host });
  console.log(`🚀 Server running at http://${host}:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
