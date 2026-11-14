import { Router } from 'express';
import * as transactionController from '../controllers/transaction.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  confirmTransactionBodySchema,
  listTransactionsQuerySchema,
  transactionBodySchema,
  transactionIdParamsSchema,
} from '../schemas/transaction.schema.js';

export const transactionRouter = Router();

transactionRouter.get('/', validate({ query: listTransactionsQuerySchema }), transactionController.list);

transactionRouter.get('/:id', validate({ params: transactionIdParamsSchema }), transactionController.getById);

transactionRouter.post('/', validate({ body: transactionBodySchema }), transactionController.create);

transactionRouter.put(
  '/:id',
  validate({ params: transactionIdParamsSchema, body: transactionBodySchema }),
  transactionController.update,
);

transactionRouter.patch(
  '/:id/confirm',
  validate({ params: transactionIdParamsSchema, body: confirmTransactionBodySchema }),
  transactionController.confirm,
);

transactionRouter.delete('/:id', validate({ params: transactionIdParamsSchema }), transactionController.remove);
