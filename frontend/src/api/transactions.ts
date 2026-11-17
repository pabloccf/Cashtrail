import { apiClient } from './client'
import type { PaginatedResponse, Transaction, TransactionInput } from '../types/transaction'
import type { PageSize } from '../utils/pageSize'
import type { TransactionFilters } from '../utils/transactionFilters'

export interface TransactionListParams extends TransactionFilters {
  page: number
  pageSize: PageSize
}

// URLSearchParams encodes the values safely (spaces, accents, "&"...). Missing filters are not sent
function toQueryString(params: object): string {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) query.set(key, String(value))
  }
  return query.toString()
}

export function getTransactions(params: TransactionListParams) {
  return apiClient.get<PaginatedResponse<Transaction>>(`/transactions?${toQueryString(params)}`)
}

// Every transaction that matches the filters, as a CSV file (no pagination)
export function downloadTransactionsCsv(filters: TransactionFilters) {
  return apiClient.download(`/transactions/export?${toQueryString(filters)}`, 'cashtrail.csv')
}

export function createTransaction(input: TransactionInput) {
  return apiClient.post<Transaction>('/transactions', input)
}

export function updateTransaction(id: string, input: TransactionInput) {
  return apiClient.put<Transaction>(`/transactions/${id}`, input)
}

// `amount` adjusts the amount when confirming. Without it, the request has no body and the amount is kept
export function confirmTransaction(id: string, amount?: number) {
  return apiClient.patch<Transaction>(`/transactions/${id}/confirm`, amount === undefined ? undefined : { amount })
}

export function deleteTransaction(id: string) {
  return apiClient.delete(`/transactions/${id}`)
}
