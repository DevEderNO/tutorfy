import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../../lib/prisma.js';
import type { RegisterInput, LoginInput, RequestResetInput, ResetPasswordInput, GoogleLoginInput } from './auth.schema.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const RESET_TOKEN_EXPIRY_HOURS = 1;

export class AuthService {
  async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw { statusCode: 409, message: 'Email já cadastrado' };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        avatarUrl: true,
      },
    });

    return user;
  }

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        createdAt: true,
        avatarUrl: true,
      }
    });

    if (!user) {
      throw { statusCode: 401, message: 'Credenciais inválidas' };
    }

    if (!user.password) {
      throw { statusCode: 401, message: 'Por favor, autentique-se utilizando sua conta Google.' };
    }

    const validPassword = await bcrypt.compare(data.password, user.password);

    if (!validPassword) {
      throw { statusCode: 401, message: 'Credenciais inválidas' };
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      avatarUrl: user.avatarUrl,
    };
  }

  async googleLogin(data: GoogleLoginInput) {
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: data.token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (e) {
      throw { statusCode: 401, message: 'Token do Google inválido' };
    }

    if (!payload || !payload.email) {
      throw { statusCode: 401, message: 'Não foi possível verificar a conta do Google' };
    }

    const email = payload.email;
    const name = payload.name || email.split('@')[0];
    const avatarUrl = payload.picture || null;
    const googleId = payload.sub;

    let user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        avatarUrl: true,
      }
    });

    if (!user) {
      // Create new user via Google
      user = await prisma.user.create({
        data: {
          email,
          name,
          avatarUrl,
          googleId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          avatarUrl: true,
        }
      });
    } else {
      // Update existing user with googleId if it doesn't have one
      // or simply fetch the latest user info needed.
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          googleId,
          ...(avatarUrl && !user.avatarUrl ? { avatarUrl } : {})
        }
      });
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      avatarUrl: user.avatarUrl,
    };
  }

  async requestPasswordReset(data: RequestResetInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return;
    }

    // Invalidate any existing unused tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    // Generate new token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // TODO: Integrar com serviço de email (Resend, Nodemailer, etc.)
    // Por enquanto, loga no console para desenvolvimento
    const resetUrl = `http://localhost:5173/reset-password?token=${token}`;
    console.log('');
    console.log('='.repeat(60));
    console.log('🔑 LINK DE RECUPERAÇÃO DE SENHA');
    console.log(`📧 Email: ${data.email}`);
    console.log(`🔗 URL: ${resetUrl}`);
    console.log('='.repeat(60));
    console.log('');
  }

  async resetPassword(data: ResetPasswordInput) {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: data.token },
      include: { user: true },
    });

    if (!resetToken) {
      throw { statusCode: 400, message: 'Token inválido ou expirado' };
    }

    if (resetToken.usedAt) {
      throw { statusCode: 400, message: 'Token já foi utilizado' };
    }

    if (resetToken.expiresAt < new Date()) {
      throw { statusCode: 400, message: 'Token expirado' };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Update password and mark token as used in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);
  }
}
