import type { RequestHandler } from 'express';
import { AppError } from '../lib/appError.js';
import { readSessionUserId } from '../lib/sessionCookie.js';

// Reads the session cookie (parsed by cookie-parser), verifies the JWT and sets req.userId.
// Any route after this middleware can trust that req.userId belongs to the logged-in user
export const requireAuth: RequestHandler = (req, _res, next) => {
  const userId = readSessionUserId(req.cookies);

  if (!userId) {
    next(new AppError(401, 'Not authenticated'));
    return;
  }

  req.userId = userId;
  next();
};
