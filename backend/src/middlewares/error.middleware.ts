import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError, z } from 'zod';
import { AppError } from '../lib/appError.js';
import { Prisma } from '../generated/prisma/client.js';

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

  // Unique constraint violated (P2002). Services check duplicates first, but two requests at the
  // same time can both pass that check: the database constraint is the final guarantee
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    res.status(409).json({ error: { message: 'A record with these values already exists' } });
    return;
  }

  // Foreign key violated (P2003): e.g. deleting a category that a transaction just started using.
  // Services check usages first; as with P2002, this covers two requests at the same time
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
    res.status(409).json({ error: { message: 'This record is in use by other records' } });
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
