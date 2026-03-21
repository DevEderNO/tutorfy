import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import type { PortalLoginInput, PortalRegisterInput, PortalTokenLoginInput, PortalLinkStudentInput } from './portal-auth.schema.js';

export class PortalAuthService {
  async login(data: PortalLoginInput) {
    const account = await prisma.portalAccount.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        accountType: true,
        isActive: true,
      },
    });

    if (!account || !account.isActive) {
      throw { statusCode: 401, message: 'Credenciais inválidas' };
    }

    if (!account.password) {
      throw { statusCode: 401, message: 'Esta conta foi criada via convite — defina uma senha para continuar' };
    }

    const validPassword = await bcrypt.compare(data.password, account.password);
    if (!validPassword) {
      throw { statusCode: 401, message: 'Credenciais inválidas' };
    }

    await prisma.portalAccount.update({
      where: { id: account.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      id: account.id,
      name: account.name,
      email: account.email,
      accountType: account.accountType,
    };
  }

  async register(data: PortalRegisterInput) {
    // Validar token de convite
    const shareToken = await prisma.studentShareToken.findUnique({
      where: { token: data.token },
      include: { student: { select: { id: true, name: true } } },
    });

    if (!shareToken) {
      throw { statusCode: 400, message: 'Token de convite inválido' };
    }

    // Verificar se e-mail já existe
    const existing = await prisma.portalAccount.findUnique({ where: { email: data.email } });
    if (existing) {
      throw { statusCode: 409, message: 'Email já cadastrado' };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const account = await prisma.$transaction(async (tx) => {
      const newAccount = await tx.portalAccount.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          accountType: data.accountType,
        },
      });

      if (data.accountType === 'STUDENT') {
        // Verificar se aluno já tem conta vinculada
        const existingLink = await tx.studentPortalLink.findUnique({
          where: { studentId: shareToken.studentId },
        });
        if (existingLink) {
          throw { statusCode: 409, message: 'Este aluno já possui uma conta no portal' };
        }
        await tx.studentPortalLink.create({
          data: {
            portalAccountId: newAccount.id,
            studentId: shareToken.studentId,
          },
        });
      } else {
        // GUARDIAN — verificar duplicata
        const existingLink = await tx.guardianStudentLink.findUnique({
          where: {
            guardianId_studentId: {
              guardianId: newAccount.id,
              studentId: shareToken.studentId,
            },
          },
        });
        if (!existingLink) {
          await tx.guardianStudentLink.create({
            data: {
              guardianId: newAccount.id,
              studentId: shareToken.studentId,
            },
          });
        }
      }

      return newAccount;
    });

    return {
      id: account.id,
      name: account.name,
      email: account.email,
      accountType: account.accountType,
    };
  }

  async loginWithToken(data: PortalTokenLoginInput) {
    const shareToken = await prisma.studentShareToken.findUnique({
      where: { token: data.token },
      include: { student: { select: { id: true, name: true } } },
    });

    if (!shareToken) {
      throw { statusCode: 400, message: 'Link de convite inválido ou expirado' };
    }

    // Busca conta existente via vínculo
    const existingLink = await prisma.studentPortalLink.findUnique({
      where: { studentId: shareToken.studentId },
      include: { portalAccount: true },
    });

    if (existingLink) {
      const account = existingLink.portalAccount;
      await prisma.portalAccount.update({ where: { id: account.id }, data: { lastLoginAt: new Date() } });
      return { id: account.id, name: account.name, email: account.email, accountType: account.accountType };
    }

    // Cria conta sem email/senha e vincula ao aluno
    const account = await prisma.$transaction(async (tx) => {
      const newAccount = await tx.portalAccount.create({
        data: {
          name: shareToken.student.name,
          accountType: 'STUDENT',
        },
      });
      await tx.studentPortalLink.create({
        data: { portalAccountId: newAccount.id, studentId: shareToken.studentId },
      });
      return newAccount;
    });

    return { id: account.id, name: account.name, email: account.email, accountType: account.accountType };
  }

  async linkStudent(portalAccountId: string, data: PortalLinkStudentInput) {
    const account = await prisma.portalAccount.findUnique({
      where: { id: portalAccountId },
      select: { id: true, accountType: true },
    });

    if (!account) {
      throw { statusCode: 404, message: 'Conta não encontrada' };
    }

    if (account.accountType !== 'GUARDIAN') {
      throw { statusCode: 403, message: 'Apenas responsáveis podem vincular alunos' };
    }

    const shareToken = await prisma.studentShareToken.findUnique({
      where: { token: data.token },
      include: { student: { select: { id: true, name: true } } },
    });

    if (!shareToken) {
      throw { statusCode: 400, message: 'Token de convite inválido' };
    }

    const existingLink = await prisma.guardianStudentLink.findUnique({
      where: {
        guardianId_studentId: {
          guardianId: portalAccountId,
          studentId: shareToken.studentId,
        },
      },
    });

    if (existingLink) {
      throw { statusCode: 409, message: 'Aluno já está vinculado a esta conta' };
    }

    await prisma.guardianStudentLink.create({
      data: {
        guardianId: portalAccountId,
        studentId: shareToken.studentId,
      },
    });

    return { student: shareToken.student };
  }

  async me(portalAccountId: string) {
    const account = await prisma.portalAccount.findUnique({
      where: { id: portalAccountId },
      select: {
        id: true,
        name: true,
        email: true,
        accountType: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        studentLink: {
          select: {
            student: { select: { id: true, name: true, grade: true, school: true } },
          },
        },
        guardianLinks: {
          select: {
            student: { select: { id: true, name: true, grade: true, school: true } },
          },
        },
      },
    });

    if (!account || !account.isActive) {
      throw { statusCode: 404, message: 'Conta não encontrada' };
    }

    const students =
      account.accountType === 'STUDENT'
        ? account.studentLink
          ? [account.studentLink.student]
          : []
        : account.guardianLinks.map((l) => l.student);

    return {
      id: account.id,
      name: account.name,
      email: account.email,
      accountType: account.accountType,
      createdAt: account.createdAt,
      lastLoginAt: account.lastLoginAt,
      students,
    };
  }
}
