import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import type { CreateAdminInput, UpdateAdminInput } from './admin-accounts.schema.js';

export class AdminAccountsService {
  async list() {
    return prisma.adminUser.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        adminRole: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });
  }

  async create(data: CreateAdminInput) {
    const existing = await prisma.adminUser.findUnique({ where: { email: data.email } });
    if (existing) {
      throw { statusCode: 409, message: 'Email já cadastrado' };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return prisma.adminUser.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        adminRole: data.adminRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        adminRole: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, data: UpdateAdminInput, requestingAdminId: string) {
    const admin = await prisma.adminUser.findUnique({ where: { id } });
    if (!admin || !admin.isActive) {
      throw { statusCode: 404, message: 'Admin não encontrado' };
    }

    // Impedir que um admin rebaixe a si mesmo
    if (id === requestingAdminId && data.adminRole && data.adminRole !== admin.adminRole) {
      throw { statusCode: 400, message: 'Você não pode alterar seu próprio role' };
    }

    return prisma.adminUser.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        adminRole: true,
        isActive: true,
      },
    });
  }

  async deactivate(id: string, requestingAdminId: string) {
    if (id === requestingAdminId) {
      throw { statusCode: 400, message: 'Você não pode desativar sua própria conta' };
    }

    const admin = await prisma.adminUser.findUnique({ where: { id } });
    if (!admin) {
      throw { statusCode: 404, message: 'Admin não encontrado' };
    }

    return prisma.adminUser.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, name: true, email: true, isActive: true },
    });
  }
}
