import CategoryIcon from '../../components/CategoryIcon'
import ConfirmDialog from '../../components/ConfirmDialog'
import { useDeleteRecurring } from '../../hooks/useRecurringMutations'
import type { RecurringTransaction } from '../../types/recurring'
import { getErrorMessage } from '../../utils/errorMessage'

interface DeleteRecurringDialogProps {
  recurring: RecurringTransaction
  onClose: () => void
}

function DeleteRecurringDialog({ recurring, onClose }: DeleteRecurringDialogProps) {
  const deleteMutation = useDeleteRecurring()

  return (
    <ConfirmDialog
      title="¿Eliminar fijo?"
      message={
        <>
          <span className="flex items-center justify-center gap-2 font-medium text-slate-900">
            <CategoryIcon icon={recurring.category.icon} color={recurring.category.color} />
            {recurring.description}
          </span>
          <p className="mt-3">
            Los registros ya confirmados se quedan en tu historial. Los pendientes de confirmar se eliminarán.
          </p>
        </>
      }
      confirmLabel="Eliminar"
      isConfirming={deleteMutation.isPending}
      error={deleteMutation.isError ? getErrorMessage(deleteMutation.error) : undefined}
      onConfirm={() => deleteMutation.mutate(recurring.id, { onSuccess: onClose })}
      onCancel={onClose}
    />
  )
}

export default DeleteRecurringDialog
