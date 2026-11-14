import { Router } from 'express';
import * as jobController from '../controllers/job.controller.js';
import { requireCronSecret } from '../middlewares/cronSecret.middleware.js';

export const jobRouter = Router();

jobRouter.post('/recurring', requireCronSecret, jobController.runRecurring);
