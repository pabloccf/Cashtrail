import { apiClient } from './client'
import type { PaginatedResponse, Transaction, TransactionInput } from '../types/transaction'

export interface TransactionListParams {
  page: number
}

export function getTransactions(params: TransactionListParams) {
  // URLSearchParams encodes the values safely (spaces, accents...). Filters will be added here in Phase 3
  const query = new URLSearchParams({ page: String(params.page) })
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
