import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getTransactions, type TransactionListParams } from '../api/transactions'

export function useTransactions(params: TransactionListParams) {
  return useQuery({
    // The params are part of the key: each page is cached separately,
    // and changing the page fetches again automatically
    queryKey: ['transactions', params],
    queryFn: () => getTransactions(params),
    // While the next page loads, keep showing the current one instead of an empty loading state
    placeholderData: keepPreviousData,
  })
}
