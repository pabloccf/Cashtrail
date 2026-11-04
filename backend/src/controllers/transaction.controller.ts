import type { RequestHandler } from 'express';
import * as transactionService from '../services/transaction.service.js';
import type {
  ListTransactionsQuery,
  TransactionIdParams,
  TransactionInput,
} from '../schemas/transaction.schema.js';

// The RequestHandler generics are <params, response body, request body, query>.
// They are only a promise to TypeScript: the validate middleware on each route makes them true
type NoParams = Record<string, string>;

export const list: RequestHandler = async (req, res) => {
  // Express types `req.query` as raw strings (ParsedQs) and rejects other types in the generics.
  // The cast is safe because validate() already replaced it with the parsed query
  const query = req.query as unknown as ListTransactionsQuery;
  res.json(await transactionService.list(req.userId, query));
};

export const getById: RequestHandler<TransactionIdParams> = async (req, res) => {
  res.json(await transactionService.getById(req.userId, req.params.id));
};

export const create: RequestHandler<NoParams, unknown, TransactionInput> = async (req, res) => {
  res.status(201).json(await transactionService.create(req.userId, req.body));
};

export const update: RequestHandler<TransactionIdParams, unknown, TransactionInput> = async (req, res) => {
  res.json(await transactionService.update(req.userId, req.params.id, req.body));
};

export const remove: RequestHandler<TransactionIdParams> = async (req, res) => {
  await transactionService.remove(req.userId, req.params.id);
  res.status(204).end();
};
