import { Router } from 'express';
import * as budgetController from '../controllers/budget.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  budgetIdParamsSchema,
  copyBudgetsBodySchema,
  createBudgetBodySchema,
  listBudgetsQuerySchema,
  updateBudgetBodySchema,
} from '../schemas/budget.schema.js';

export const budgetRouter = Router();

budgetRouter.get('/', validate({ query: listBudgetsQuerySchema }), budgetController.list);

budgetRouter.post('/', validate({ body: createBudgetBodySchema }), budgetController.create);

// Declared before any '/:id' route, so "copy" is never taken as an id
budgetRouter.post('/copy', validate({ body: copyBudgetsBodySchema }), budgetController.copy);

budgetRouter.put(
  '/:id',
  validate({ params: budgetIdParamsSchema, body: updateBudgetBodySchema }),
  budgetController.update,
);

budgetRouter.delete('/:id', validate({ params: budgetIdParamsSchema }), budgetController.remove);
