import 'dotenv/config';
import { env } from './env.js';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'node:path';
import { authRoutes } from './modules/auth/auth.routes.js';
import { studentsRoutes } from './modules/students/students.routes.js';
import { classesRoutes } from './modules/classes/classes.routes.js';
import { paymentsRoutes } from './modules/payments/payments.routes.js';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes.js';
import { uploadRoutes } from './modules/upload/upload.routes.js';
import { usersRoutes } from './modules/users/users.routes.js';
import { evolutionRoutes } from './modules/evolution/evolution.routes.js';
import { skillCategoriesRoutes } from './modules/skill-categories/skill-categories.routes.js';
import { publicRoutes } from './modules/public/public.routes.js';

const app = Fastify({ logger: true });

// Plugins
await app.register(cors, {
  origin: env.FRONTEND_URL,
  credentials: true,
});

await app.register(jwt, {
  secret: env.JWT_SECRET,
  sign: { expiresIn: '7d' },
});

await app.register(multipart, {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  }
});

await app.register(fastifyStatic, {
  root: path.join(process.cwd(), 'uploads'),
  prefix: '/uploads/',
});

// Routes
await app.register(authRoutes, { prefix: '/auth' });
await app.register(studentsRoutes, { prefix: '/students' });
await app.register(classesRoutes, { prefix: '/classes' });
await app.register(paymentsRoutes, { prefix: '/payments' });
await app.register(dashboardRoutes, { prefix: '/dashboard' });
await app.register(uploadRoutes, { prefix: '/upload' });
await app.register(usersRoutes, { prefix: '/users' });
await app.register(evolutionRoutes, { prefix: '/evolution' });
await app.register(skillCategoriesRoutes, { prefix: '/skill-categories' });
await app.register(publicRoutes, { prefix: '/public' });

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
