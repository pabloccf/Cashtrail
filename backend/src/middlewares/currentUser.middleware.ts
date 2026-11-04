import type { RequestHandler } from 'express';
import { AppError } from '../lib/appError.js';
import * as userRepository from '../repositories/user.repository.js';

// TODO(Fase 2): replace with JWT auth middleware. Until then every request acts as the seed user
const DEMO_USER_EMAIL = 'demo@cashtrail.local';

// Cached after the first lookup to avoid a database query on every request
let demoUserId: string | undefined;

export const currentUser: RequestHandler = async (req, _res, next) => {
  if (!demoUserId) {
    const user = await userRepository.findIdByEmail(DEMO_USER_EMAIL);
    if (!user) {
      throw new AppError(500, 'Demo user not found. Run `npx prisma db seed` first');
    }
    demoUserId = user.id;
  }

  req.userId = demoUserId;
  next();
};
