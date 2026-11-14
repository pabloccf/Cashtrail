import { Router } from 'express';
import * as recurringController from '../controllers/recurring.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { recurringBodySchema, recurringIdParamsSchema } from '../schemas/recurring.schema.js';

export const recurringRouter = Router();

recurringRouter.get('/', recurringController.list);

recurringRouter.post('/', validate({ body: recurringBodySchema }), recurringController.create);

recurringRouter.put(
  '/:id',
  validate({ params: recurringIdParamsSchema, body: recurringBodySchema }),
  recurringController.update,
);

recurringRouter.patch('/:id/toggle', validate({ params: recurringIdParamsSchema }), recurringController.toggle);

recurringRouter.delete('/:id', validate({ params: recurringIdParamsSchema }), recurringController.remove);
