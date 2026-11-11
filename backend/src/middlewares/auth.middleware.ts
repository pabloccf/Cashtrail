import type { RequestHandler } from 'express';
import { AppError } from '../lib/appError.js';
import { verifySessionToken } from '../lib/jwt.js';
import { SESSION_COOKIE_NAME } from '../lib/sessionCookie.js';

// Reads the session cookie (parsed by cookie-parser), verifies the JWT and sets req.userId.
// Any route after this middleware can trust that req.userId belongs to the logged-in user
export const requireAuth: RequestHandler = (req, _res, next) => {
  const token: unknown = req.cookies?.[SESSION_COOKIE_NAME];
  const userId = typeof token === 'string' ? verifySessionToken(token) : null;

  if (!userId) {
    next(new AppError(401, 'Not authenticated'));
    return;
  }

  req.userId = userId;
  next();
};
