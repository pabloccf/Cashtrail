import ConfirmDialog from '../../components/ConfirmDialog'
import TransactionAmount from '../../components/TransactionAmount'
import { useDeleteTransaction } from '../../hooks/useTransactionMutations'
import type { Transaction } from '../../types/transaction'
import { formatDate } from '../../utils/date'
import { getErrorMessage } from '../../utils/errorMessage'

interface DeleteTransactionDialogProps {
  transaction: Transaction
  onClose: () => void
}

// Connects ConfirmDialog with the delete mutation, like TransactionFormModal does with the form.
// Mounted only while open, so each opening starts with a clean mutation state (no old error)
function DeleteTransactionDialog({ transaction, onClose }: DeleteTransactionDialogProps) {
  const deleteMutation = useDeleteTransaction()

  return (
    <ConfirmDialog
      title="¿Eliminar transacción?"
      message={
        <>
          {/* What is going to be deleted, so the user can check it is the right one */}
          <p className="font-medium text-slate-900">
            {transaction.description || transaction.category.name} ·{' '}
            <TransactionAmount amount={transaction.amount} type={transaction.type} />
          </p>
          <p>{formatDate(transaction.date)}</p>
          <p className="mt-3">Esta acción no se puede deshacer.</p>
        </>
      }
      confirmLabel="Eliminar"
      isConfirming={deleteMutation.isPending}
      error={deleteMutation.isError ? getErrorMessage(deleteMutation.error) : undefined}
      onConfirm={() => deleteMutation.mutate(transaction.id, { onSuccess: onClose })}
      onCancel={onClose}
    />
  )
}

export default DeleteTransactionDialog
