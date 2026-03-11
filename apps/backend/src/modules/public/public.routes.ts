import type { FastifyInstance } from 'fastify';
import { prisma } from '../../lib/prisma.js';

export async function publicRoutes(app: FastifyInstance) {
  app.get<{ Params: { token: string } }>('/students/:token', async (request, reply) => {
    const { token } = request.params;

    const shareToken = await prisma.studentShareToken.findUnique({
      where: { token },
      include: {
        student: {
          include: {
            classSessions: {
              where: {
                status: { in: ['COMPLETED', 'SCHEDULED'] },
              },
              orderBy: [{ date: 'desc' }, { startTime: 'asc' }],
              select: {
                id: true,
                date: true,
                startTime: true,
                endTime: true,
                status: true,
                content: true,
                homework: true,
              },
            },
          },
        },
      },
    });

    if (!shareToken) {
      return reply.status(404).send({ message: 'Página não encontrada' });
    }

    const { student } = shareToken;
    const now = new Date();

    const completed = student.classSessions.filter((c) => c.status === 'COMPLETED');
    const upcoming = student.classSessions
      .filter((c) => c.status === 'SCHEDULED' && new Date(c.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      student: {
        name: student.name,
        grade: student.grade,
        school: student.school,
      },
      upcoming,
      history: completed,
    };
  });
}
