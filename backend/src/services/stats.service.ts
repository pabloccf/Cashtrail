import type { TransactionStatus, TransactionType } from '../generated/prisma/enums.js';
import { todayUtc } from '../lib/date.js';
import { monthRange, shiftMonth, toMonthString } from '../lib/month.js';
import * as categoryRepository from '../repositories/category.repository.js';
import * as statsRepository from '../repositories/stats.repository.js';
import type { ByCategoryQuery, MonthlyQuery, SummaryQuery } from '../schemas/stats.schema.js';
import * as recurringService from './recurring.service.js';

interface Totals {
  income: number; // In cents
  expense: number; // In cents
}

// Income and expense totals in cents, from the rows of sumByType. A missing type means 0
async function getTotals(
  userId: string,
  range: statsRepository.DateRange,
  status: TransactionStatus = 'CONFIRMED',
): Promise<Totals> {
  const rows = await statsRepository.sumByType(userId, range, status);
  const totalOf = (type: TransactionType) => rows.find((row) => row.type === type)?._sum.amount ?? 0;
  return { income: totalOf('INCOME'), expense: totalOf('EXPENSE') };
}

// Recurring income and expenses of the month that are not in the balance yet:
// - PENDING records (already generated, waiting for the user to confirm them)
// - occurrences the job has not generated yet, from today to the end of the month
// Nothing of a past month: its occurrences are already generated (and pending ones are counted above)
async function getRemainingRecurring(userId: string, range: statsRepository.DateRange): Promise<Totals> {
  const today = todayUtc();
  const from = range.from > today ? range.from : today;

  const [pending, upcoming] = await Promise.all([
    getTotals(userId, range, 'PENDING'),
    recurringService.getUpcomingInRange(userId, from, range.to),
  ]);

  const remaining = { ...pending };
  for (const occurrence of upcoming) {
    if (occurrence.type === 'INCOME') {
      remaining.income += occurrence.amount;
    } else {
      remaining.expense += occurrence.amount;
    }
  }
  return remaining;
}

// The month's balance, plus how it is expected to end once the remaining recurring income and
// expenses arrive. Just an estimate: one-off expenses still to come are unknown
export async function getSummary(userId: string, { month }: SummaryQuery) {
  const range = monthRange(month);
  const [totals, remainingRecurring] = await Promise.all([
    getTotals(userId, range),
    getRemainingRecurring(userId, range),
  ]);

  const balance = totals.income - totals.expense;
  return {
    month,
    ...totals,
    balance,
    remainingRecurring,
    estimatedBalance: balance + remainingRecurring.income - remainingRecurring.expense,
  };
}

// [{ category: { id, name, color, icon }, total }], highest total first
export async function getByCategory(userId: string, { month, type }: ByCategoryQuery) {
  // Both queries are independent, so they run at the same time
  const [rows, categories] = await Promise.all([
    statsRepository.sumByCategory(userId, type, monthRange(month)),
    categoryRepository.findManyByUser(userId),
  ]);

  const categoryById = new Map(categories.map((category) => [category.id, category]));

  // flatMap returns [] to skip a row: a category is never missing (deleting one with records is
  // not allowed), but this keeps TypeScript happy without a non-null assertion
  return rows.flatMap((row) => {
    const category = categoryById.get(row.categoryId);
    if (!category) return [];
    const { id, name, color, icon } = category;
    return [{ category: { id, name, color, icon }, total: row._sum.amount ?? 0 }];
  });
}

export interface MonthlyTotals {
  month: string; // "YYYY-MM"
  income: number; // In cents
  expense: number; // In cents
}

// The `months` months ending at `month` (included), oldest first. Months without records are
// included with zeros, so the chart always has one bar per month
export async function getMonthly(userId: string, { month, months }: MonthlyQuery): Promise<MonthlyTotals[]> {
  const firstMonth = shiftMonth(month, -(months - 1));

  // A Map keeps insertion order, so the result is already sorted from oldest to newest
  const byMonth = new Map<string, MonthlyTotals>();
  for (let i = 0; i < months; i++) {
    const key = shiftMonth(firstMonth, i);
    byMonth.set(key, { month: key, income: 0, expense: 0 });
  }

  const rows = await statsRepository.sumByDateAndType(userId, {
    from: monthRange(firstMonth).from,
    to: monthRange(month).to,
  });

  for (const row of rows) {
    const entry = byMonth.get(toMonthString(row.date));
    if (!entry) continue; // Cannot happen: the query only covers these months
    const amount = row._sum.amount ?? 0;
    if (row.type === 'INCOME') {
      entry.income += amount;
    } else {
      entry.expense += amount;
    }
  }

  return [...byMonth.values()];
}
