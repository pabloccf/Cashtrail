import { ApiError } from '../../api/client'
import BudgetForm, { type BudgetFormData } from '../../components/BudgetForm'
import Modal from '../../components/Modal'
import { useCreateBudget, useUpdateBudget } from '../../hooks/useBudgetMutations'
import type { Budget } from '../../types/budget'
import type { TransactionCategory } from '../../types/transaction'
import { getErrorMessage } from '../../utils/errorMessage'
import { formatMonth } from '../../utils/month'
import { useToast } from '../../hooks/useToast'

interface BudgetFormModalProps {
  // Present when editing, missing when creating
  budget?: Budget
  month: string // "YYYY-MM": the month a new budget is created for
  availableCategories: TransactionCategory[]
  onClose: () => void
}

// A 409 here can only mean that the category already has a budget this month (for example,
// created from another tab), so the generic conflict text is replaced by a clearer one
function getBudgetSaveErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 409) {
    return 'Esta categoría ya tiene un presupuesto este mes.'
  }
  return getErrorMessage(error)
}

// Connects the form with the mutations: the form itself knows nothing about the API
function BudgetFormModal({ budget, month, availableCategories, onClose }: BudgetFormModalProps) {
  const createMutation = useCreateBudget()
  const updateMutation = useUpdateBudget()
  const toast = useToast()

  const saveMutation = budget ? updateMutation : createMutation

  // Closes the modal and confirms the action with a toast
  function done(message: string) {
    onClose()
    toast.success(message)
  }

  function handleSubmit({ categoryId, amount }: BudgetFormData) {
    if (budget) {
      updateMutation.mutate({ id: budget.id, input: { amount } }, { onSuccess: () => done('Presupuesto actualizado') })
    } else {
      createMutation.mutate({ categoryId, amount, month }, { onSuccess: () => done('Presupuesto creado') })
    }
  }

  return (
    <Modal title={budget ? 'Editar presupuesto' : `Nuevo presupuesto · ${formatMonth(month)}`} onClose={onClose}>
      <BudgetForm
        budget={budget}
        availableCategories={availableCategories}
        isSubmitting={saveMutation.isPending}
        submitError={saveMutation.isError ? getBudgetSaveErrorMessage(saveMutation.error) : undefined}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  )
}

export default BudgetFormModal
