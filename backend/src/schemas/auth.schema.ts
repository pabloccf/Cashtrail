import { z } from 'zod';
import { SUPPORTED_CURRENCIES } from '../constants/currencies.js';

// bcrypt silently ignores everything after the first 72 BYTES (not characters: "ñ" takes 2),
// so longer passwords are rejected instead of being partially checked
const BCRYPT_MAX_BYTES = 72;

// Trim and lowercase BEFORE checking the format, so " Pablo@Mail.com" is stored as "pablo@mail.com"
const emailSchema = z.string().trim().toLowerCase().pipe(z.email().max(254));

// Same rules on register and when editing the profile
const nameSchema = z.string().trim().min(1).max(50);

const passwordMaxBytes = (password: string) => Buffer.byteLength(password, 'utf8') <= BCRYPT_MAX_BYTES;

export const registerBodySchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: z
    .string()
    .min(8)
    .refine(passwordMaxBytes, { message: `Password must be at most ${BCRYPT_MAX_BYTES} bytes` }),
});

// No minimum length here: login only checks the password, the rules are enforced on register
export const loginBodySchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1)
    .refine(passwordMaxBytes, { message: `Password must be at most ${BCRYPT_MAX_BYTES} bytes` }),
});

// PUT /auth/me. Email and password are not here: changing them needs the current password
export const updateProfileBodySchema = z.object({
  name: nameSchema,
  currency: z.enum(SUPPORTED_CURRENCIES),
});

export type RegisterInput = z.infer<typeof registerBodySchema>;
export type LoginInput = z.infer<typeof loginBodySchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileBodySchema>;
