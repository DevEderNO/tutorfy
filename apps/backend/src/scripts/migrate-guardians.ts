/**
 * One-time migration: creates Guardian records from Student.responsibleName/Phone/email/cpf
 * and links them via GuardianStudent.
 *
 * Run: npx tsx src/scripts/migrate-guardians.ts
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const students = await prisma.student.findMany({
    where: { responsibleName: { not: null } },
    select: { id: true, userId: true, responsibleName: true, responsiblePhone: true, email: true, cpf: true },
  });

  console.log(`Migrando ${students.length} alunos...`);
  let created = 0;
  let skipped = 0;

  for (const student of students) {
    // Não duplica se já existe vínculo
    const existing = await prisma.guardianStudent.findFirst({ where: { studentId: student.id } });
    if (existing) { skipped++; continue; }

    const guardian = await prisma.guardian.create({
      data: {
        userId: student.userId,
        name: student.responsibleName!,
        phone: student.responsiblePhone ?? undefined,
        email: student.email ?? undefined,
        cpf: student.cpf ?? undefined,
      },
    });

    await prisma.guardianStudent.create({
      data: { guardianId: guardian.id, studentId: student.id },
    });

    created++;
  }

  console.log(`✅ Criados: ${created} | Ignorados (já vinculados): ${skipped}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
