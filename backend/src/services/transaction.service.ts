import { AppError } from '../lib/appError.js';
import { currencySymbol } from '../lib/currency.js';
import { escapeFormula, toCsv } from '../lib/csv.js';
import { toDate } from '../lib/date.js';
import * as transactionRepository from '../repositories/transaction.repository.js';
import * as userRepository from '../repositories/user.repository.js';
import { assertUsableCategory } from './category.service.js';
import type {
  ConfirmTransactionInput,
  ExportTransactionsQuery,
  ListTransactionsQuery,
  TransactionInput,
} from '../schemas/transaction.schema.js';

function toTransactionData(input: TransactionInput): transactionRepository.TransactionData {
  return {
    categoryId: input.categoryId,
    amount: input.amount,
    type: input.type,
    date: toDate(input.date),
    // An empty description is stored as null
    description: input.description || null,
  };
}

// Query string filters (names of the API) -> repository filters (names of the database)
function toFilters(query: ExportTransactionsQuery): transactionRepository.TransactionFilters {
  return {
    from: query.from ? toDate(query.from) : undefined,
    to: query.to ? toDate(query.to) : undefined,
    categoryId: query.category,
    type: query.type,
    status: query.status,
    search: query.q,
  };
}

export async function list(userId: string, query: ListTransactionsQuery) {
  const { page, pageSize } = query;

  const { items, total } = await transactionRepository.findManyByUser(userId, toFilters(query), {
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return {
    data: items,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}

// Another user's transaction gives the same 404 as one that does not exist
export async function getById(userId: string, id: string) {
  const transaction = await transactionRepository.findById(userId, id);
  if (!transaction) {
    throw new AppError(404, 'Transaction not found');
  }
  return transaction;
}

export async function create(userId: string, input: TransactionInput) {
  await assertUsableCategory(userId, input.categoryId, input.type);
  return transactionRepository.create(userId, toTransactionData(input));
}

export async function update(userId: string, id: string, input: TransactionInput) {
  await getById(userId, id);
  await assertUsableCategory(userId, input.categoryId, input.type);
  return transactionRepository.update(userId, id, toTransactionData(input));
}

// A PENDING record (from a CONFIRM-mode recurring transaction) starts counting in totals once confirmed.
// Confirming twice is a 409: the second request would be a mistake (two tabs, double click...)
export async function confirm(userId: string, id: string, input: ConfirmTransactionInput) {
  const transaction = await getById(userId, id);
  if (transaction.status !== 'PENDING') {
    throw new AppError(409, 'Transaction is already confirmed');
  }
  return transactionRepository.confirm(userId, id, input.amount);
}

export async function remove(userId: string, id: string) {
  await getById(userId, id);
  await transactionRepository.remove(userId, id);
}

const TYPE_LABELS = { EXPENSE: 'Gasto', INCOME: 'Ingreso' } as const;
// "Pendiente de confirmar" column: only records of CONFIRM-mode recurring transactions can be PENDING
const PENDING_LABELS = { CONFIRMED: 'No', PENDING: 'Sí' } as const;

// Date at 00:00 UTC (a DATE column) -> "17/11/2026". Read in UTC, so the server's time zone never moves the day
function formatCsvDate(date: Date): string {
  return date.toISOString().slice(0, 10).split('-').reverse().join('/');
}

// 1250 -> "12,50" and, for expenses, "-12,50". With integers only, never float: the same reason why
// amounts are stored in cents. The sign lets a spreadsheet add the column up to get the balance
function formatCsvAmount(cents: number, type: keyof typeof TYPE_LABELS): string {
  const euros = Math.floor(cents / 100);
  const rest = String(cents % 100).padStart(2, '0');
  return `${type === 'EXPENSE' ? '-' : ''}${euros},${rest}`;
}

// Every transaction that matches the filters, as a CSV ready to download. PENDING ones are included
// (unless filtered out) and marked in their own column, so the file shows the whole history
export async function exportCsv(userId: string, query: ExportTransactionsQuery): Promise<string> {
  const [transactions, user] = await Promise.all([
    transactionRepository.findAllForExport(userId, toFilters(query)),
    userRepository.findPublicById(userId),
  ]);

  // The currency goes in the header, not next to each amount: "-12,50 €" is read as text by some
  // spreadsheets (Google Sheets, LibreOffice), and then the column cannot be added up.
  // `user` always exists here (requireAuth checked the session), "EUR" is only a fallback
  const amountHeader = `Importe (${currencySymbol(user?.currency ?? 'EUR')})`;
  const header = ['Fecha', 'Tipo', 'Categoría', 'Descripción', amountHeader, 'Pendiente de confirmar'];
  const rows = transactions.map((transaction) => [
    formatCsvDate(transaction.date),
    TYPE_LABELS[transaction.type],
    // Category names and descriptions are typed by the user, so they could start with "="
    escapeFormula(transaction.category.name),
    escapeFormula(transaction.description ?? ''),
    formatCsvAmount(transaction.amount, transaction.type),
    PENDING_LABELS[transaction.status],
  ]);

  return toCsv([header, ...rows]);
}
