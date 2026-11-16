import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { authRouter } from './auth.routes.js';
import { budgetRouter } from './budget.routes.js';
import { categoryRouter } from './category.routes.js';
import { jobRouter } from './job.routes.js';
import { recurringRouter } from './recurring.routes.js';
import { statsRouter } from './stats.routes.js';
import { transactionRouter } from './transaction.routes.js';

// Groups every API route. Mounted under /api in src/index.ts
export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Public: each auth route decides on its own whether it needs a session
apiRouter.use('/auth', authRouter);

// Not for users: protected by the x-cron-secret header instead of the session
apiRouter.use('/jobs', jobRouter);

// Everything below requires a logged-in user
apiRouter.use('/transactions', requireAuth, transactionRouter);
apiRouter.use('/categories', requireAuth, categoryRouter);
apiRouter.use('/recurring', requireAuth, recurringRouter);
apiRouter.use('/stats', requireAuth, statsRouter);
apiRouter.use('/budgets', requireAuth, budgetRouter);
