import { prisma } from '../lib/prisma.js';
import type { Prisma } from '../generated/prisma/client.js';
import type { TransactionType } from '../generated/prisma/enums.js';

// Fields returned to the frontend (userId is left out: it is always the logged-in user)
const categorySelect = {
  id: true,
  name: true,
  color: true,
  icon: true,
  type: true,
} satisfies Prisma.CategorySelect;

export interface CategoryData {
  name: string;
  color: string;
  icon: string;
  type: TransactionType;
}

// findFirst (not findUnique) because it filters by id AND userId:
// a category of another user is simply not found
export function findById(userId: string, id: string) {
  return prisma.category.findFirst({ where: { id, userId }, select: categorySelect });
}

export function findManyByUser(userId: string) {
  return prisma.category.findMany({
    where: { userId },
    select: categorySelect,
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
  });
}

// Case-insensitive: "ocio" counts as a duplicate of "Ocio"
export function findByName(userId: string, type: TransactionType, name: string) {
  return prisma.category.findFirst({
    where: { userId, type, name: { equals: name, mode: 'insensitive' } },
    select: categorySelect,
  });
}

// How many records use the category. `_count` counts the relations in the same query.
// Budgets (Phase 6) will be added here
export async function countUsages(userId: string, id: string) {
  const category = await prisma.category.findFirst({
    where: { id, userId },
    select: { _count: { select: { transactions: true, recurringTransactions: true } } },
  });
  return {
    transactions: category?._count.transactions ?? 0,
    recurringTransactions: category?._count.recurringTransactions ?? 0,
  };
}

export function create(userId: string, data: CategoryData) {
  return prisma.category.create({ data: { ...data, userId }, select: categorySelect });
}

export function update(userId: string, id: string, data: CategoryData) {
  return prisma.category.update({ where: { id, userId }, data, select: categorySelect });
}

// Named `remove` because `delete` is a reserved word and cannot be a function name
export async function remove(userId: string, id: string) {
  await prisma.category.delete({ where: { id, userId } });
}
