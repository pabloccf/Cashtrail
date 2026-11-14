import type { RequestHandler } from 'express';
import { AppError } from '../lib/appError.js';
import { isValidCronSecret } from '../lib/cronSecret.js';

// Protects the job endpoints. They are not called by a logged-in user but by the GitHub Action,
// which sends the shared secret in the `x-cron-secret` header
export const requireCronSecret: RequestHandler = (req, _res, next) => {
  if (!isValidCronSecret(req.get('x-cron-secret'))) {
    next(new AppError(401, 'Invalid cron secret'));
    return;
  }
  next();
};
