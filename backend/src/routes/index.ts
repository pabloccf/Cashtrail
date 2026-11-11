import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { authRouter } from './auth.routes.js';
import { categoryRouter } from './category.routes.js';
import { transactionRouter } from './transaction.routes.js';

// Groups every API route. Mounted under /api in src/index.ts
export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Public: each auth route decides on its own whether it needs a session
apiRouter.use('/auth', authRouter);

// Everything below requires a logged-in user
apiRouter.use('/transactions', requireAuth, transactionRouter);
apiRouter.use('/categories', requireAuth, categoryRouter);
