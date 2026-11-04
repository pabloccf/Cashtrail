import { AppError } from '../lib/appError.js';
import type { TransactionType } from '../generated/prisma/enums.js';
import * as categoryRepository from '../repositories/category.repository.js';
import * as transactionRepository from '../repositories/transaction.repository.js';
import type { ListTransactionsQuery, TransactionInput } from '../schemas/transaction.schema.js';

// "2026-11-04" -> Date at 00:00 UTC. The column is a DATE, so the time part is discarded
function toDate(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00.000Z`);
}

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

// The category must belong to the user and have the same type (expense/income) as the transaction
async function assertValidCategory(userId: string, categoryId: string, type: TransactionType) {
  const category = await categoryRepository.findById(userId, categoryId);
  if (!category) {
    throw new AppError(400, 'Category not found');
  }
  if (category.type !== type) {
    throw new AppError(400, `Category type (${category.type}) does not match transaction type (${type})`);
  }
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
  await assertValidCategory(userId, input.categoryId, input.type);
  return transactionRepository.create(userId, toTransactionData(input));
}

export async function update(userId: string, id: string, input: TransactionInput) {
  await getById(userId, id);
  await assertValidCategory(userId, input.categoryId, input.type);
  return transactionRepository.update(userId, id, toTransactionData(input));
}

export async function remove(userId: string, id: string) {
  await getById(userId, id);
  await transactionRepository.remove(userId, id);
}
