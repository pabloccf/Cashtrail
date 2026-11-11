import type { RequestHandler } from 'express';
import * as categoryService from '../services/category.service.js';
import type { CategoryIdParams, CategoryInput } from '../schemas/category.schema.js';

// Same pattern as transaction.controller.ts: the generics are guaranteed by validate() on each route
type NoParams = Record<string, string>;

export const list: RequestHandler = async (req, res) => {
  res.json(await categoryService.list(req.userId));
};

export const create: RequestHandler<NoParams, unknown, CategoryInput> = async (req, res) => {
  res.status(201).json(await categoryService.create(req.userId, req.body));
};

export const update: RequestHandler<CategoryIdParams, unknown, CategoryInput> = async (req, res) => {
  res.json(await categoryService.update(req.userId, req.params.id, req.body));
};

export const remove: RequestHandler<CategoryIdParams> = async (req, res) => {
  await categoryService.remove(req.userId, req.params.id);
  res.status(204).end();
};
