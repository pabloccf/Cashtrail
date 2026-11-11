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
    // Each transaction carries a copy of its category (name, color, icon), so the cached
    // transaction lists are outdated too after renaming or recoloring a category
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
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
