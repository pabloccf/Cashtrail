// Sample data to try pagination and filters with plenty of transactions.
// It uses its own user, so your real account never sees this data.
//
//   npm run seed:sample            -> (re)creates the sample user with ~6 months of transactions
//   npm run seed:sample -- --clean -> deletes the sample user and everything it owns
//
// Log in with SAMPLE_EMAIL and the SEED_USER_PASSWORD of your .env. Local development only
import 'dotenv/config';
import { prisma } from '../src/lib/prisma.js';
import { hashPassword } from '../src/lib/password.js';
import { DEFAULT_CATEGORIES } from '../src/constants/defaultCategories.js';
import type { TransactionType } from '../src/generated/prisma/enums.js';

const SAMPLE_EMAIL = 'sample@cashtrail.local';
const MONTHS = 6;

interface SampleTemplate {
  category: string; // Name of a default category
  type: TransactionType;
  day: number; // Day of the month
  description: string;
  amount: number; // Base amount in cents
  vary?: boolean; // Change the amount a bit each month (groceries, fuel...)
}

// Repeated every month. Some descriptions contain "%" or "_" on purpose, to try the search with them
const MONTHLY_TEMPLATES: SampleTemplate[] = [
  { category: 'Nómina', type: 'INCOME', day: 1, description: 'Nómina', amount: 210000 },
  { category: 'Vivienda', type: 'EXPENSE', day: 1, description: 'Alquiler piso', amount: 75000 },
  { category: 'Transporte', type: 'EXPENSE', day: 2, description: 'Abono transporte', amount: 2000 },
  { category: 'Supermercado', type: 'EXPENSE', day: 3, description: 'Compra Mercadona', amount: 6500, vary: true },
  { category: 'Suscripciones', type: 'EXPENSE', day: 5, description: 'Spotify', amount: 1199 },
  { category: 'Supermercado', type: 'EXPENSE', day: 10, description: 'Compra Lidl', amount: 4800, vary: true },
  { category: 'Suscripciones', type: 'EXPENSE', day: 12, description: 'Netflix', amount: 1399 },
  { category: 'Restaurantes', type: 'EXPENSE', day: 14, description: 'Cena con amigos', amount: 3500, vary: true },
  { category: 'Coche', type: 'EXPENSE', day: 15, description: 'Gasolina', amount: 5500, vary: true },
  { category: 'Supermercado', type: 'EXPENSE', day: 17, description: 'Compra Mercadona', amount: 7200, vary: true },
  { category: 'Ocio', type: 'EXPENSE', day: 22, description: 'Cine', amount: 1800 },
  {
    category: 'Supermercado',
    type: 'EXPENSE',
    day: 24,
    description: 'Compra fruta y verdura',
    amount: 2300,
    vary: true,
  },
];

// Only once, in a given month ago (0 = this month)
const ONE_OFF_TEMPLATES: (SampleTemplate & { monthsAgo: number })[] = [
  { category: 'Ropa', type: 'EXPENSE', day: 8, description: 'Rebajas 50% abrigo', amount: 4999, monthsAgo: 1 },
  { category: 'Salud', type: 'EXPENSE', day: 19, description: 'Dentista', amount: 6000, monthsAgo: 2 },
  { category: 'Regalos', type: 'EXPENSE', day: 27, description: 'Regalo cumpleaños', amount: 3000, monthsAgo: 3 },
  { category: 'Extras', type: 'INCOME', day: 11, description: 'Venta Wallapop bici', amount: 12000, monthsAgo: 2 },
  { category: 'Extras', type: 'INCOME', day: 20, description: 'Reembolso gastos_viaje', amount: 8550, monthsAgo: 4 },
  { category: 'Otros', type: 'EXPENSE', day: 9, description: 'Regalo boda', amount: 15000, monthsAgo: 5 },
];

// Deterministic "random" variation: the same data every run, so the tests are repeatable
function variedAmount(amount: number, monthsAgo: number, day: number): number {
  const percent = ((monthsAgo * 37 + day * 13) % 41) - 20; // Between -20% and +20%
  return Math.round(amount * (1 + percent / 100));
}

// Date at 00:00 UTC (like the API does). Date.UTC handles negative months: month -1 = December of the previous year
function sampleDate(monthsAgo: number, day: number): Date {
  const today = new Date();
  return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - monthsAgo, day));
}

async function clean() {
  // onDelete: Cascade in the schema also deletes the user's categories and transactions
  const { count } = await prisma.user.deleteMany({ where: { email: SAMPLE_EMAIL } });
  console.log(count > 0 ? `Deleted ${SAMPLE_EMAIL} and all its data` : `${SAMPLE_EMAIL} did not exist`);
}

async function seed() {
  const password = process.env.SEED_USER_PASSWORD;
  if (!password) {
    throw new Error('SEED_USER_PASSWORD is not defined');
  }

  // Start from scratch every time, so running it twice does not duplicate transactions
  await clean();

  const user = await prisma.user.create({
    data: {
      email: SAMPLE_EMAIL,
      name: 'Sample',
      passwordHash: await hashPassword(password),
      categories: { create: [...DEFAULT_CATEGORIES] },
    },
    include: { categories: true },
  });

  const categoryIds = new Map(user.categories.map((category) => [`${category.type}:${category.name}`, category.id]));
  const now = new Date();

  const templates = [
    ...Array.from({ length: MONTHS }, (_, monthsAgo) =>
      MONTHLY_TEMPLATES.map((template) => ({ ...template, monthsAgo })),
    ).flat(),
    ...ONE_OFF_TEMPLATES,
  ];

  const transactions = templates
    .map((template) => {
      const categoryId = categoryIds.get(`${template.type}:${template.category}`);
      if (!categoryId) {
        throw new Error(`Default category not found: ${template.category} (${template.type})`);
      }
      return {
        userId: user.id,
        categoryId,
        type: template.type,
        date: sampleDate(template.monthsAgo, template.day),
        amount: template.vary ? variedAmount(template.amount, template.monthsAgo, template.day) : template.amount,
        description: template.description,
      };
    })
    // No transactions in the future (the rest of the current month)
    .filter((transaction) => transaction.date <= now);

  // createMany inserts all the rows in a single query
  await prisma.transaction.createMany({ data: transactions });

  console.log(`Seeded ${SAMPLE_EMAIL} with ${transactions.length} transactions (password: SEED_USER_PASSWORD)`);
}

const shouldClean = process.argv.includes('--clean');

(shouldClean ? clean() : seed())
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
