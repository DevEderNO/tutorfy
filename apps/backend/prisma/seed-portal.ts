import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PORTAL_EMAIL = process.env.PORTAL_SEED_EMAIL ?? 'aluno@tutorfy.com';
const PORTAL_PASSWORD = process.env.PORTAL_SEED_PASSWORD ?? 'aluno123456';

async function main() {
  // Busca o primeiro aluno disponível no banco
  const student = await prisma.student.findFirst({
    where: { active: true, studentLink: null },
    select: { id: true, name: true },
  });

  if (!student) {
    console.error('✗ Nenhum aluno disponível (sem vínculo de portal) encontrado. Rode o seed de alunos primeiro.');
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(PORTAL_PASSWORD, 10);

  const account = await prisma.portalAccount.upsert({
    where: { email: PORTAL_EMAIL },
    update: {},
    create: {
      email: PORTAL_EMAIL,
      password: hashedPassword,
      name: student.name,
      accountType: 'STUDENT',
      isActive: true,
    },
  });

  // Garante o vínculo com o aluno
  await prisma.studentPortalLink.upsert({
    where: { portalAccountId: account.id },
    update: {},
    create: {
      portalAccountId: account.id,
      studentId: student.id,
    },
  });

  console.log(`✓ Conta portal criada/verificada: ${account.email}`);
  console.log(`  → Aluno vinculado: ${student.name} (${student.id})`);
  console.log(`  → Senha: ${PORTAL_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
