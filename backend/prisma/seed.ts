import 'dotenv/config';
import bcrypt from 'bcrypt';
import { prisma } from '../src/lib/prisma.js';
import type { TransactionType } from '../src/generated/prisma/client.js';

const DEMO_EMAIL = 'demo@cashtrail.local';
const BCRYPT_ROUNDS = 10;

const categories: { name: string; color: string; icon: string; type: TransactionType }[] = [
  { name: 'Alimentación', color: '#22c55e', icon: 'shopping-cart', type: 'EXPENSE' },
  { name: 'Vivienda', color: '#3b82f6', icon: 'home', type: 'EXPENSE' },
  { name: 'Transporte', color: '#f59e0b', icon: 'car', type: 'EXPENSE' },
  { name: 'Ocio', color: '#ec4899', icon: 'gamepad-2', type: 'EXPENSE' },
  { name: 'Salud', color: '#ef4444', icon: 'heart-pulse', type: 'EXPENSE' },
  { name: 'Suscripciones', color: '#8b5cf6', icon: 'repeat', type: 'EXPENSE' },
  { name: 'Nómina', color: '#10b981', icon: 'briefcase', type: 'INCOME' },
  { name: 'Freelance', color: '#06b6d4', icon: 'laptop', type: 'INCOME' },
  { name: 'Otros ingresos', color: '#84cc16', icon: 'piggy-bank', type: 'INCOME' },
];

async function main() {
  const password = process.env.SEED_USER_PASSWORD;
  if (!password) {
    throw new Error('SEED_USER_PASSWORD is not defined');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // upsert keeps the seed idempotent: running it twice does not duplicate data
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { passwordHash },
    create: { email: DEMO_EMAIL, name: 'Demo', passwordHash },
  });

  for (const category of categories) {
    await prisma.category.upsert({
      where: { userId_type_name: { userId: user.id, type: category.type, name: category.name } },
      update: { color: category.color, icon: category.icon },
      create: { ...category, userId: user.id },
    });
  }

  console.log(`Seeded user ${user.email} with ${categories.length} categories`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
