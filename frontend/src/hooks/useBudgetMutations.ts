import { useMutation, useQueryClient } from '@tanstack/react-query'
import { copyBudgetsFromPreviousMonth, createBudget, deleteBudget, updateBudget } from '../api/budgets'
import type { CreateBudgetInput, UpdateBudgetInput } from '../types/budget'

// Budgets are only a reference to compare against: changing them never changes transactions or
// stats, so only the budget lists are refetched
function useInvalidateBudgets() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['budgets'] })
}

export function useCreateBudget() {
  const invalidate = useInvalidateBudgets()
  return useMutation({
    mutationFn: (input: CreateBudgetInput) => createBudget(input),
    onSuccess: invalidate,
  })
}

export function useUpdateBudget() {
  const invalidate = useInvalidateBudgets()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBudgetInput }) => updateBudget(id, input),
    onSuccess: invalidate,
  })
}

export function useDeleteBudget() {
  const invalidate = useInvalidateBudgets()
  return useMutation({
    mutationFn: (id: string) => deleteBudget(id),
    onSuccess: invalidate,
  })
}

// `mutate(month)`: the month that receives the copies
export function useCopyBudgets() {
  const invalidate = useInvalidateBudgets()
  return useMutation({
    mutationFn: (month: string) => copyBudgetsFromPreviousMonth(month),
    onSuccess: invalidate,
  })
}
