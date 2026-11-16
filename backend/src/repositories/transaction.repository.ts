import { prisma } from '../lib/prisma.js';
import type { Prisma } from '../generated/prisma/client.js';
import type { TransactionStatus, TransactionType } from '../generated/prisma/enums.js';

// Category fields the frontend needs to show each transaction (name, color, icon)
const transactionInclude = {
  category: { select: { id: true, name: true, color: true, icon: true } },
} satisfies Prisma.TransactionInclude;

export interface TransactionFilters {
  from?: Date;
  to?: Date;
  categoryId?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  search?: string;
}

export interface Pagination {
  skip: number;
  take: number;
}

export interface TransactionData {
  categoryId: string;
  amount: number;
  type: TransactionType;
  date: Date;
  description: string | null;
}

// Prisma turns `contains` into ILIKE '%text%' without escaping the LIKE wildcards, so a search
// for "_" (any character) or "%" (any text) would match everything. A backslash makes them literal
function escapeLikeWildcards(text: string): string {
  return text.replace(/[\\%_]/g, '\\$&');
}

// Prisma ignores conditions whose value is `undefined`, so missing filters do not filter
function buildWhere(userId: string, filters: TransactionFilters): Prisma.TransactionWhereInput {
  return {
    userId,
    categoryId: filters.categoryId,
    type: filters.type,
    status: filters.status,
    date: { gte: filters.from, lte: filters.to },
    // ILIKE '%search%' in PostgreSQL: matches anywhere in the text, ignoring upper/lower case.
    // Transactions without a description (null) never match
    description: filters.search
      ? { contains: escapeLikeWildcards(filters.search), mode: 'insensitive' }
      : undefined,
  };
}

export async function findManyByUser(userId: string, filters: TransactionFilters, pagination: Pagination) {
  const where = buildWhere(userId, filters);

  // Both queries run in a single database transaction, so the total matches the page
  const [items, total] = await prisma.$transaction([
    prisma.transaction.findMany({
      where,
      include: transactionInclude,
      // `id` as last criterion gives a stable order, so no row repeats or disappears between pages
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.transaction.count({ where }),
  ]);

  return { items, total };
}

// Every match, oldest first (the natural order in a spreadsheet), with only the columns of the CSV.
// No pagination: a personal history is a few thousand rows at most, small enough for one query
export function findAllForExport(userId: string, filters: TransactionFilters) {
  return prisma.transaction.findMany({
    where: buildWhere(userId, filters),
    select: {
      date: true,
      type: true,
      amount: true,
      description: true,
      status: true,
      category: { select: { name: true } },
    },
    orderBy: [{ date: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
  });
}

export function findById(userId: string, id: string) {
  return prisma.transaction.findFirst({ where: { id, userId }, include: transactionInclude });
}

export function create(userId: string, data: TransactionData) {
  return prisma.transaction.create({ data: { ...data, userId }, include: transactionInclude });
}

export function update(userId: string, id: string, data: TransactionData) {
  return prisma.transaction.update({ where: { id, userId }, data, include: transactionInclude });
}

// `amount` undefined keeps the current amount: Prisma ignores fields whose value is `undefined`
export function confirm(userId: string, id: string, amount?: number) {
  return prisma.transaction.update({
    where: { id, userId },
    data: { status: 'CONFIRMED', amount },
    include: transactionInclude,
  });
}

// Named `remove` because `delete` is a reserved word and cannot be a function name
export async function remove(userId: string, id: string) {
  await prisma.transaction.delete({ where: { id, userId } });
}
