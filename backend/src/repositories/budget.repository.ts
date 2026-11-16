import { prisma } from '../lib/prisma.js';
import type { Prisma } from '../generated/prisma/client.js';

// Fields returned to the service. The category comes along so the frontend can show its name,
// color and icon without a second request
const budgetSelect = {
  id: true,
  amount: true,
  month: true,
  year: true,
  category: { select: { id: true, name: true, color: true, icon: true } },
} satisfies Prisma.BudgetSelect;

// A month as the database stores it: two integers, month 1-12
export interface YearMonth {
  year: number;
  month: number;
}

export interface BudgetData extends YearMonth {
  categoryId: string;
  amount: number;
}

// Sorted by category name, so the list does not jump around when an amount changes
export function findManyByMonth(userId: string, { year, month }: YearMonth) {
  return prisma.budget.findMany({
    where: { userId, year, month },
    select: budgetSelect,
    orderBy: { category: { name: 'asc' } },
  });
}

export function findById(userId: string, id: string) {
  return prisma.budget.findFirst({ where: { id, userId }, select: budgetSelect });
}

export function findByCategoryAndMonth(userId: string, categoryId: string, { year, month }: YearMonth) {
  return prisma.budget.findFirst({ where: { userId, categoryId, year, month }, select: budgetSelect });
}

export function create(userId: string, data: BudgetData) {
  return prisma.budget.create({ data: { ...data, userId }, select: budgetSelect });
}

export function updateAmount(userId: string, id: string, amount: number) {
  return prisma.budget.update({ where: { id, userId }, data: { amount }, select: budgetSelect });
}

export async function remove(userId: string, id: string) {
  await prisma.budget.delete({ where: { id, userId } });
}

// One INSERT with every row. `skipDuplicates` adds ON CONFLICT DO NOTHING, so rows that collide with
// the unique (userId, categoryId, month, year) are skipped instead of failing the whole insert.
// Returns how many rows were really inserted
export async function createMany(userId: string, rows: BudgetData[]): Promise<number> {
  const result = await prisma.budget.createMany({
    data: rows.map((row) => ({ ...row, userId })),
    skipDuplicates: true,
  });
  return result.count;
}
