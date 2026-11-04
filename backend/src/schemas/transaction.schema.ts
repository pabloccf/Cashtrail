import { z } from 'zod';
import { TransactionType } from '../generated/prisma/enums.js';

// Upper limit of a PostgreSQL `integer` column (amount is stored in cents)
const MAX_AMOUNT_CENTS = 2_147_483_647;

// Reuses the Prisma enum so the allowed values always match the database
const transactionTypeSchema = z.enum(TransactionType);

export const transactionIdParamsSchema = z.object({
  id: z.uuid(),
});

// Used by both POST (create) and PUT (full replacement)
export const transactionBodySchema = z.object({
  amount: z.number().int().positive().max(MAX_AMOUNT_CENTS),
  type: transactionTypeSchema,
  categoryId: z.uuid(),
  date: z.iso.date(), // "YYYY-MM-DD"
  description: z.string().trim().max(255).optional(),
});

export const listTransactionsQuerySchema = z
  .object({
    from: z.iso.date().optional(),
    to: z.iso.date().optional(),
    category: z.uuid().optional(),
    type: transactionTypeSchema.optional(),
    // Query string values always arrive as text, so they are coerced to numbers
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  })
  // "YYYY-MM-DD" strings sort the same way as the dates they represent
  .refine((query) => !query.from || !query.to || query.from <= query.to, {
    message: '`from` must be earlier than or equal to `to`',
    path: ['to'],
  });

export type TransactionIdParams = z.infer<typeof transactionIdParamsSchema>;
export type TransactionInput = z.infer<typeof transactionBodySchema>;
export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;
