import CategoryIcon from '../../components/CategoryIcon'
import ConfirmDialog from '../../components/ConfirmDialog'
import { useDeleteBudget } from '../../hooks/useBudgetMutations'
import type { Budget } from '../../types/budget'
import { getErrorMessage } from '../../utils/errorMessage'
import { formatMonth } from '../../utils/month'
import { useToast } from '../../hooks/useToast'

interface DeleteBudgetDialogProps {
  budget: Budget
  onClose: () => void
}

function DeleteBudgetDialog({ budget, onClose }: DeleteBudgetDialogProps) {
  const deleteMutation = useDeleteBudget()
  const toast = useToast()

  return (
    <ConfirmDialog
      title="¿Eliminar presupuesto?"
      message={
        <>
          <span className="flex items-center justify-center gap-2 font-medium text-slate-900">
            <CategoryIcon icon={budget.category.icon} color={budget.category.color} />
            {budget.category.name}
          </span>
          <p className="mt-3">
            Solo se elimina el presupuesto de {formatMonth(budget.month).toLowerCase()}. Tus gastos no cambian.
          </p>
        </>
      }
      confirmLabel="Eliminar"
      isConfirming={deleteMutation.isPending}
      error={deleteMutation.isError ? getErrorMessage(deleteMutation.error) : undefined}
      onConfirm={() =>
        deleteMutation.mutate(budget.id, {
          onSuccess: () => {
            onClose()
            toast.success('Presupuesto eliminado')
          },
        })
      }
      onCancel={onClose}
    />
  )
}

export default DeleteBudgetDialog
