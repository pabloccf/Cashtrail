import { prisma } from '../lib/prisma.js';
import type { Prisma } from '../generated/prisma/client.js';
import type { Frequency, RecurringMode, TransactionStatus, TransactionType } from '../generated/prisma/enums.js';

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

// A record the job creates from a recurring transaction
export interface GeneratedRecordData {
  categoryId: string;
  amount: number;
  type: TransactionType;
  description: string;
  date: Date;
  status: TransactionStatus;
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

// Only the active ones: paused recurring transactions generate nothing, so they never come up next
export function findActiveByUser(userId: string) {
  return prisma.recurringTransaction.findMany({
    where: { userId, active: true },
    include: recurringInclude,
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

// --- Used by the generation job (src/jobs/generateRecurring.ts) ---
// These two functions are the exception to "always filter by userId": the job runs for every user
// at once. It is safe because each record is created with the userId of its own recurring transaction

// Active recurring transactions that have days left to process up to `today`
export function findDueForGeneration(today: Date) {
  return prisma.recurringTransaction.findMany({
    where: {
      active: true,
      startDate: { lte: today },
      OR: [{ lastGeneratedAt: null }, { lastGeneratedAt: { lt: today } }],
    },
  });
}

// Creates the records and moves `lastGeneratedAt` forward in a single database transaction, so
// they never get out of step. `skipDuplicates` (ON CONFLICT DO NOTHING) silently skips any record
// that already exists thanks to the unique (recurringTransactionId, date): if two runs overlap,
// nothing is duplicated. Returns how many records were really created
export async function saveGeneratedRecords(
  recurring: { id: string; userId: string },
  records: GeneratedRecordData[],
  processedUntil: Date,
): Promise<number> {
  const [created] = await prisma.$transaction([
    prisma.transaction.createMany({
      data: records.map((record) => ({ ...record, userId: recurring.userId, recurringTransactionId: recurring.id })),
      skipDuplicates: true,
    }),
    prisma.recurringTransaction.update({
      where: { id: recurring.id, userId: recurring.userId },
      data: { lastGeneratedAt: processedUntil },
    }),
  ]);
  return created.count;
}
