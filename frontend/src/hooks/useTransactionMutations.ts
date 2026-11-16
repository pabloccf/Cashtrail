import { useMutation, useQueryClient } from '@tanstack/react-query'
import { confirmTransaction, createTransaction, deleteTransaction, updateTransaction } from '../api/transactions'
import type { TransactionInput } from '../types/transaction'

// After any change, every cached list (all pages) and every stat (totals, charts) is marked as
// stale, and the ones on screen are refetched. Returning the promise keeps the mutation "pending"
// until they are up to date
function useInvalidateTransactions() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['transactions'] }),
      queryClient.invalidateQueries({ queryKey: ['stats'] }),
    ])
}

export function useCreateTransaction() {
  const invalidate = useInvalidateTransactions()
  return useMutation({
    mutationFn: (input: TransactionInput) => createTransaction(input),
    onSuccess: invalidate,
  })
}

export function useUpdateTransaction() {
  const invalidate = useInvalidateTransactions()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TransactionInput }) => updateTransaction(id, input),
    onSuccess: invalidate,
  })
}

export function useConfirmTransaction() {
  const invalidate = useInvalidateTransactions()
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount?: number }) => confirmTransaction(id, amount),
    onSuccess: invalidate,
  })
}

export function useDeleteTransaction() {
  const invalidate = useInvalidateTransactions()
  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: invalidate,
  })
}
