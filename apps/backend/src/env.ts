import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(10),
  PORT: z.coerce.number().default(3333),
  HOST: z.string().default('0.0.0.0'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  PUBLIC_URL: z.string().url().default('http://localhost:3000'),
  ADMIN_URL: z.string().url().default('http://localhost:3001'),
  PORTAL_URL: z.string().url().default('http://localhost:3002'),
  OPENAI_API_KEY: z.string().min(1).optional(),
  ADMIN_SEED_EMAIL: z.string().email().default('admin@tutorfy.com'),
  ADMIN_SEED_PASSWORD: z.string().min(8).default('admin123456'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables', _env.error.format());
  throw new Error('Invalid environment variables.');
}

export const env = _env.data;
