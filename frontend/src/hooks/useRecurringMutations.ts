import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createRecurring, deleteRecurring, toggleRecurring, updateRecurring } from '../api/recurring'
import type { RecurringInput } from '../types/recurring'

// Every change to a recurring transaction changes the stats (the estimated balance counts the
// recurring income and expenses still to come). Some also create or delete records in the backend,
// so the cached transaction lists must be refetched too. Returning the promise keeps the mutation
// "pending" until everything is up to date
function useInvalidate() {
  const queryClient = useQueryClient()
  return {
    recurring: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['recurring'] }),
        queryClient.invalidateQueries({ queryKey: ['stats'] }),
      ]),
    recurringAndTransactions: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['recurring'] }),
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
        queryClient.invalidateQueries({ queryKey: ['stats'] }),
      ]),
  }
}

// Creating generates its records right away (the past ones too, if the start date is in the past)
export function useCreateRecurring() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (input: RecurringInput) => createRecurring(input),
    onSuccess: invalidate.recurringAndTransactions,
  })
}

// Editing only affects future records, so no transaction changes (the stats do: see useInvalidate)
export function useUpdateRecurring() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RecurringInput }) => updateRecurring(id, input),
    onSuccess: invalidate.recurring,
  })
}

// Resuming can create today's record
export function useToggleRecurring() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: string) => toggleRecurring(id),
    onSuccess: invalidate.recurringAndTransactions,
  })
}

// Deleting also deletes its pending records (the confirmed ones are kept)
export function useDeleteRecurring() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: string) => deleteRecurring(id),
    onSuccess: invalidate.recurringAndTransactions,
  })
}
