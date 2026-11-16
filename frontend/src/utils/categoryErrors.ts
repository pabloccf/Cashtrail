import { ApiError } from '../api/client'
import { getErrorMessage } from './errorMessage'

// `details` of the backend 409 when a category is in use:
// { transactions: N, recurringTransactions: N, budgets: N }
interface CategoryUsages {
  transactions: number
  recurringTransactions: number
  budgets: number
}

// `details` is `unknown` (it comes from the network), so its shape is checked before using it
function getCategoryUsages(error: unknown): CategoryUsages | null {
  if (!(error instanceof ApiError) || error.status !== 409) return null
  const details = error.details
  if (
    typeof details === 'object' &&
    details !== null &&
    'transactions' in details &&
    typeof details.transactions === 'number' &&
    'recurringTransactions' in details &&
    typeof details.recurringTransactions === 'number' &&
    'budgets' in details &&
    typeof details.budgets === 'number'
  ) {
    return {
      transactions: details.transactions,
      recurringTransactions: details.recurringTransactions,
      budgets: details.budgets,
    }
  }
  return null
}

function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? `1 ${singular}` : `${count} ${plural}`
}

// "3 transacciones, 1 gasto o ingreso fijo y 2 presupuestos". Counts at 0 are left out
function formatUsages(usages: CategoryUsages): string {
  const parts: string[] = []
  if (usages.transactions > 0) {
    parts.push(pluralize(usages.transactions, 'transacción', 'transacciones'))
  }
  if (usages.recurringTransactions > 0) {
    parts.push(pluralize(usages.recurringTransactions, 'gasto o ingreso fijo', 'gastos o ingresos fijos'))
  }
  if (usages.budgets > 0) {
    parts.push(pluralize(usages.budgets, 'presupuesto', 'presupuestos'))
  }
  // Commas between items and " y " before the last one: "a, b y c"
  if (parts.length <= 1) return parts.join('')
  return `${parts.slice(0, -1).join(', ')} y ${parts[parts.length - 1]}`
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
    return `Esta categoría tiene ${formatUsages(usages)}. Muévelos a otra categoría antes de eliminarla.`
  }
  return getErrorMessage(error)
}
