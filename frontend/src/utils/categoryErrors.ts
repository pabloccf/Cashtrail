import { ApiError } from '../api/client'
import { getErrorMessage } from './errorMessage'

// `details` of the backend 409 when a category is in use: { transactions: N }.
// Recurring transactions and budgets will be added in later phases
interface CategoryUsages {
  transactions: number
}

// `details` is `unknown` (it comes from the network), so its shape is checked before using it
function getCategoryUsages(error: unknown): CategoryUsages | null {
  if (!(error instanceof ApiError) || error.status !== 409) return null
  const details = error.details
  if (typeof details === 'object' && details !== null && 'transactions' in details && typeof details.transactions === 'number') {
    return { transactions: details.transactions }
  }
  return null
}

function formatUsages(usages: CategoryUsages): string {
  return usages.transactions === 1 ? '1 transacción' : `${usages.transactions} transacciones`
}

// A 409 on save is either a type change of a category in use (comes with usage counts)
// or a duplicated name (no details)
export function getCategorySaveErrorMessage(error: unknown): string {
  const usages = getCategoryUsages(error)
  if (usages) {
    return `No puedes cambiar el tipo de esta categoría porque tiene ${formatUsages(usages)}.`
  }
  if (error instanceof ApiError && error.status === 409) {
    return 'Ya tienes una categoría con ese nombre de este tipo.'
  }
  return getErrorMessage(error)
}

export function getCategoryDeleteErrorMessage(error: unknown): string {
  const usages = getCategoryUsages(error)
  if (usages) {
    return `Esta categoría tiene ${formatUsages(usages)}. Muévelas a otra categoría antes de eliminarla.`
  }
  return getErrorMessage(error)
}
