import { prisma } from '../../lib/prisma.js';
import type { UpdateProfileInput } from './users.schema.js';

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
}
