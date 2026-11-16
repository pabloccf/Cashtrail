import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCategory, deleteCategory, updateCategory } from '../api/categories'
import type { CategoryInput } from '../types/category'

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CategoryInput) => createCategory(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CategoryInput }) => updateCategory(id, input),
    // Each transaction (and each "by category" stat and budget) carries a copy of its category (name,
    // color, icon), so the cached lists, stats and budgets are outdated too after renaming or recoloring it
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
        queryClient.invalidateQueries({ queryKey: ['stats'] }),
        queryClient.invalidateQueries({ queryKey: ['budgets'] }),
      ]),
  })
}

// Only unused categories can be deleted, so no transaction list changes
export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })
}
