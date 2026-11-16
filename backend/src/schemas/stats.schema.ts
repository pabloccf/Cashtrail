import { z } from 'zod';
import { TransactionType } from '../generated/prisma/enums.js';

// "YYYY-MM". Required on every stats route: the backend works in UTC and the user does not, so
// "the current month" is decided by the frontend (in the user's time zone) and always sent
const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Expected a month as YYYY-MM');

// Limit of months the monthly chart can ask for, so nobody requests ?months=10000
const MAX_MONTHS = 24;
const DEFAULT_MONTHS = 6;

export const summaryQuerySchema = z.object({
  month: monthSchema,
});

export const byCategoryQuerySchema = z.object({
  month: monthSchema,
  type: z.enum(TransactionType).default('EXPENSE'),
});

// `month` is the LAST month of the series (included), so the chart follows the month selector
export const monthlyQuerySchema = z.object({
  month: monthSchema,
  months: z.coerce.number().int().min(1).max(MAX_MONTHS).default(DEFAULT_MONTHS),
});

export type SummaryQuery = z.infer<typeof summaryQuerySchema>;
export type ByCategoryQuery = z.infer<typeof byCategoryQuerySchema>;
export type MonthlyQuery = z.infer<typeof monthlyQuerySchema>;
