import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export async function authGuard(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ message: 'Unauthorized' });
  }
}

export function getUserId(request: FastifyRequest): string {
  const user = request.user as { id: string };
  return user.id;
}
