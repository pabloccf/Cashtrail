import { Router } from 'express';
import { currentUser } from '../middlewares/currentUser.middleware.js';
import { categoryRouter } from './category.routes.js';
import { transactionRouter } from './transaction.routes.js';

// Groups every API route. Mounted under /api in src/index.ts
export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// TODO(Fase 2): replace currentUser with the JWT auth middleware
apiRouter.use('/transactions', currentUser, transactionRouter);
apiRouter.use('/categories', currentUser, categoryRouter);
