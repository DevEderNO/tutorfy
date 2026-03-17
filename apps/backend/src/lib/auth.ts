import type { FastifyRequest, FastifyReply } from 'fastify';
import type { AdminRole, PortalAccountType } from '@prisma/client';

// ── Tutor guard (compatível com tokens antigos sem `type`) ───────────────────

export async function authGuard(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    const payload = request.user as { id?: string; type?: string };
    // Tokens anteriores não tinham `type` — considerados tutores para retrocompatibilidade
    if (payload.type !== undefined && payload.type !== 'tutor') {
      return reply.status(403).send({ message: 'Forbidden' });
    }
  } catch {
    return reply.status(401).send({ message: 'Unauthorized' });
  }
}

export function getUserId(request: FastifyRequest): string {
  const payload = request.user as { id: string };
  return payload.id;
}

// ── Admin guard ──────────────────────────────────────────────────────────────

export async function adminGuard(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    const payload = request.user as { type?: string };
    if (payload.type !== 'admin') {
      return reply.status(403).send({ message: 'Forbidden' });
    }
  } catch {
    return reply.status(401).send({ message: 'Unauthorized' });
  }
}

export function getAdminId(request: FastifyRequest): string {
  const payload = request.user as { adminId: string };
  return payload.adminId;
}

export function getAdminRole(request: FastifyRequest): AdminRole {
  const payload = request.user as { adminRole: AdminRole };
  return payload.adminRole;
}

export function requireSuperAdmin(request: FastifyRequest, reply: FastifyReply): boolean {
  const role = getAdminRole(request);
  if (role !== 'SUPER_ADMIN') {
    reply.status(403).send({ message: 'Forbidden: requer super admin' });
    return false;
  }
  return true;
}

// ── Portal guard ─────────────────────────────────────────────────────────────

export async function portalGuard(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    const payload = request.user as { type?: string };
    if (payload.type !== 'portal') {
      return reply.status(403).send({ message: 'Forbidden' });
    }
  } catch {
    return reply.status(401).send({ message: 'Unauthorized' });
  }
}

export function getPortalAccountId(request: FastifyRequest): string {
  const payload = request.user as { portalAccountId: string };
  return payload.portalAccountId;
}

export function getPortalAccountType(request: FastifyRequest): PortalAccountType {
  const payload = request.user as { accountType: PortalAccountType };
  return payload.accountType;
}
