import { z } from 'zod';
import { TransactionType } from '../generated/prisma/enums.js';

export const categoryIdParamsSchema = z.object({
  id: z.uuid(),
});

// Used by both POST (create) and PUT (full replacement)
export const categoryBodySchema = z.object({
  name: z.string().trim().min(1).max(50),
  // "#22c55e". Lowercased after checking the format, so "#22C55E" and "#22c55e" are stored the same way
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, { message: 'Color must be a hex color like #22c55e' })
    .toLowerCase(),
  // Lucide icon name in kebab-case ("shopping-cart"). The backend only checks the format:
  // which icons exist is something the frontend knows
  icon: z
    .string()
    .max(50)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, { message: 'Icon must be a kebab-case name like shopping-cart' }),
  type: z.enum(TransactionType),
});

export type CategoryIdParams = z.infer<typeof categoryIdParamsSchema>;
export type CategoryInput = z.infer<typeof categoryBodySchema>;
