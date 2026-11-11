import 'dotenv/config';
import bcrypt from 'bcrypt';
import { prisma } from '../src/lib/prisma.js';
import { DEFAULT_CATEGORIES } from '../src/constants/defaultCategories.js';

const DEMO_EMAIL = 'demo@cashtrail.local';
const BCRYPT_ROUNDS = 10;

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

  for (const category of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { userId_type_name: { userId: user.id, type: category.type, name: category.name } },
      update: { color: category.color, icon: category.icon },
      create: { ...category, userId: user.id },
    });
  }

  console.log(`Seeded user ${user.email} with ${DEFAULT_CATEGORIES.length} categories`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
