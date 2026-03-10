import { prisma } from '../../lib/prisma.js';
import type { CreateSkillCategoryInput, UpdateSkillCategoryInput } from './skill-categories.schema.js';

export class SkillCategoriesRepository {
  async findAll(userId: string) {
    return prisma.skillCategory.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string, userId: string) {
    return prisma.skillCategory.findFirst({
      where: { id, userId },
    });
  }

  async create(userId: string, data: CreateSkillCategoryInput) {
    return prisma.skillCategory.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async update(id: string, data: UpdateSkillCategoryInput) {
    return prisma.skillCategory.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.skillCategory.delete({
      where: { id },
    });
  }
}
