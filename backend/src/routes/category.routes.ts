import { Router } from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { categoryBodySchema, categoryIdParamsSchema } from '../schemas/category.schema.js';

export const categoryRouter = Router();

categoryRouter.get('/', categoryController.list);

categoryRouter.post('/', validate({ body: categoryBodySchema }), categoryController.create);

categoryRouter.put(
  '/:id',
  validate({ params: categoryIdParamsSchema, body: categoryBodySchema }),
  categoryController.update,
);

categoryRouter.delete('/:id', validate({ params: categoryIdParamsSchema }), categoryController.remove);
