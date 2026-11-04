import type { RequestHandler } from 'express';
import { z } from 'zod';
import { AppError } from '../lib/appError.js';

interface RequestSchemas {
  params?: z.ZodType;
  query?: z.ZodType;
  body?: z.ZodType;
}

const REQUEST_PARTS = ['params', 'query', 'body'] as const;

// Validates the request with Zod and replaces each part with the parsed data
// (coerced types, defaults applied, unknown keys stripped), so controllers can trust it
export function validate(schemas: RequestSchemas): RequestHandler {
  return (req, _res, next) => {
    for (const part of REQUEST_PARTS) {
      const schema = schemas[part];
      if (!schema) continue;

      const result = schema.safeParse(req[part]);
      if (!result.success) {
        next(new AppError(400, `Invalid request ${part}`, z.flattenError(result.error)));
        return;
      }

      if (part === 'query') {
        // In Express 5 `req.query` is a read-only getter, so it cannot be reassigned directly
        Object.defineProperty(req, 'query', { value: result.data, writable: true, configurable: true });
      } else {
        req[part] = result.data as (typeof req)[typeof part];
      }
    }

    next();
  };
}
