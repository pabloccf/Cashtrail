import { z } from 'zod';
import { monthSchema } from './stats.schema.js';
import { MAX_AMOUNT_CENTS } from './transaction.schema.js';

const amountSchema = z.number().int().positive().max(MAX_AMOUNT_CENTS);

export const budgetIdParamsSchema = z.object({
  id: z.uuid(),
});

// GET /budgets?month=2026-11. Required, like in the stats routes: the frontend decides which
// month is "the current one" in the user's time zone
export const listBudgetsQuerySchema = z.object({
  month: monthSchema,
});

export const createBudgetBodySchema = z.object({
  categoryId: z.uuid(),
  amount: amountSchema,
  month: monthSchema,
});

// Only the amount can change. Another category or month is a different budget: delete and create
export const updateBudgetBodySchema = z.object({
  amount: amountSchema,
});

// POST /budgets/copy: copies the budgets of the month before `month` into `month`
export const copyBudgetsBodySchema = z.object({
  month: monthSchema,
});

export type BudgetIdParams = z.infer<typeof budgetIdParamsSchema>;
export type ListBudgetsQuery = z.infer<typeof listBudgetsQuerySchema>;
export type CreateBudgetInput = z.infer<typeof createBudgetBodySchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetBodySchema>;
export type CopyBudgetsInput = z.infer<typeof copyBudgetsBodySchema>;
