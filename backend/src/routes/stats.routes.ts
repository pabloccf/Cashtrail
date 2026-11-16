import { Router } from 'express';
import * as statsController from '../controllers/stats.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { byCategoryQuerySchema, monthlyQuerySchema, summaryQuerySchema } from '../schemas/stats.schema.js';

export const statsRouter = Router();

statsRouter.get('/summary', validate({ query: summaryQuerySchema }), statsController.summary);

statsRouter.get('/by-category', validate({ query: byCategoryQuerySchema }), statsController.byCategory);

statsRouter.get('/monthly', validate({ query: monthlyQuerySchema }), statsController.monthly);
