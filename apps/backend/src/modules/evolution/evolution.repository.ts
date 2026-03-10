import { prisma } from '../../lib/prisma.js';
import { Prisma } from '@prisma/client';
import type { CreateEvolutionEntryInput, UpdateEvolutionEntryInput } from './evolution.schema.js';

export class EvolutionRepository {
  async findByStudentId(studentId: string) {
    return prisma.evolutionEntry.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        classSession: {
          select: {
            id: true,
            date: true,
            content: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.evolutionEntry.findFirst({
      where: { id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        classSession: {
          select: {
            id: true,
            date: true,
            content: true,
          },
        },
        student: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });
  }

  async create(data: CreateEvolutionEntryInput) {
    const { categoryIds, ...entryData } = data;

    return prisma.evolutionEntry.create({
      data: {
        ...entryData,
        categories:
          categoryIds && categoryIds.length > 0
            ? {
                create: categoryIds.map((categoryId) => ({
                  categoryId,
                })),
              }
            : undefined,
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        classSession: {
          select: {
            id: true,
            date: true,
            content: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateEvolutionEntryInput) {
    const { categoryIds, ...entryData } = data;

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (categoryIds !== undefined) {
        await tx.evolutionEntryCategory.deleteMany({
          where: { entryId: id },
        });

        if (categoryIds.length > 0) {
          await tx.evolutionEntryCategory.createMany({
            data: categoryIds.map((categoryId) => ({
              entryId: id,
              categoryId,
            })),
          });
        }
      }

      return tx.evolutionEntry.update({
        where: { id },
        data: entryData,
        include: {
          categories: {
            include: {
              category: true,
            },
          },
          classSession: {
            select: {
              id: true,
              date: true,
              content: true,
            },
          },
        },
      });
    });
  }

  async delete(id: string) {
    return prisma.evolutionEntry.delete({
      where: { id },
    });
  }
}
