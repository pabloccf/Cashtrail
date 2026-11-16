import type { RequestHandler } from 'express';
import * as transactionService from '../services/transaction.service.js';
import type {
  ConfirmTransactionInput,
  ExportTransactionsQuery,
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

// "cashtrail-2026-11-01_2026-11-30.csv", "cashtrail-todo.csv"... The name of the downloaded file
// is an HTTP detail, so it is decided here and not in the service
function exportFilename({ from, to }: ExportTransactionsQuery): string {
  if (!from && !to) return 'cashtrail-todo.csv';
  return `cashtrail-${from ?? 'inicio'}_${to ?? 'hoy'}.csv`;
}

export const exportCsv: RequestHandler = async (req, res) => {
  // Safe cast: validate() already replaced `req.query` with the parsed query
  const query = req.query as unknown as ExportTransactionsQuery;
  const csv = await transactionService.exportCsv(req.userId, query);

  // attachment() sets Content-Disposition: attachment; filename="...", so the browser downloads
  // the file instead of showing it. `no-store`: the file has personal data, it is never cached
  res.attachment(exportFilename(query));
  res.type('text/csv; charset=utf-8');
  res.set('Cache-Control', 'no-store');
  res.send(csv);
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

export const confirm: RequestHandler<TransactionIdParams, unknown, ConfirmTransactionInput> = async (req, res) => {
  res.json(await transactionService.confirm(req.userId, req.params.id, req.body));
};

export const remove: RequestHandler<TransactionIdParams> = async (req, res) => {
  await transactionService.remove(req.userId, req.params.id);
  res.status(204).end();
};
