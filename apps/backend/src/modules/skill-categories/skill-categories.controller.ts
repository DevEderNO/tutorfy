import type { FastifyRequest, FastifyReply } from 'fastify';
import { SkillCategoriesService } from './skill-categories.service.js';
import { createSkillCategorySchema, updateSkillCategorySchema } from './skill-categories.schema.js';
import { getUserId } from '../../lib/auth.js';

const service = new SkillCategoriesService();

export class SkillCategoriesController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUserId(request);
    const categories = await service.list(userId);
    return reply.send({ data: categories });
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const parsed = createSkillCategorySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        message: 'Dados inválidos',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const userId = getUserId(request);
    const category = await service.create(userId, parsed.data);
    return reply.status(201).send({ data: category });
  }

  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const parsed = updateSkillCategorySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        message: 'Dados inválidos',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const userId = getUserId(request);
    try {
      const category = await service.update(request.params.id, userId, parsed.data);
      return reply.send({ data: category });
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      return reply.status(err.statusCode || 500).send({ message: err.message });
    }
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = getUserId(request);
    try {
      await service.delete(request.params.id, userId);
      return reply.status(204).send();
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      return reply.status(err.statusCode || 500).send({ message: err.message });
    }
  }
}
