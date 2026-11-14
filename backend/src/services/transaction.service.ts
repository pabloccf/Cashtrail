import { AppError } from '../lib/appError.js';
import { toDate } from '../lib/date.js';
import * as transactionRepository from '../repositories/transaction.repository.js';
import { assertUsableCategory } from './category.service.js';
import type { ListTransactionsQuery, TransactionInput } from '../schemas/transaction.schema.js';

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

export async function list(userId: string, query: ListTransactionsQuery) {
  const { page, pageSize } = query;

  const { items, total } = await transactionRepository.findManyByUser(
    userId,
    {
      from: query.from ? toDate(query.from) : undefined,
      to: query.to ? toDate(query.to) : undefined,
      categoryId: query.category,
      type: query.type,
      search: query.q,
    },
    { skip: (page - 1) * pageSize, take: pageSize },
  );

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

export async function remove(userId: string, id: string) {
  await getById(userId, id);
  await transactionRepository.remove(userId, id);
}
