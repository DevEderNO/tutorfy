import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import type { AdminLoginInput } from './admin-auth.schema.js';

export class AdminAuthService {
  async login(data: AdminLoginInput) {
    const admin = await prisma.adminUser.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        adminRole: true,
        isActive: true,
      },
    });

    if (!admin || !admin.isActive) {
      throw { statusCode: 401, message: 'Credenciais inválidas' };
    }

    const validPassword = await bcrypt.compare(data.password, admin.password);
    if (!validPassword) {
      throw { statusCode: 401, message: 'Credenciais inválidas' };
    }

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      adminRole: admin.adminRole,
    };
  }

  async me(adminId: string) {
    const admin = await prisma.adminUser.findUnique({
      where: { id: adminId },
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

    if (!admin || !admin.isActive) {
      throw { statusCode: 404, message: 'Admin não encontrado' };
    }

    return admin;
  }
}
