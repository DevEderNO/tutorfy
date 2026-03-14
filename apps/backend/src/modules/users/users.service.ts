import { prisma } from '../../lib/prisma.js';
import type { UpdateProfileInput, UpdateAiSettingsInput } from './users.schema.js';

export class UsersService {
  async updateProfile(userId: string, data: UpdateProfileInput) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
      }
    });

    return {
       id: user.id,
       name: user.name,
       email: user.email,
       avatarUrl: user.avatarUrl,
       createdAt: user.createdAt
    };
  }

  async updateAiSettings(userId: string, data: UpdateAiSettingsInput) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.evolutionAiMode        !== undefined && { evolutionAiMode: data.evolutionAiMode }),
        ...(data.lessonPlanAiMode       !== undefined && { lessonPlanAiMode: data.lessonPlanAiMode }),
        ...(data.lessonPlanFields       !== undefined && { lessonPlanFields: data.lessonPlanFields }),
        ...(data.lessonPlanSessionCount !== undefined && { lessonPlanSessionCount: data.lessonPlanSessionCount }),
      },
      select: {
        id: true,
        evolutionAiMode: true,
        lessonPlanAiMode: true,
        lessonPlanFields: true,
        lessonPlanSessionCount: true,
      },
    });
    return user;
  }
}
