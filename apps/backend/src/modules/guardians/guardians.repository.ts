import { prisma } from '../../lib/prisma.js';
import type { CreateGuardianInput, UpdateGuardianInput, ListGuardiansQuery } from './guardians.schema.js';

export class GuardiansRepository {
  async list(userId: string, query: ListGuardiansQuery) {
    const { page, limit, search, sortBy, sortDir } = query;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.guardian.findMany({
        where,
        orderBy: { [sortBy]: sortDir },
        skip,
        take: limit,
      }),
      prisma.guardian.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  findById(id: string, userId: string) {
    return prisma.guardian.findFirst({
      where: { id, userId },
      include: {
        studentLinks: {
          include: {
            student: {
              select: { id: true, name: true, grade: true, school: true, avatarUrl: true, active: true },
            },
          },
        },
      },
    });
  }

  create(userId: string, data: CreateGuardianInput) {
    return prisma.guardian.create({ data: { ...data, userId } });
  }

  async update(id: string, userId: string, data: UpdateGuardianInput) {
    const { studentLinks, ...fields } = data;

    return prisma.$transaction(async (tx) => {
      await tx.guardian.update({ where: { id }, data: fields });

      if (studentLinks !== undefined) {
        await tx.guardianStudent.deleteMany({ where: { guardianId: id } });
        if (studentLinks.length > 0) {
          await tx.guardianStudent.createMany({
            data: studentLinks.map(({ id: studentId, relationship }) => ({
              guardianId: id,
              studentId,
              relationship: relationship || null,
            })),
          });
        }
      }

      return tx.guardian.findFirst({
        where: { id },
        include: {
          studentLinks: {
            include: {
              student: {
                select: { id: true, name: true, grade: true, school: true, avatarUrl: true, active: true },
              },
            },
          },
        },
      });
    });
  }

  delete(id: string, userId: string) {
    return prisma.guardian.delete({ where: { id } });
  }
}
