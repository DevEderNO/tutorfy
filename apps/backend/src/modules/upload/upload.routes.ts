import type { FastifyPluginAsync } from 'fastify';
import fsp from 'node:fs/promises';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import util from 'node:util';
import { pipeline } from 'node:stream';

const pump = util.promisify(pipeline);

export const uploadRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    '/avatar',
    async (request, reply) => {
      const data = await request.file();

      if (!data) {
        return reply.status(400).send({ message: 'No file explicitly uploaded' });
      }

      // Check mime constraints
      if (!data.mimetype.startsWith('image/')) {
        return reply.status(400).send({ message: 'Only images are supported' });
      }

      const extension = path.extname(data.filename) || '.png';
      const fileName = `${randomUUID()}${extension}`;
      const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
      
      // Safely ensure directory exists
      await fsp.mkdir(uploadDir, { recursive: true });
      
      const filePath = path.join(uploadDir, fileName);

      // Save stream to physical file
      await pump(data.file, fs.createWriteStream(filePath));

      const avatarUrl = `/uploads/avatars/${fileName}`;

      return reply.status(201).send({ url: avatarUrl });
    }
  );
};
