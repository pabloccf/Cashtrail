import { prisma } from '../lib/prisma.js';
import type { Prisma } from '../generated/prisma/client.js';
import type { TransactionStatus, TransactionType } from '../generated/prisma/enums.js';

export interface DateRange {
  from: Date;
  to: Date;
}

// Every stat only counts CONFIRMED records: PENDING ones do not count until the user confirms them.
// The only exception is the estimated balance, which asks for PENDING ones explicitly
function inRange(userId: string, range: DateRange, status: TransactionStatus = 'CONFIRMED'): Prisma.TransactionWhereInput {
  return { userId, status, date: { gte: range.from, lte: range.to } };
}

// One row per type: [{ type: 'INCOME', _sum: { amount: 250000 } }, ...]. A type without
// records has no row at all. SQL: SELECT type, SUM(amount) ... GROUP BY type
export function sumByType(userId: string, range: DateRange, status: TransactionStatus = 'CONFIRMED') {
  return prisma.transaction.groupBy({
    by: ['type'],
    where: inRange(userId, range, status),
    _sum: { amount: true },
  });
}

// One row per category of that type, highest total first. Only ids: the service adds the
// name, color and icon
export function sumByCategory(userId: string, type: TransactionType, range: DateRange) {
  return prisma.transaction.groupBy({
    by: ['categoryId'],
    where: { ...inRange(userId, range), type },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
  });
}

// One row per day and type. groupBy cannot group by "month of a date", so the service adds the
// days up by month. A few hundred rows at most for the months the chart shows
export function sumByDateAndType(userId: string, range: DateRange) {
  return prisma.transaction.groupBy({
    by: ['date', 'type'],
    where: inRange(userId, range),
    _sum: { amount: true },
  });
}
