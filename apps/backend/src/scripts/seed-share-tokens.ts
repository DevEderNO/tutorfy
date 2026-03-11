/**
 * One-time script: generate share tokens for existing students that don't have one yet.
 * Run with: npx tsx src/scripts/seed-share-tokens.ts
 */
import 'dotenv/config';
import { prisma } from '../lib/prisma.js';

const students = await prisma.student.findMany({
  where: { shareToken: null },
  select: { id: true },
});

console.log(`Found ${students.length} students without share tokens.`);

for (const student of students) {
  await prisma.studentShareToken.create({
    data: { studentId: student.id },
  });
}

console.log(`Created ${students.length} share tokens.`);
await prisma.$disconnect();
