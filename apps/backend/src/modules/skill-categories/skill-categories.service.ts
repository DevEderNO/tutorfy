import { SkillCategoriesRepository } from './skill-categories.repository.js';
import type { CreateSkillCategoryInput, UpdateSkillCategoryInput } from './skill-categories.schema.js';

const repository = new SkillCategoriesRepository();

export class SkillCategoriesService {
  async list(userId: string) {
    return repository.findAll(userId);
  }

  async getById(id: string, userId: string) {
    const category = await repository.findById(id, userId);
    if (!category) {
      throw { statusCode: 404, message: 'Categoria não encontrada' };
    }
    return category;
  }

  async create(userId: string, data: CreateSkillCategoryInput) {
    return repository.create(userId, data);
  }

  async update(id: string, userId: string, data: UpdateSkillCategoryInput) {
    await this.getById(id, userId);
    return repository.update(id, data);
  }

  async delete(id: string, userId: string) {
    await this.getById(id, userId);
    return repository.delete(id);
  }
}
