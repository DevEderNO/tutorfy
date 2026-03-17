import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_SEED_EMAIL ?? 'admin@tutorfy.com';
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD ?? 'admin123456';

async function main() {
  // ── Plano Free ─────────────────────────────────────────────────────────────
  const freePlan = await prisma.plan.upsert({
    where: { slug: 'free' },
    update: {},
    create: {
      name: 'Free',
      slug: 'free',
      maxStudents: 5,
      aiEnabled: false,
      priceMonthly: 0,
      priceAnnual: 0,
    },
  });
  console.log(`✓ Plano criado/verificado: ${freePlan.name}`);

  // ── Vincular tutores existentes sem assinatura ao plano Free ───────────────
  const usersWithoutSubscription = await prisma.user.findMany({
    where: { subscription: null },
    select: { id: true, email: true },
  });

  if (usersWithoutSubscription.length > 0) {
    await prisma.subscription.createMany({
      data: usersWithoutSubscription.map((u) => ({
        userId: u.id,
        planId: freePlan.id,
        period: 'MONTHLY' as const,
        status: 'ACTIVE' as const,
      })),
    });
    console.log(`✓ ${usersWithoutSubscription.length} tutor(es) vinculado(s) ao plano Free`);
  } else {
    console.log('✓ Todos os tutores já possuem assinatura');
  }

  // ── Super Admin ────────────────────────────────────────────────────────────
  const existing = await prisma.adminUser.findUnique({ where: { email: ADMIN_EMAIL } });

  if (existing) {
    console.log(`✓ Admin já existe: ${existing.email}`);
  } else {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const admin = await prisma.adminUser.create({
      data: {
        email: ADMIN_EMAIL,
        password: hashedPassword,
        name: 'Super Admin',
        adminRole: 'SUPER_ADMIN',
      },
    });
    console.log(`✓ Admin criado: ${admin.email} (SUPER_ADMIN)`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
