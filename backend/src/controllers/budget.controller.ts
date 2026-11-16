import type { RequestHandler } from 'express';
import * as budgetService from '../services/budget.service.js';
import type {
  BudgetIdParams,
  CopyBudgetsInput,
  CreateBudgetInput,
  ListBudgetsQuery,
  UpdateBudgetInput,
} from '../schemas/budget.schema.js';

// The RequestHandler generics are <params, response body, request body, query>.
// They are only a promise to TypeScript: the validate middleware on each route makes them true
type NoParams = Record<string, string>;

export const list: RequestHandler = async (req, res) => {
  // Safe cast: validate() already replaced `req.query` with the parsed query
  const query = req.query as unknown as ListBudgetsQuery;
  res.json(await budgetService.list(req.userId, query));
};

export const create: RequestHandler<NoParams, unknown, CreateBudgetInput> = async (req, res) => {
  res.status(201).json(await budgetService.create(req.userId, req.body));
};

export const update: RequestHandler<BudgetIdParams, unknown, UpdateBudgetInput> = async (req, res) => {
  res.json(await budgetService.update(req.userId, req.params.id, req.body));
};

export const remove: RequestHandler<BudgetIdParams> = async (req, res) => {
  await budgetService.remove(req.userId, req.params.id);
  res.status(204).end();
};

// 200 (not 201): it may create nothing if every budget was already there
export const copy: RequestHandler<NoParams, unknown, CopyBudgetsInput> = async (req, res) => {
  res.json(await budgetService.copyFromPreviousMonth(req.userId, req.body));
};
