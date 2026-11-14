import { prisma } from '../lib/prisma.js';
import type { Prisma } from '../generated/prisma/client.js';
import type { Frequency, RecurringMode, TransactionType } from '../generated/prisma/enums.js';

// Category fields the frontend needs to show each recurring transaction (name, color, icon)
const recurringInclude = {
  category: { select: { id: true, name: true, color: true, icon: true } },
} satisfies Prisma.RecurringTransactionInclude;

export interface RecurringData {
  categoryId: string;
  amount: number;
  type: TransactionType;
  description: string;
  frequency: Frequency;
  dayOfMonth: number;
  monthOfYear: number | null;
  startDate: Date;
  endDate: Date | null;
  mode: RecurringMode;
}

export interface RecurringActiveData {
  active: boolean;
  lastGeneratedAt?: Date | null;
}

export function findManyByUser(userId: string) {
  return prisma.recurringTransaction.findMany({
    where: { userId },
    include: recurringInclude,
    // Active ones first, then alphabetically. `id` makes the order stable
    orderBy: [{ active: 'desc' }, { description: 'asc' }, { id: 'asc' }],
  });
}

// findFirst (not findUnique) because it filters by id AND userId:
// a recurring transaction of another user is simply not found
export function findById(userId: string, id: string) {
  return prisma.recurringTransaction.findFirst({ where: { id, userId }, include: recurringInclude });
}

export function create(userId: string, data: RecurringData) {
  return prisma.recurringTransaction.create({ data: { ...data, userId }, include: recurringInclude });
}

export function update(userId: string, id: string, data: RecurringData) {
  return prisma.recurringTransaction.update({ where: { id, userId }, data, include: recurringInclude });
}

export function updateActive(userId: string, id: string, data: RecurringActiveData) {
  return prisma.recurringTransaction.update({ where: { id, userId }, data, include: recurringInclude });
}

// Deletes the recurring transaction and its PENDING records in a single database transaction:
// either both happen or neither does. Its CONFIRMED records stay in the history, and the
// `onDelete: SetNull` of the schema unlinks them
export async function removeWithPendingRecords(userId: string, id: string) {
  await prisma.$transaction([
    prisma.transaction.deleteMany({ where: { userId, recurringTransactionId: id, status: 'PENDING' } }),
    prisma.recurringTransaction.delete({ where: { id, userId } }),
  ]);
}
