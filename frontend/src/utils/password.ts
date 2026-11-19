import { z } from 'zod'

// Same limits as the backend (newPasswordSchema). bcrypt only uses the first 72 bytes ("ñ" or "€"
// take more than 1)
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_BYTES = 72

// A password being created: on register and when a Google user sets one in /settings
export const newPasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`)
  .refine((value) => new TextEncoder().encode(value).length <= PASSWORD_MAX_BYTES, 'La contraseña es demasiado larga')
