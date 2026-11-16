import type { RequestHandler } from 'express';
import * as recurringService from '../services/recurring.service.js';
import type { RecurringIdParams, RecurringInput, UpcomingQuery } from '../schemas/recurring.schema.js';

// The RequestHandler generics are <params, response body, request body, query>.
// They are only a promise to TypeScript: the validate middleware on each route makes them true
type NoParams = Record<string, string>;

export const list: RequestHandler = async (req, res) => {
  res.json(await recurringService.list(req.userId));
};

export const upcoming: RequestHandler = async (req, res) => {
  // Safe cast: validate() already replaced `req.query` with the parsed query
  const { days } = req.query as unknown as UpcomingQuery;
  res.json(await recurringService.getUpcoming(req.userId, days));
};

export const create: RequestHandler<NoParams, unknown, RecurringInput> = async (req, res) => {
  res.status(201).json(await recurringService.create(req.userId, req.body));
};

export const update: RequestHandler<RecurringIdParams, unknown, RecurringInput> = async (req, res) => {
  res.json(await recurringService.update(req.userId, req.params.id, req.body));
};

export const toggle: RequestHandler<RecurringIdParams> = async (req, res) => {
  res.json(await recurringService.toggle(req.userId, req.params.id));
};

export const remove: RequestHandler<RecurringIdParams> = async (req, res) => {
  await recurringService.remove(req.userId, req.params.id);
  res.status(204).end();
};
