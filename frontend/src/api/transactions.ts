import { apiClient } from './client'
import type { PaginatedResponse, Transaction, TransactionInput } from '../types/transaction'
import type { PageSize } from '../utils/pageSize'
import type { TransactionFilters } from '../utils/transactionFilters'

export interface TransactionListParams extends TransactionFilters {
  page: number
  pageSize: PageSize
}

export function getTransactions(params: TransactionListParams) {
  // URLSearchParams encodes the values safely (spaces, accents, "&"...). Missing filters are not sent
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) query.set(key, String(value))
  }
  return apiClient.get<PaginatedResponse<Transaction>>(`/transactions?${query}`)
}

export function createTransaction(input: TransactionInput) {
  return apiClient.post<Transaction>('/transactions', input)
}

export function updateTransaction(id: string, input: TransactionInput) {
  return apiClient.put<Transaction>(`/transactions/${id}`, input)
}

export function deleteTransaction(id: string) {
  return apiClient.delete(`/transactions/${id}`)
}
