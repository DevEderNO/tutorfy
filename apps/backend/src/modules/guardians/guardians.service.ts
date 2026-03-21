import { GuardiansRepository } from './guardians.repository.js';
import type { CreateGuardianInput, UpdateGuardianInput, ListGuardiansQuery } from './guardians.schema.js';
import { prisma } from '../../lib/prisma.js';

const repo = new GuardiansRepository();

export class GuardiansService {
  async list(userId: string, query: ListGuardiansQuery) {
    return repo.list(userId, query);
  }

  async getById(id: string, userId: string) {
    const guardian = await repo.findById(id, userId);
    if (!guardian) throw { statusCode: 404, message: 'Responsável não encontrado' };
    return guardian;
  }

  async create(userId: string, data: CreateGuardianInput) {
    return repo.create(userId, data);
  }

  async update(id: string, userId: string, data: UpdateGuardianInput) {
    const guardian = await this.getById(id, userId);
    const result = await repo.update(id, userId, data);

    // Sync GuardianStudentLink (portal) if guardian has an email matching a PortalAccount
    if (data.studentLinks !== undefined && guardian.email) {
      const portalAccount = await prisma.portalAccount.findUnique({
        where: { email: guardian.email },
        select: { id: true },
      });

      if (portalAccount) {
        await prisma.$transaction(async (tx) => {
          await tx.guardianStudentLink.deleteMany({ where: { guardianId: portalAccount.id } });
          if (data.studentLinks!.length > 0) {
            await tx.guardianStudentLink.createMany({
              data: data.studentLinks!.map(({ id: studentId }) => ({
                guardianId: portalAccount.id,
                studentId,
              })),
              skipDuplicates: true,
            });
          }
        });
      }
    }

    return result;
  }

  async delete(id: string, userId: string) {
    await this.getById(id, userId);
    await repo.delete(id, userId);
  }
}
