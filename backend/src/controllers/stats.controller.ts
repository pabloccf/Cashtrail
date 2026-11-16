import type { RequestHandler } from 'express';
import * as statsService from '../services/stats.service.js';
import type { ByCategoryQuery, MonthlyQuery, SummaryQuery } from '../schemas/stats.schema.js';

// The casts are safe because validate() already replaced `req.query` with the parsed query
// (same reason as in transaction.controller.ts)

export const summary: RequestHandler = async (req, res) => {
  const query = req.query as unknown as SummaryQuery;
  res.json(await statsService.getSummary(req.userId, query));
};

export const byCategory: RequestHandler = async (req, res) => {
  const query = req.query as unknown as ByCategoryQuery;
  res.json(await statsService.getByCategory(req.userId, query));
};

export const monthly: RequestHandler = async (req, res) => {
  const query = req.query as unknown as MonthlyQuery;
  res.json(await statsService.getMonthly(req.userId, query));
};
