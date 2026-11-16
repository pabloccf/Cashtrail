import { z } from 'zod';
import { Frequency, RecurringMode, TransactionType } from '../generated/prisma/enums.js';
import { MAX_AMOUNT_CENTS } from './transaction.schema.js';

export const recurringIdParamsSchema = z.object({
  id: z.uuid(),
});

// Used by both POST (create) and PUT (full replacement). `active` is not here: it only changes
// through PATCH /recurring/:id/toggle, which also decides what happens with the paused period
export const recurringBodySchema = z
  .object({
    amount: z.number().int().positive().max(MAX_AMOUNT_CENTS),
    type: z.enum(TransactionType),
    categoryId: z.uuid(),
    description: z.string().trim().min(1).max(255),
    frequency: z.enum(Frequency),
    // 29, 30 or 31 are allowed for every month: shorter months use their last day
    dayOfMonth: z.number().int().min(1).max(31),
    // Only for YEARLY. `nullish` accepts both null and a missing key; both mean "no month"
    monthOfYear: z.number().int().min(1).max(12).nullish(),
    startDate: z.iso.date(), // "YYYY-MM-DD"
    endDate: z.iso.date().nullish(), // Missing or null: it never ends
    mode: z.enum(RecurringMode),
  })
  // Rules that involve more than one field go in .refine(), after each field is valid on its own.
  // `path` attaches the error to a field, so the frontend can show it next to the right input
  .refine((data) => data.frequency !== 'YEARLY' || data.monthOfYear != null, {
    message: 'Yearly recurring transactions need a month',
    path: ['monthOfYear'],
  })
  .refine((data) => data.frequency !== 'MONTHLY' || data.monthOfYear == null, {
    message: 'Monthly recurring transactions cannot have a month',
    path: ['monthOfYear'],
  })
  // "YYYY-MM-DD" strings sort the same way as the dates they represent
  .refine((data) => !data.endDate || data.startDate <= data.endDate, {
    message: '`endDate` must be later than or equal to `startDate`',
    path: ['endDate'],
  });

// GET /recurring/upcoming?days=30. Query string values arrive as text, so they are coerced to numbers.
// Up to a year: further than that the list would only repeat the same recurring transactions
export const upcomingQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
});

export type RecurringIdParams = z.infer<typeof recurringIdParamsSchema>;
export type RecurringInput = z.infer<typeof recurringBodySchema>;
export type UpcomingQuery = z.infer<typeof upcomingQuerySchema>;
