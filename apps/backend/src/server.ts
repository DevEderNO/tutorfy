import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { authRoutes } from './modules/auth/auth.routes.js';
import { studentsRoutes } from './modules/students/students.routes.js';
import { classesRoutes } from './modules/classes/classes.routes.js';
import { paymentsRoutes } from './modules/payments/payments.routes.js';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes.js';

const app = Fastify({ logger: true });

// Plugins
await app.register(cors, {
  origin: true,
  credentials: true,
});

await app.register(jwt, {
  secret: process.env.JWT_SECRET || 'fallback-secret',
  sign: { expiresIn: '7d' },
});

// Routes
await app.register(authRoutes, { prefix: '/auth' });
await app.register(studentsRoutes, { prefix: '/students' });
await app.register(classesRoutes, { prefix: '/classes' });
await app.register(paymentsRoutes, { prefix: '/payments' });
await app.register(dashboardRoutes, { prefix: '/dashboard' });

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
const port = Number(process.env.PORT) || 3333;
const host = process.env.HOST || '0.0.0.0';

try {
  await app.listen({ port, host });
  console.log(`🚀 Server running at http://${host}:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
