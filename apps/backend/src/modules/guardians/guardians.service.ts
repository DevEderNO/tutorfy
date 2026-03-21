import { GuardiansRepository } from './guardians.repository.js';
import type { CreateGuardianInput, UpdateGuardianInput, ListGuardiansQuery } from './guardians.schema.js';

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
    await this.getById(id, userId);
    return repo.update(id, userId, data);
  }

  async delete(id: string, userId: string) {
    await this.getById(id, userId);
    await repo.delete(id, userId);
  }
}
