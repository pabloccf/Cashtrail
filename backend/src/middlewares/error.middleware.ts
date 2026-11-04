import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError, z } from 'zod';
import { AppError } from '../lib/appError.js';

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// Thrown by express.json() when the request body is not valid JSON
function isJsonParseError(err: unknown): boolean {
  return err instanceof SyntaxError && 'type' in err && err.type === 'entity.parse.failed';
}

// Express recognizes an error handler by its 4 parameters, so `_next` must stay even if unused
export const errorHandler: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: { message: err.message, details: err.details } });
    return;
  }

  // Safety net: a Zod `parse` that ran outside the validate middleware
  if (err instanceof ZodError) {
    res.status(400).json({ error: { message: 'Invalid request data', details: z.flattenError(err) } });
    return;
  }

  if (isJsonParseError(err)) {
    res.status(400).json({ error: { message: 'Malformed JSON in request body' } });
    return;
  }

  // Unexpected error: log it, but never send internal details to the client
  console.error(err);
  res.status(500).json({ error: { message: 'Internal server error' } });
};
